use crate::db;
use crate::lang;
use crate::models::db::user::ClaimsUser;
use crate::models::net::article::*;
use crate::response;
use crate::util;

use actix_web::{get, web, HttpResponse, Responder};
use deadpool_postgres::{Client, Pool};

#[get("/article/system/list/")]
pub async fn get_articles(
    db_pool: web::Data<Pool>,
    query: web::Query<GetArticlesRequest>,
    _: ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::article::get_fetch_articles_error();
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
        Ok(articles) => HttpResponse::Ok().json(GetArticlesResponse::new(articles)),
        Err(_) => response::article::get_fetch_articles_error(),
    }
}

#[get("/article/system/single/{article_id}/")]
pub async fn get_full_article(
    db_pool: web::Data<Pool>,
    web::Path(article_id): web::Path<i32>,
    query: web::Query<GetFullArticleQuery>,
    _: ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::article::get_fetch_article_error();
        }
    };

    if let Some(true) = query.only_edit_info {
        return match db::article::system::get_system_article_for_edit(&client, &article_id).await {
            Ok(article_opt) => match article_opt {
                Some(article) => HttpResponse::Ok().json(GetEditArticleResponse::new(article)),
                None => response::article::get_article_not_found(),
            },
            Err(_) => response::article::get_fetch_article_error(),
        };
    }

    match db::article::system::get_system_article(&client, &article_id).await {
        Ok(article_opt) => match article_opt {
            Some(article) => HttpResponse::Ok().json(GetFullArticleResponse::new(article)),
            None => response::article::get_article_not_found(),
        },
        Err(_) => response::article::get_fetch_article_error(),
    }
}
