pub mod data;

use crate::auth::*;
use crate::db;
use crate::models;
use crate::response::*;
use crate::util;

use actix_web::{get, patch, post, web, HttpResponse, Responder};
use deadpool_postgres::{Client, Pool};

#[get("/user/")]
pub async fn get_users(
    db_pool: web::Data<Pool>,
    query: web::Query<models::net::GetUsersRequest>,
    _: models::db::ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return user_res::get_fetch_users_error();
        }
    };

    let offset = util::get_default_offset(&query.offset);

    let result = db::user::get_users(&client, offset).await;

    match result {
        Ok(users) => HttpResponse::Ok().json(models::net::GetUsersResponse::new(users)),
        Err(_) => user_res::get_fetch_users_error(),
    }
}

#[get("/user/")]
pub async fn get_user(
    db_pool: web::Data<Pool>,
    auth_user: models::db::ClaimsUser,
) -> impl Responder {
    let client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return user_res::get_fetch_users_error();
        }
    };

    let result = db::user::get_user_by_id(&client, &auth_user.id).await;

    match result {
        Ok(user_opt) => match user_opt {
            Some(user) => HttpResponse::Ok().json(models::net::GetUserResponse::new(user)),
            None => user_res::get_fetch_users_error(),
        },
        Err(_) => user_res::get_fetch_users_error(),
    }
}

#[post("/user/reg/")]
pub async fn register(
    db_pool: web::Data<Pool>,
    mut json: web::Json<models::net::RegisterRequest>,
) -> impl Responder {
    let mut client: Client = db_pool
        .get()
        .await
        .expect("Error connecting to the database");

    let existing_user_result = db::user::get_user(&client, &json.username).await;
    if let Ok(user_opt) = existing_user_result {
        if user_opt.is_some() {
            return user_res::get_user_exists_error();
        }
    }

    if let Err(err) = handle_pass_hash(&mut json) {
        eprintln!("{}", err);
        return user_res::get_registration_error();
    };

    let create_result = db::user::create_user(
        &mut client,
        &json.username,
        &json.display_name,
        &json.password,
        &json.study_lang,
        &json.display_lang,
    )
    .await;

    match create_result {
        Ok(user) => HttpResponse::Created().json(models::net::RegisterResponse::new(user)),
        Err(_) => user_res::get_registration_error(),
    }
}

#[post("/user/auth/")]
pub async fn auth(_: models::db::ClaimsUser) -> impl Responder {
    get_success()
}

#[post("/user/log/")]
pub async fn login(
    db_pool: web::Data<Pool>,
    json: web::Json<models::net::LoginRequest>,
) -> impl Responder {
    let client: Client = db_pool
        .get()
        .await
        .expect("Error connecting to the database");

    let get_user_result = db::user::get_user(&client, &json.username).await;
    let user = match get_user_result {
        Ok(user_opt) => match user_opt {
            Some(user) => user,
            None => return user_res::get_auth_failed_error(),
        },
        Err(_) => return user_res::get_auth_failed_error(),
    };

    let token = match attempt_user_login(json, &user) {
        Ok(token) => token,
        Err(_) => return user_res::get_auth_failed_error(),
    };

    let new_refresh_token = util::get_rand_str(256);

    let update_refresh_result = db::user::update_user(
        &client,
        &user.id,
        &models::db::UpdateUserOpt {
            refresh_token: Some(new_refresh_token.clone()),
            ..models::db::UpdateUserOpt::none()
        },
    )
    .await;

    match update_refresh_result {
        Ok(_) => HttpResponse::Ok().json(models::net::LoginResponse {
            token,
            refresh_token: new_refresh_token,
        }),
        Err(err) => {
            eprintln!("{}", err);
            user_res::get_auth_failed_error()
        }
    }
}

#[post("/user/refresh/")]
pub async fn refresh(
    db_pool: web::Data<Pool>,
    json: web::Json<models::net::RefreshRequest>,
) -> impl Responder {
    let token_user = match check_can_refresh_token(&json.token[..]) {
        Ok(user) => user,
        Err(err) => {
            eprintln!("{}", err);
            return user_res::get_auth_failed_error();
        }
    };

    let client: Client = db_pool
        .get()
        .await
        .expect("Error connecting to the database");

    let result = db::user::get_user_by_id(&client, &token_user.id).await;
    let user = match result {
        Ok(user_opt) => match user_opt {
            Some(user) => user,
            None => return user_res::get_auth_failed_error(),
        },
        Err(_) => return user_res::get_auth_failed_error(),
    };

    if user.username != token_user.username || user.refresh_token != json.refresh_token {
        return user_res::get_auth_failed_error();
    }

    let token = get_token(&user);

    HttpResponse::Ok().json(models::net::RefreshResponse { token })
}

#[patch("/user/")]
pub async fn update_user(
    db_pool: web::Data<Pool>,
    json: web::Json<models::net::UpdateUserRequest>,
    auth_user: models::db::ClaimsUser,
) -> impl Responder {
    let client: Client = db_pool
        .get()
        .await
        .expect("Error connecting to the database");

    let result = db::user::update_user(
        &client,
        &auth_user.id,
        &models::db::UpdateUserOpt::from_req(json.into_inner()),
    )
    .await;

    match result {
        Ok(()) => get_success(),
        Err(err) => {
            eprintln!("{}", err);
            user_res::get_user_update_error()
        }
    }
}
