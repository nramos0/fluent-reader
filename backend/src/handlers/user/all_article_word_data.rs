use crate::db;
use crate::models::db::all_article_word_data::*;
use crate::models::db::user::ClaimsUser;
use crate::models::net::all_article_word_data::*;
use crate::response;
use crate::response::get_success;

use actix_web::{get, post, put, web, HttpResponse, Responder};
use deadpool_postgres::{Client, Pool};
use futures::future;

#[put("/user/all_article_word_data/insert_articles/")]
pub async fn insert_articles(
    db_pool: web::Data<Pool>,
    json: web::Json<InsertArticlesRequest>,
    auth_user: ClaimsUser,
) -> impl Responder {
    let mut client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::get_insert_article_word_data_error();
        }
    };

    let trans = match client.transaction().await {
        Ok(trans) => trans,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::get_insert_article_word_data_error();
        }
    };

    if let Err(err) = db::user::all_article_word_data::insert_articles(
        &trans,
        &auth_user.id,
        &json.article_id_list,
        &json.lang,
    )
    .await
    {
        eprintln!("{}", err);
        return response::user::get_insert_article_word_data_error();
    }

    if let Err(err) = trans.commit().await {
        eprintln!("{}", err);
        return response::user::get_insert_article_word_data_error();
    }

    get_success()
}

#[get("/user/all_article_word_data/")]
pub async fn get_user_all_article_word_data(
    db_pool: web::Data<Pool>,
    auth_user: ClaimsUser,
) -> impl Responder {
    let mut client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::get_fetch_article_word_data_error();
        }
    };

    let trans = match client.transaction().await {
        Ok(trans) => trans,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::get_fetch_article_word_data_error();
        }
    };

    let data = match db::user::all_article_word_data::get_user_all_article_word_data(
        &trans,
        &auth_user.id,
    )
    .await
    {
        Ok(data) => data,
        Err(_) => return response::user::get_fetch_article_word_data_error(),
    };

    if let Err(err) = trans.commit().await {
        eprintln!("{}", err);
        return response::user::get_fetch_article_word_data_error();
    }

    HttpResponse::Ok().json(data)
}

#[post("/user/all_article_word_data/word_status_counts/")]
pub async fn get_article_list_word_status_counts(
    db_pool: web::Data<Pool>,
    json: web::Json<GetArticleListWordCountDataRequest>,
    auth_user: ClaimsUser,
) -> impl Responder {
    let mut client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::get_fetch_article_word_data_error();
        }
    };

    let trans = match client.transaction().await {
        Ok(trans) => trans,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::get_fetch_article_word_data_error();
        }
    };

    if let Err(err) = db::user::all_article_word_data::insert_articles(
        &trans,
        &auth_user.id,
        &json.article_id_list,
        &json.lang,
    )
    .await
    {
        eprintln!("{}", err);
        return response::user::get_insert_article_word_data_error();
    }

    let GetArticleListWordCountDataRequest {
        article_id_list,
        lang,
    } = json.0;

    let check_article_list_visible_fut =
        crate::db::article::check_article_list_visible(&trans, &auth_user.id, &article_id_list[..]);
    let all_article_word_data_fut =
        db::user::all_article_word_data::get_user_all_article_word_data(&trans, &auth_user.id);

    let (_, all_article_word_data_outer) =
        match future::try_join(check_article_list_visible_fut, all_article_word_data_fut).await {
            Ok(data) => data,
            Err(err) => {
                eprintln!("{}", err);
                return response::user::get_fetch_article_word_data_error();
            }
        };

    let all_article_word_counts_lang = all_article_word_data_outer
        .all_article_word_data
        .as_object()
        .unwrap()
        .get(&lang)
        .unwrap()
        .as_object()
        .unwrap()
        .get("article_word_counts")
        .unwrap()
        .as_object()
        .unwrap();

    let word_status_count_list = article_id_list
        .iter()
        .map(|id| {
            let article_word_count_data =
                all_article_word_counts_lang.get(&id.to_string()).unwrap();

            let new_count = article_word_count_data
                .get("new")
                .unwrap()
                .as_i64()
                .unwrap();
            let learning_count = article_word_count_data
                .get("learning")
                .unwrap()
                .as_i64()
                .unwrap();
            let known_count = article_word_count_data
                .get("known")
                .unwrap()
                .as_i64()
                .unwrap();

            WordStatusCountInfo {
                new: new_count,
                learning: learning_count,
                known: known_count,
                total: new_count + learning_count + known_count,
                article_id: *id,
            }
        })
        .collect::<Vec<WordStatusCountInfo>>();

    HttpResponse::Ok().json(GetArticleListWordCountDataResponse {
        word_status_count_list,
    })
}
