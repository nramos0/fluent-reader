use crate::db;
use crate::lang;
use crate::models;
use crate::response::*;
use crate::util;

use actix_web::{get, web, HttpResponse, Responder};
use deadpool_postgres::{Client, Pool};

#[get("/article/system/list/")]
pub async fn get_articles(
    db_pool: web::Data<Pool>,
    query: web::Query<models::net::GetArticlesRequest>,
    _: models::db::ClaimsUser,
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

    let result = db::article::system::get_system_article_list(
        &client,
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

#[get("/article/system/single/{article_id}/")]
pub async fn get_full_article(
    db_pool: web::Data<Pool>,
    web::Path(article_id): web::Path<i32>,
    query: web::Query<models::net::GetFullArticleQuery>,
    _: models::db::ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return article_res::get_fetch_article_error();
        }
    };

    if let Some(true) = query.only_edit_info {
        return match db::article::system::get_system_article_for_edit(&client, &article_id).await {
            Ok(article_opt) => match article_opt {
                Some(article) => {
                    HttpResponse::Ok().json(models::net::GetEditArticleResponse::new(article))
                }
                None => article_res::get_article_not_found(),
            },
            Err(_) => article_res::get_fetch_article_error(),
        };
    }

    match db::article::system::get_system_article(&client, &article_id).await {
        Ok(article_opt) => match article_opt {
            Some(article) => {
                HttpResponse::Ok().json(models::net::GetFullArticleResponse::new(article))
            }
            None => article_res::get_article_not_found(),
        },
        Err(_) => article_res::get_fetch_article_error(),
    }
}
