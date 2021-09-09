pub mod save_data;

use crate::db;
use crate::lang;
use crate::models;
use crate::response::*;
use crate::util;

use actix_web::{delete, get, web, HttpResponse, Responder};
use deadpool_postgres::{Client, Pool};

#[get("/article/user/list/")]
pub async fn get_single_user_article_list(
    db_pool: web::Data<Pool>,
    query: web::Query<models::net::GetUserArticlesRequest>,
    auth_user: models::db::ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return article_res::get_fetch_articles_error();
        }
    };

    let req_user_id = auth_user.id;

    let target_user_id = match query.user_id {
        Some(user_id) => user_id,
        None => auth_user.id,
    };

    let offset = util::get_default_offset(&query.offset);

    let search_query_opt = lang::get_or_query_string(&query.search, &query.lang);

    let result = db::article::user::get_user_uploaded_article_list(
        &client,
        &req_user_id,
        &target_user_id,
        offset,
        &query.lang,
        &search_query_opt,
        &query.limit,
    )
    .await;

    match result {
        Ok(articles) => HttpResponse::Ok().json(models::net::GetArticlesResponse::new(articles)),
        Err(_) => article_res::get_fetch_articles_error(),
    }
}

#[get("/article/user/all/list/")]
pub async fn get_all_user_article_list(
    db_pool: web::Data<Pool>,
    query: web::Query<models::net::GetArticlesRequest>,
    auth_user: models::db::ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return article_res::get_fetch_articles_error();
        }
    };

    let req_user_id = &auth_user.id;

    let offset = util::get_default_offset(&query.offset);

    let search_query_opt = lang::get_or_query_string(&query.search, &query.lang);

    let result = db::article::user::get_all_user_uploaded_article_list(
        &client,
        req_user_id,
        offset,
        &query.lang,
        &search_query_opt,
        &query.limit,
    )
    .await;

    match result {
        Ok(articles) => HttpResponse::Ok().json(models::net::GetArticlesResponse::new(articles)),
        Err(_) => article_res::get_fetch_articles_error(),
    }
}

#[get("/article/user/single/{article_id}/")]
pub async fn get_full_article(
    db_pool: web::Data<Pool>,
    web::Path(article_id): web::Path<i32>,
    query: web::Query<models::net::GetFullArticleQuery>,
    auth_user: models::db::ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return article_res::get_fetch_article_error();
        }
    };

    if let Some(true) = query.only_edit_info {
        return match db::article::user::get_user_article_for_edit(
            &client,
            &article_id,
            &auth_user.id,
        )
        .await
        {
            Ok(article_opt) => match article_opt {
                Some(article) => {
                    HttpResponse::Ok().json(models::net::GetEditArticleResponse::new(article))
                }
                None => article_res::get_article_not_found(),
            },
            Err(_) => article_res::get_fetch_article_error(),
        };
    }

    match db::article::user::get_user_article(&client, &article_id, &auth_user.id).await {
        Ok(article_opt) => match article_opt {
            Some(article) => {
                HttpResponse::Ok().json(models::net::GetFullArticleResponse::new(article))
            }
            None => article_res::get_article_not_found(),
        },
        Err(_) => article_res::get_fetch_article_error(),
    }
}

#[delete("/article/user/single/{article_id}/")]
pub async fn delete_article(
    db_pool: web::Data<Pool>,
    web::Path(article_id): web::Path<i32>,
    auth_user: models::db::ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return article_res::get_delete_article_error();
        }
    };

    let result = db::article::user::user_delete_article(&client, &auth_user.id, &article_id).await;

    match result {
        Ok(()) => get_success(),
        Err(_) => article_res::get_delete_article_error(),
    }
}

#[get("/article/user/saved/list/")]
pub async fn get_saved_article_list(
    db_pool: web::Data<Pool>,
    query: web::Query<models::net::GetArticlesRequest>,
    auth_user: models::db::ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return article_res::get_fetch_articles_error();
        }
    };

    let offset = util::get_default_offset(&query.offset);

    let search_query_opt = lang::get_or_query_string(&query.search, &query.lang);

    let result = db::article::user::get_user_saved_article_list(
        &client,
        &auth_user.id,
        offset,
        &query.lang,
        &search_query_opt,
        &query.limit,
    )
    .await;

    match result {
        Ok(articles) => HttpResponse::Ok().json(models::net::GetArticlesResponse::new(articles)),
        Err(_) => article_res::get_fetch_articles_error(),
    }
}
