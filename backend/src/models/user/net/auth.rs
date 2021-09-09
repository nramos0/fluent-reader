use super::super::db::*;
use serde::{Deserialize, Serialize};

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
