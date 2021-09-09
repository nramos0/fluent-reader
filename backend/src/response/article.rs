use crate::models::net::ErrorResponse;
use actix_web::HttpResponse;

use super::*;

#[inline]
pub fn get_fetch_articles_error() -> HttpResponse {
    get_error("article_list_get_fail")
}

#[inline]
pub fn get_fetch_article_error() -> HttpResponse {
    get_error("article_get_fail")
}

#[inline]
pub fn get_save_article_error() -> HttpResponse {
    get_error("article_save_fail")
}

#[inline]
pub fn get_save_article_exists_error() -> HttpResponse {
    HttpResponse::Conflict().json(ErrorResponse {
        error: "article_save_exists",
    })
}

#[inline]
pub fn get_delete_article_error() -> HttpResponse {
    get_error("article_delete_fail")
}

#[inline]
pub fn get_article_not_found() -> HttpResponse {
    get_not_found("article_not_found")
}

#[inline]
pub fn get_create_article_error() -> HttpResponse {
    get_error("article_create_fail")
}

#[inline]
pub fn get_edit_article_error() -> HttpResponse {
    get_error("article_edit_fail")
}

#[inline]
pub fn get_edit_article_missing_error() -> HttpResponse {
    get_error("article_missing")
}
