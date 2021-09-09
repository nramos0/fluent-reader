use actix_web::error::ErrorUnauthorized;
use actix_web::{dev, Error, FromRequest, HttpRequest};
use futures_util::future::{err, ok, Ready};
use serde::{Deserialize, Serialize};
use std::time::SystemTime;

use super::db::*;

#[derive(Serialize, Deserialize)]
pub struct ClaimsUser {
    pub id: i32,
    pub username: String,
    pub created_on: SystemTime,
    pub study_lang: String,
    pub display_lang: String,
}

impl ClaimsUser {
    #[inline]
    pub fn from_user(user: &User) -> ClaimsUser {
        ClaimsUser {
            id: user.id,
            username: user.username.clone(),
            created_on: user.created_on,
            study_lang: user.study_lang.clone(),
            display_lang: user.display_lang.clone(),
        }
    }
}

impl FromRequest for ClaimsUser {
    type Error = Error;
    type Future = Ready<Result<Self, Self::Error>>;
    type Config = ();

    #[inline]
    fn from_request(req: &HttpRequest, _: &mut dev::Payload) -> Self::Future {
        match crate::auth::attempt_req_token_auth(req) {
            Ok(user) => ok(user),
            Err(error) => {
                eprintln!("{}", error);
                err(ErrorUnauthorized("auth_fail"))
            }
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct TokenClaims {
    pub exp: usize,
    pub user: ClaimsUser,
}
