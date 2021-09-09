use crate::db;
use crate::models::db::user::ClaimsUser;
use crate::models::net::article::*;
use crate::response;
use crate::response::get_success;

use actix_web::{delete, put, web, Responder};
use deadpool_postgres::{Client, Pool};

#[put("/article/user/saved/single/")]
pub async fn save_article(
    db_pool: web::Data<Pool>,
    json: web::Json<ArticleRequest>,
    auth_user: ClaimsUser,
) -> impl Responder {
    let mut client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::article::get_save_article_error();
        }
    };

    let trans = match client.transaction().await {
        Ok(trans) => trans,
        Err(err) => {
            eprintln!("{}", err);
            return response::article::get_save_article_error();
        }
    };

    let result =
        db::article::user::user_save_article(&trans, &auth_user.id, &json.article_id).await;

    if let Err(err) = trans.commit().await {
        eprintln!("{}", err);
        return response::article::get_save_article_error();
    }

    match result {
        Ok(()) => get_success(),
        Err(err) => {
            if err == "exists" {
                response::article::get_save_article_exists_error()
            } else {
                response::article::get_save_article_error()
            }
        }
    }
}

#[delete("/article/user/saved/single/")]
pub async fn remove_saved_article(
    db_pool: web::Data<Pool>,
    json: web::Json<ArticleRequest>,
    auth_user: ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::article::get_delete_article_error();
        }
    };

    let result =
        db::article::user::user_delete_saved_article(&client, &auth_user.id, &json.article_id)
            .await;

    match result {
        Ok(()) => get_success(),
        Err(_) => response::article::get_delete_article_error(),
    }
}
