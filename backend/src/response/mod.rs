pub mod article;
pub mod user;

use crate::models::net::{ErrorResponse, Message};
use actix_web::HttpResponse;

#[inline]
pub fn get_error(error: &'static str) -> HttpResponse {
    HttpResponse::InternalServerError().json(ErrorResponse { error })
}

#[inline]
pub fn get_not_found(error: &'static str) -> HttpResponse {
    HttpResponse::NotFound().json(ErrorResponse { error })
}

#[inline]
pub fn get_success_with_message(message: &'static str) -> HttpResponse {
    HttpResponse::Ok().json(Message { message })
}

#[inline]
pub fn get_success() -> HttpResponse {
    get_success_with_message("success")
}
