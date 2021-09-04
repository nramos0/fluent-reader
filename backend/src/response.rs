use crate::models::gen::net::{ErrorResponse, Message};
use actix_web::HttpResponse;

#[inline]
pub fn get_error(error: &'static str) -> HttpResponse {
    HttpResponse::InternalServerError().json(ErrorResponse { error })
}

#[inline]
pub fn get_not_found(error: &'static str) -> HttpResponse {
    HttpResponse::NotFound().json(ErrorResponse { error })
}

pub mod user_res {
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
}

pub mod article_res {
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
}

#[inline]
pub fn get_success_with_message(message: &'static str) -> HttpResponse {
    HttpResponse::Ok().json(Message { message })
}

#[inline]
pub fn get_success() -> HttpResponse {
    get_success_with_message("success")
}
