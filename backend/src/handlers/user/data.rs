use crate::db;
use crate::models::db::user::*;
use crate::models::net::user_data::*;
use crate::response;
use crate::response::get_success;

use actix_web::{delete, get, post, put, web, HttpResponse, Responder};
use deadpool_postgres::{Client, Pool};

#[get("/user/data/")]
pub async fn get_user_word_data(db_pool: web::Data<Pool>, auth_user: ClaimsUser) -> impl Responder {
    let mut client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::get_fetch_data_error();
        }
    };

    let trans = match client.transaction().await {
        Ok(trans) => trans,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::get_update_word_status_error();
        }
    };

    let result = db::user::word_data::get_user_word_data(&trans, &auth_user.id).await;

    if let Err(err) = trans.commit().await {
        eprintln!("{}", err);
        return response::user::get_update_word_status_error();
    }

    match result {
        Ok(data) => HttpResponse::Ok().json(GetWordDataResponse::new(data)),
        Err(_) => response::user::get_fetch_data_error(),
    }
}

#[put("/user/data/status/")]
pub async fn update_word_status(
    db_pool: web::Data<Pool>,
    json: web::Json<UpdateWordStatusRequest>,
    auth_user: ClaimsUser,
) -> impl Responder {
    let mut client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::get_update_word_status_error();
        }
    };

    let trans = match client.transaction().await {
        Ok(trans) => trans,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::get_update_word_status_error();
        }
    };

    let word_list = [&json.word[..]];

    if let Err(err) = db::user::all_article_word_data::change_word_list_status(
        &trans,
        &auth_user.id,
        &word_list,
        &json.status,
        &json.lang,
    )
    .await
    {
        eprintln!("{}", err);
        return response::user::get_update_word_status_error();
    }

    let result = db::user::word_data::update_word_status(
        &trans,
        &auth_user.id,
        &json.lang,
        &json.word,
        &json.status,
    )
    .await;

    if let Err(err) = trans.commit().await {
        eprintln!("{}", err);
        return response::user::get_update_word_status_error();
    }

    match result {
        Ok(()) => get_success(),
        Err(_) => response::user::get_update_word_status_error(),
    }
}

#[put("/user/data/status/batch/")]
pub async fn batch_update_word_status(
    db_pool: web::Data<Pool>,
    json: web::Json<BatchUpdateWordStatusRequest>,
    auth_user: ClaimsUser,
) -> impl Responder {
    let mut client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::get_update_word_status_error();
        }
    };

    let trans = match client.transaction().await {
        Ok(trans) => trans,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::get_update_word_status_error();
        }
    };

    let mut word_list: Vec<_> = json.words.iter().map(|word| &word[..]).collect();
    word_list.sort_unstable();
    word_list.dedup();

    if let Err(err) = db::user::all_article_word_data::change_word_list_status(
        &trans,
        &auth_user.id,
        &word_list,
        &json.status,
        &json.lang,
    )
    .await
    {
        eprintln!("{}", err);
        return response::user::get_update_word_status_error();
    }

    if let Err(err) = db::user::word_data::batch_update_word_status(
        &trans,
        &auth_user.id,
        &json.lang,
        &json.words,
        &json.status,
    )
    .await
    {
        eprintln!("{}", err);
        return response::user::get_update_word_status_error();
    }

    if let Err(err) = trans.commit().await {
        eprintln!("{}", err);
        return response::user::get_update_word_status_error();
    }

    get_success()
}

#[put("/user/data/definition/")]
pub async fn update_word_definition(
    db_pool: web::Data<Pool>,
    json: web::Json<UpdateWordDefinitionRequest>,
    auth_user: ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::get_update_word_definition_error();
        }
    };

    let result = db::user::word_data::update_word_definition(
        &client,
        &auth_user.id,
        &json.lang,
        &json.word,
        &json.definition,
    )
    .await;

    match result {
        Ok(()) => get_success(),
        Err(_) => response::user::get_update_word_definition_error(),
    }
}

#[post("/user/data/read/{article_id}/")]
pub async fn create_read_data(
    db_pool: web::Data<Pool>,
    web::Path(article_id): web::Path<i32>,
    auth_user: ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::get_create_read_data_error();
        }
    };

    let result = db::user::word_data::create_read_data(&client, &auth_user.id, &article_id).await;

    match result {
        Ok(_) => get_success(),
        Err(err) => {
            if err == "exists" {
                response::user::get_read_data_exists_error()
            } else {
                response::user::get_create_read_data_error()
            }
        }
    }
}

#[get("/user/data/read/{article_id}/")]
pub async fn get_read_data(
    db_pool: web::Data<Pool>,
    web::Path(article_id): web::Path<i32>,
    auth_user: ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::get_fetch_read_data_error();
        }
    };

    let result = db::user::word_data::get_read_data(&client, &auth_user.id, &article_id).await;

    let read_data = match result {
        Ok(read_data) => read_data,
        Err(get_read_data_err) => {
            if get_read_data_err != "missing" {
                eprintln!("{}", get_read_data_err);
                return response::user::get_fetch_read_data_error();
            }

            let create_read_data_result =
                db::user::word_data::create_read_data(&client, &auth_user.id, &article_id).await;

            match create_read_data_result {
                Ok(read_data) => read_data,
                Err(create_read_data_err) => {
                    if create_read_data_err == "exists" {
                        return response::user::get_read_data_exists_error();
                    } else {
                        return response::user::get_create_read_data_error();
                    }
                }
            }
        }
    };

    HttpResponse::Ok().json(GetReadDataResponse::new(read_data))
}

#[post("/user/data/mark_article/")]
pub async fn mark_article(
    db_pool: web::Data<Pool>,
    json: web::Json<MarkArticleRequest>,
    auth_user: ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::get_mark_article_error();
        }
    };

    let result =
        db::user::word_data::mark_article(&client, &auth_user.id, &json.article_id, &json.mark)
            .await;

    match result {
        Ok(()) => get_success(),
        Err(err) => {
            eprintln!("{}", err);
            response::user::get_mark_article_error()
        }
    }
}

#[delete("/user/data/mark_article/")]
pub async fn delete_mark(
    db_pool: web::Data<Pool>,
    json: web::Json<DeleteMarkRequest>,
    auth_user: ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::user::delete_mark_error();
        }
    };

    let result =
        db::user::word_data::delete_mark(&client, auth_user.id, json.article_id, json.index).await;

    match result {
        Ok(()) => get_success(),
        Err(err) => {
            eprintln!("{}", err);
            response::user::delete_mark_error()
        }
    }
}
