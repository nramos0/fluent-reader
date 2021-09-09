use crate::db;
use crate::models;
use crate::response::*;

use actix_web::{delete, put, web, Responder};
use deadpool_postgres::{Client, Pool};

#[put("/article/user/saved/single/")]
pub async fn save_article(
    db_pool: web::Data<Pool>,
    json: web::Json<models::net::ArticleRequest>,
    auth_user: models::db::ClaimsUser,
) -> impl Responder {
    let mut client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return article_res::get_save_article_error();
        }
    };

    let trans = match client.transaction().await {
        Ok(trans) => trans,
        Err(err) => {
            eprintln!("{}", err);
            return article_res::get_save_article_error();
        }
    };

    let result =
        db::article::user::user_save_article(&trans, &auth_user.id, &json.article_id).await;

    if let Err(err) = trans.commit().await {
        eprintln!("{}", err);
        return article_res::get_save_article_error();
    }

    match result {
        Ok(()) => get_success(),
        Err(err) => {
            if err == "exists" {
                article_res::get_save_article_exists_error()
            } else {
                article_res::get_save_article_error()
            }
        }
    }
}

#[delete("/article/user/saved/single/")]
pub async fn remove_saved_article(
    db_pool: web::Data<Pool>,
    json: web::Json<models::net::ArticleRequest>,
    auth_user: models::db::ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return article_res::get_delete_article_error();
        }
    };

    let result =
        db::article::user::user_delete_saved_article(&client, &auth_user.id, &json.article_id)
            .await;

    match result {
        Ok(()) => get_success(),
        Err(_) => article_res::get_delete_article_error(),
    }
}
