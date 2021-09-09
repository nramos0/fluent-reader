use crate::models::db::user::*;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct GetUsersRequest {
    pub offset: Option<i64>,
}

#[derive(Serialize)]
pub struct GetUsersResponse {
    pub users: Vec<SimpleUser>,
    pub count: i64,
}

impl GetUsersResponse {
    #[inline]
    pub fn new(users: Vec<SimpleUser>) -> GetUsersResponse {
        let count = users.len() as i64;
        GetUsersResponse { users, count }
    }
}

#[derive(Serialize)]
pub struct GetUserResponse {
    pub user: SimpleUser,
}

impl GetUserResponse {
    #[inline]
    pub fn new(user: User) -> GetUserResponse {
        GetUserResponse {
            user: SimpleUser::new(user),
        }
    }
}

#[derive(Deserialize)]
pub struct UpdateUserRequest {
    pub username: Option<String>,
    pub display_name: Option<String>,
    pub password: Option<String>,
    pub study_lang: Option<String>,
    pub display_lang: Option<String>,
}

#[derive(Deserialize)]
pub struct RegisterRequest {
    pub username: String,
    pub display_name: String,
    pub password: String,
    pub study_lang: String,
    pub display_lang: String,
}

#[derive(Serialize)]
pub struct RegisterResponse {
    pub user: SimpleUser,
}

impl RegisterResponse {
    #[inline]
    pub fn new(user: SimpleUser) -> RegisterResponse {
        RegisterResponse { user }
    }
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub refresh_token: String,
}

#[derive(Deserialize)]
pub struct RefreshRequest {
    pub token: String,
    pub refresh_token: String,
}

#[derive(Serialize)]
pub struct RefreshResponse {
    pub token: String,
}
