use serde::{Deserialize, Serialize};
use std::time::SystemTime;
use tokio_pg_mapper_derive::PostgresMapper;

use super::net;

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

    pub fn from_req(req: net::UpdateUserRequest) -> Self {
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
