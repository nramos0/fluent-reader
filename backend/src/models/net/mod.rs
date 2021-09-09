pub mod article;
pub mod user;
pub mod user_data;

use serde::Serialize;

#[derive(Serialize)]
pub struct StatusResponse {
    pub status: String,
}

#[derive(Serialize)]
pub struct ResultResponse {
    pub success: bool,
}

#[derive(Serialize)]
pub struct Message {
    pub message: &'static str,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: &'static str,
}
