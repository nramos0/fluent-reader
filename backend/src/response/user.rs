use crate::models::net::ErrorResponse;
use actix_web::HttpResponse;

use super::*;

#[inline]
pub fn get_fetch_users_error() -> HttpResponse {
    get_error("user_get_fail")
}

#[inline]
pub fn get_fetch_data_error() -> HttpResponse {
    get_error("user_data_get_fail")
}

#[inline]
pub fn get_user_update_error() -> HttpResponse {
    get_error("user_update_fail")
}

#[inline]
pub fn get_update_word_status_error() -> HttpResponse {
    get_error("user_update_word_status_fail")
}

#[inline]
pub fn get_update_word_definition_error() -> HttpResponse {
    get_error("user_update_word_definition_fail")
}

#[inline]
pub fn get_registration_error() -> HttpResponse {
    get_error("reg_fail")
}

#[inline]
pub fn get_user_exists_error() -> HttpResponse {
    HttpResponse::Conflict().json(ErrorResponse {
        error: "user_exists",
    })
}

#[inline]
pub fn get_auth_failed_error() -> HttpResponse {
    HttpResponse::Unauthorized().json(ErrorResponse { error: "auth_fail" })
}

#[inline]
pub fn get_fetch_read_data_error() -> HttpResponse {
    get_error("fetch_read_data_fail")
}

#[inline]
pub fn get_create_read_data_error() -> HttpResponse {
    get_error("create_read_data_fail")
}

#[inline]
pub fn get_read_data_exists_error() -> HttpResponse {
    HttpResponse::Conflict().json(ErrorResponse {
        error: "read_data_exists",
    })
}

#[inline]
pub fn get_mark_article_error() -> HttpResponse {
    get_error("mark_article_fail")
}

#[inline]
pub fn delete_mark_error() -> HttpResponse {
    get_error("delete_mark_error")
}

#[inline]
pub fn get_insert_article_word_data_error() -> HttpResponse {
    get_error("insert_article_word_data_error")
}

#[inline]
pub fn get_fetch_article_word_data_error() -> HttpResponse {
    get_error("fetch_article_word_data_error")
}
