use serde::{Deserialize, Serialize};
use std::time::SystemTime;
use tokio_pg_mapper_derive::PostgresMapper;

use actix_web::error::ErrorUnauthorized;
use actix_web::{dev, Error, FromRequest, HttpRequest};
use futures_util::future::{err, ok, Ready};

use crate::models::net::user::*;

#[derive(Serialize, Deserialize, PostgresMapper)]
#[pg_mapper(table = "fruser")]
pub struct User {
    pub id: i32,
    pub username: String,
    pub display_name: String,
    pub pass: String,
    pub created_on: SystemTime,
    pub study_lang: String,
    pub display_lang: String,
    pub refresh_token: String,
}

pub struct UpdateUserOpt {
    pub username: Option<String>,
    pub display_name: Option<String>,
    pub pass: Option<String>,
    pub study_lang: Option<String>,
    pub display_lang: Option<String>,
    pub refresh_token: Option<String>,
}

impl UpdateUserOpt {
    pub fn none() -> Self {
        Self {
            username: None,
            display_name: None,
            pass: None,
            study_lang: None,
            display_lang: None,
            refresh_token: None,
        }
    }

    pub fn from_req(req: UpdateUserRequest) -> Self {
        Self {
            username: req.username,
            display_name: req.display_name,
            pass: req.password,
            study_lang: req.study_lang,
            display_lang: req.display_lang,
            refresh_token: None,
        }
    }
}

#[derive(Serialize, Deserialize, PostgresMapper)]
#[pg_mapper(table = "fruser")]
pub struct SimpleUser {
    pub id: i32,
    pub display_name: String,
    pub study_lang: String,
    pub display_lang: String,
}

impl SimpleUser {
    #[inline]
    pub fn new(user: User) -> SimpleUser {
        SimpleUser {
            id: user.id,
            display_name: user.display_name,
            study_lang: user.study_lang,
            display_lang: user.display_lang,
        }
    }
}

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
