use crate::app_config::CONFIG;
use crate::models;
use crate::models::db::user::*;
use actix_web::{web, HttpRequest};
use argon2::{self, Config as ArgonConfig};
use chrono::Utc;
use jsonwebtoken::{
    dangerous_insecure_decode, decode, encode, DecodingKey, EncodingKey, Header, Validation,
};
use lazy_static::lazy_static;

lazy_static! {
    static ref HASH_CONFIG: ArgonConfig<'static> = ArgonConfig::default();
    static ref ENCODING_KEY: EncodingKey =
        EncodingKey::from_secret(CONFIG.server.secret.as_bytes());
    static ref HEADER: Header = Header::default();
    static ref EXPIRATION_DURATION: chrono::Duration =
        chrono::Duration::seconds(CONFIG.server.token_time);
    static ref DECODING_KEY: DecodingKey<'static> =
        DecodingKey::from_secret(CONFIG.server.secret.as_bytes());
    static ref VALIDATION: Validation = Validation::default();
}

pub fn handle_pass_hash(
    json: &mut web::Json<models::net::user::RegisterRequest>,
) -> Result<(), &'static str> {
    let hash_config = ArgonConfig {
        hash_length: CONFIG.server.pass_hash_length,
        ..ArgonConfig::default()
    };

    let hashed = match argon2::hash_encoded(
        json.password.as_bytes(),
        CONFIG.server.salt.as_bytes(),
        &hash_config,
    ) {
        Ok(hash_result) => hash_result,
        Err(_) => return Err("Failed to hash password"),
    };

    // overwrite the plaintext password memory before dropping it
    // by reassigning the new hashed password string to it
    let password_bytes = unsafe { json.password.as_bytes_mut() };
    for item in password_bytes {
        *item = 0;
    }

    json.password = hashed;

    Ok(())
}

pub fn attempt_user_login(
    json: web::Json<models::net::user::LoginRequest>,
    user: &User,
) -> Result<String, &'static str> {
    let matches = argon2::verify_encoded(&user.pass, json.password.as_bytes()).unwrap();
    if matches {
        Ok(get_token(user))
    } else {
        Err("Password doesn't match")
    }
}

pub fn get_token(user: &User) -> String {
    let claims = TokenClaims {
        user: ClaimsUser::from_user(&user),
        exp: Utc::now()
            .checked_add_signed(*EXPIRATION_DURATION)
            .expect("invalid timestamp")
            .timestamp() as usize,
    };
    encode(&HEADER, &claims, &ENCODING_KEY).unwrap()
}

pub fn attempt_token_auth(token: &str) -> Result<ClaimsUser, jsonwebtoken::errors::Error> {
    match decode::<TokenClaims>(&token, &DECODING_KEY, &VALIDATION) {
        Ok(token_data) => Ok(token_data.claims.user),
        Err(err) => Err(err),
    }
}

pub fn check_can_refresh_token(token: &str) -> Result<ClaimsUser, jsonwebtoken::errors::Error> {
    match attempt_token_auth(token) {
        Ok(user) => Ok(user),
        Err(err) => match err.kind() {
            jsonwebtoken::errors::ErrorKind::ExpiredSignature => {
                match dangerous_insecure_decode::<TokenClaims>(&token) {
                    Ok(token_data) => Ok(token_data.claims.user),
                    Err(err) => Err(err),
                }
            }
            _ => Err(err),
        },
    }
}

pub fn attempt_req_token_auth(req: &HttpRequest) -> Result<ClaimsUser, &'static str> {
    if let Some(header_value) = req.headers().get("authorization") {
        let header_str = header_value.to_str().unwrap_or("");
        if !header_str.starts_with("Bearer ") {
            return Err("Missing bearer");
        }

        let mut split_iter = header_str.split(' ');
        // iterate over "Bearer" string
        split_iter.next().unwrap();

        let token = split_iter.next().unwrap();
        match attempt_token_auth(token) {
            Ok(user) => Ok(user),
            Err(err) => {
                eprintln!("{}", err);
                Err("Decoding failed")
            }
        }
    } else {
        Err("Missing authorization header")
    }
}
