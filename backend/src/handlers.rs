use crate::auth::*;
use crate::db;
use crate::lang;
use crate::models;
use crate::response::*;
use crate::util;

use actix_web::{delete, get, patch, post, put, web, HttpResponse, Responder};
use deadpool_postgres::{Client, Pool};
use std::convert::TryFrom;

#[get("/")]
pub async fn status() -> impl Responder {
    HttpResponse::Ok().json(models::net::StatusResponse {
        status: "Up".to_string(),
    })
}

pub mod user {
    use super::*;

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

    pub mod data {
        use super::*;

        #[get("/user/data/")]
        pub async fn get_user_word_data(
            db_pool: web::Data<Pool>,
            auth_user: models::db::ClaimsUser,
        ) -> impl Responder {
            let client: Client = match db_pool.get().await {
                Ok(client) => client,
                Err(err) => {
                    eprintln!("{}", err);
                    return user_res::get_fetch_data_error();
                }
            };

            let result = db::user::word_data::get_user_word_data(&client, &auth_user.id).await;

            match result {
                Ok(data) => HttpResponse::Ok().json(models::net::GetWordDataResponse::new(data)),
                Err(_) => user_res::get_fetch_data_error(),
            }
        }

        #[put("/user/data/status/")]
        pub async fn update_word_status(
            db_pool: web::Data<Pool>,
            json: web::Json<models::net::UpdateWordStatusRequest>,
            auth_user: models::db::ClaimsUser,
        ) -> impl Responder {
            let client: Client = match db_pool.get().await {
                Ok(client) => client,
                Err(err) => {
                    eprintln!("{}", err);
                    return user_res::get_update_word_status_error();
                }
            };

            let result = db::user::word_data::update_word_status(
                &client,
                &auth_user.id,
                &json.lang,
                &json.word,
                &json.status,
            )
            .await;

            match result {
                Ok(()) => get_success(),
                Err(_) => user_res::get_update_word_status_error(),
            }
        }

        #[put("/user/data/status/batch/")]
        pub async fn batch_update_word_status(
            db_pool: web::Data<Pool>,
            json: web::Json<models::net::BatchUpdateWordStatusRequest>,
            auth_user: models::db::ClaimsUser,
        ) -> impl Responder {
            let client: Client = match db_pool.get().await {
                Ok(client) => client,
                Err(err) => {
                    eprintln!("{}", err);
                    return user_res::get_update_word_status_error();
                }
            };

            let result = db::user::word_data::batch_update_word_status(
                &client,
                &auth_user.id,
                &json.lang,
                &json.words,
                &json.status,
            )
            .await;

            match result {
                Ok(()) => get_success(),
                Err(_) => user_res::get_update_word_status_error(),
            }
        }

        #[put("/user/data/definition/")]
        pub async fn update_word_definition(
            db_pool: web::Data<Pool>,
            json: web::Json<models::net::UpdateWordDefinitionRequest>,
            auth_user: models::db::ClaimsUser,
        ) -> impl Responder {
            let client: Client = match db_pool.get().await {
                Ok(client) => client,
                Err(err) => {
                    eprintln!("{}", err);
                    return user_res::get_update_word_definition_error();
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
                Err(_) => user_res::get_update_word_definition_error(),
            }
        }

        #[post("/user/data/read/{article_id}/")]
        pub async fn create_read_data(
            db_pool: web::Data<Pool>,
            web::Path(article_id): web::Path<i32>,
            auth_user: models::db::ClaimsUser,
        ) -> impl Responder {
            let client: Client = match db_pool.get().await {
                Ok(client) => client,
                Err(err) => {
                    eprintln!("{}", err);
                    return user_res::get_create_read_data_error();
                }
            };

            let result =
                db::user::word_data::create_read_data(&client, &auth_user.id, &article_id).await;

            match result {
                Ok(_) => get_success(),
                Err(err) => {
                    if err == "exists" {
                        user_res::get_read_data_exists_error()
                    } else {
                        user_res::get_create_read_data_error()
                    }
                }
            }
        }

        #[get("/user/data/read/{article_id}/")]
        pub async fn get_read_data(
            db_pool: web::Data<Pool>,
            web::Path(article_id): web::Path<i32>,
            auth_user: models::db::ClaimsUser,
        ) -> impl Responder {
            let client: Client = match db_pool.get().await {
                Ok(client) => client,
                Err(err) => {
                    eprintln!("{}", err);
                    return user_res::get_fetch_read_data_error();
                }
            };

            let result =
                db::user::word_data::get_read_data(&client, &auth_user.id, &article_id).await;

            let read_data = match result {
                Ok(read_data) => read_data,
                Err(get_read_data_err) => {
                    if get_read_data_err != "missing" {
                        eprintln!("{}", get_read_data_err);
                        return user_res::get_fetch_read_data_error();
                    } 

                    let create_read_data_result =
                        db::user::word_data::create_read_data(&client, &auth_user.id, &article_id).await;
                    
                    match create_read_data_result {
                        Ok(read_data) => read_data,
                        Err(create_read_data_err) => {
                            if create_read_data_err == "exists" {
                                return user_res::get_read_data_exists_error()
                            } else {
                                return user_res::get_create_read_data_error()
                            }
                        }
                    }
                }
            };

            HttpResponse::Ok().json(models::net::GetReadDataResponse::new(read_data))
        }

        #[post("/user/data/mark_article/")]
        pub async fn mark_article(
            db_pool: web::Data<Pool>,
            json: web::Json<models::net::MarkArticleRequest>,
            auth_user: models::db::ClaimsUser,
        ) -> impl Responder {
            let client: Client = match db_pool.get().await {
                Ok(client) => client,
                Err(err) => {
                    eprintln!("{}", err);
                    return user_res::get_mark_article_error();
                }
            };

            let result = db::user::word_data::mark_article(
                &client,
                &auth_user.id,
                &json.article_id,
                &json.mark,
            )
            .await;

            match result {
                Ok(()) => get_success(),
                Err(err) => {
                    eprintln!("{}", err);
                    user_res::get_mark_article_error()
                }
            }
        }

        #[delete("/user/data/mark_article/")]
        pub async fn delete_mark(
            db_pool: web::Data<Pool>,
            json: web::Json<models::net::DeleteMarkRequest>,
            auth_user: models::db::ClaimsUser,
        ) -> impl Responder {
            let client: Client = match db_pool.get().await {
                Ok(client) => client,
                Err(err) => {
                    eprintln!("{}", err);
                    return user_res::delete_mark_error();
                }
            };

            let result = db::user::word_data::delete_mark(
                &client,
                auth_user.id,
                json.article_id,
                json.index,
            )
            .await;

            match result {
                Ok(()) => get_success(),
                Err(err) => {
                    eprintln!("{}", err);
                    user_res::delete_mark_error()
                }
            }
        }
    }
}

pub mod article {
    use super::*;

    fn compute_article_content_data(
        content: &str,
        language: &str,
    ) -> models::db::ArticleContentData {
        let words = lang::get_words_owned(content, language);
        let (unique_words, total_word_count, word_index_map, stop_word_map) =
            lang::get_article_main_data(&words[..]);
        let sentences_opt = lang::get_sentences(content, &words[..]);
        let pages = lang::get_pages(&sentences_opt);

        let (sentences, sentence_stops) = match sentences_opt {
            Some((sentences, sentence_stops)) => (
                Some(serde_json::to_value(sentences).unwrap()),
                Some(sentence_stops),
            ),
            None => (None, None),
        };

        models::db::ArticleContentData {
            words,

            unique_words,
            unique_word_count: i32::try_from(total_word_count).ok().unwrap(),

            word_index_map,
            stop_word_map,

            sentences,
            sentence_stops,

            page_data: pages,
        }
    }

    #[post("/article/")]
    pub async fn create_article(
        db_pool: web::Data<Pool>,
        json: web::Json<models::net::NewArticleRequest>,
        auth_user: models::db::ClaimsUser,
    ) -> impl Responder {
        let mut client: Client = match db_pool.get().await {
            Ok(client) => client,
            Err(err) => {
                eprintln!("{}", err);
                return article_res::get_create_article_error();
            }
        };

        let models::net::NewArticleRequest {
            title,
            author,
            content_description,
            language,
            tags,
            content,
            is_private,
        } = json.0;

        let models::db::ArticleContentData {
            words,
            unique_words,
            unique_word_count,
            word_index_map,
            stop_word_map,
            sentences,
            sentence_stops,
            page_data,
        } = compute_article_content_data(&content[..], &language[..]);

        let trans = match client.transaction().await {
            Ok(trans) => trans,
            Err(err) => {
                eprintln!("{}", err);
                return article_res::get_create_article_error();
            }
        };

        let result = db::article::create_article(
            &trans,
            models::db::ArticleMetadata {
                title,
                author,
                uploader_id: auth_user.id,
                content_description,

                is_private,

                lang: language,
                tags,
            },
            models::db::ArticleMainData {
                content,

                word_count: i32::try_from(words.len()).ok().unwrap(),

                unique_words,
                unique_word_count,

                word_index_map,
                stop_word_map,

                sentences,
                sentence_stops,

                page_data,
            },
            words,
        )
        .await;

        if result.is_err() {
            return article_res::get_create_article_error();
        }

        let article = result.unwrap();

        let save_result =
            db::article::user::user_save_article(&trans, &auth_user.id, &article.id).await;

        if let Err(err) = save_result {
            eprintln!("{}", err);
            return article_res::get_save_article_error();
        }

        if let Err(err) = trans.commit().await {
            eprintln!("{}", err);
            return article_res::get_save_article_error();
        }

        HttpResponse::Created().json(models::net::NewArticleResponse::from(article))
    }

    #[patch("/article/")]
    pub async fn edit_article(
        db_pool: web::Data<Pool>,
        json: web::Json<models::net::EditArticleRequest>,
        auth_user: models::db::ClaimsUser,
    ) -> impl Responder {
        let mut client: Client = match db_pool.get().await {
            Ok(client) => client,
            Err(err) => {
                eprintln!("{}", err);
                return article_res::get_edit_article_error();
            }
        };

        let models::net::EditArticleRequest {
            article_id,
            ..
        } = json.0; 

        let (content_original, language_original) =
            match db::article::does_own_article(&client, article_id, auth_user.id).await {
                Ok((content, language)) => (content, language),
                Err(err) => {
                    if err == "missing" {
                        return article_res::get_edit_article_missing_error();
                    }

                    eprintln!("{}", err);
                    return article_res::get_edit_article_error();
                }
            };

        let mut main_data_opt: Option<models::db::ArticleMainData> = None;
        let mut words_opt: Option<Vec<String>> = None;

        if json.content.is_some() || json.language.is_some() {
            let models::net::EditArticleRequest {
                content: content_opt,
                language: ref language_opt,
                ..
            } = json.0;

            let content = content_opt.unwrap_or(content_original);
            let language = language_opt.as_ref().unwrap_or(&language_original);

            let models::db::ArticleContentData {
                words,
                unique_words,
                unique_word_count,
                word_index_map,
                stop_word_map,
                sentences,
                sentence_stops,
                page_data,
            } = compute_article_content_data(&content[..], &language[..]);

            main_data_opt = Some(models::db::ArticleMainData {
                content,

                word_count: i32::try_from(words.len()).ok().unwrap(),

                unique_words,
                unique_word_count,

                word_index_map,
                stop_word_map,

                sentences,
                sentence_stops,

                page_data,
            });

            words_opt = Some(words);
        }

        let models::net::EditArticleRequest {
            title,
            author,
            content_description,
            language,
            tags,
            is_private,
            ..
        } = json.0;

        let update_metadata_opt = models::db::UpdateArticleMetadataOpt {
            title,
            author,
            content_description,
            language,
            tags,
            is_private,
        };

        let trans = match client.transaction().await {
            Ok(trans) => trans,
            Err(err) => {
                eprintln!("{}", err);
                return article_res::get_create_article_error();
            }
        };

        if let Err(err) = db::article::edit_article(
            &trans,
            article_id,
            auth_user.id,
            update_metadata_opt,
            main_data_opt,
            words_opt,
        )
        .await
        {
            eprintln!("{}", err);
            return article_res::get_edit_article_error();
        }

        if let Err(err) = trans.commit().await {
            eprintln!("{}", err);
            return article_res::get_edit_article_error();
        }

        get_success()
    }

    pub mod system {
        use super::*;

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
                Ok(articles) => {
                    HttpResponse::Ok().json(models::net::GetArticlesResponse::new(articles))
                }
                Err(_) => article_res::get_fetch_articles_error(),
            }
        }

        #[get("/article/system/single/{article_id}/")]
        pub async fn get_full_article(
            db_pool: web::Data<Pool>,
            web::Path(article_id): web::Path<i32>,
            _: models::db::ClaimsUser,
        ) -> impl Responder {
            let client: Client = match db_pool.get().await {
                Ok(client) => client,
                Err(err) => {
                    eprintln!("{}", err);
                    return article_res::get_fetch_article_error();
                }
            };

            let result = db::article::system::get_system_article(&client, &article_id).await;

            match result {
                Ok(article_opt) => match article_opt {
                    Some(article) => {
                        HttpResponse::Ok().json(models::net::GetFullArticleResponse::new(article))
                    }
                    None => article_res::get_article_not_found(),
                },
                Err(_) => article_res::get_fetch_article_error(),
            }
        }
    }

    pub mod user {
        use super::*;

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
                Ok(articles) => {
                    HttpResponse::Ok().json(models::net::GetArticlesResponse::new(articles))
                }
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
                Ok(articles) => {
                    HttpResponse::Ok().json(models::net::GetArticlesResponse::new(articles))
                }
                Err(_) => article_res::get_fetch_articles_error(),
            }
        }

        #[get("/article/user/single/{article_id}/")]
        pub async fn get_full_article(
            db_pool: web::Data<Pool>,
            web::Path(article_id): web::Path<i32>,
            auth_user: models::db::ClaimsUser,
        ) -> impl Responder {
            let client: Client = match db_pool.get().await {
                Ok(client) => client,
                Err(err) => {
                    eprintln!("{}", err);
                    return article_res::get_fetch_article_error();
                }
            };

            let result =
                db::article::user::get_user_article(&client, &article_id, &auth_user.id).await;

            match result {
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

            let result =
                db::article::user::user_delete_article(&client, &auth_user.id, &article_id).await;

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
                Ok(articles) => {
                    HttpResponse::Ok().json(models::net::GetArticlesResponse::new(articles))
                }
                Err(_) => article_res::get_fetch_articles_error(),
            }
        }

        pub mod save_data {
            use super::*;

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
                    db::article::user::user_save_article(&trans, &auth_user.id, &json.article_id)
                        .await;

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

                let result = db::article::user::user_delete_saved_article(
                    &client,
                    &auth_user.id,
                    &json.article_id,
                )
                .await;

                match result {
                    Ok(()) => get_success(),
                    Err(_) => article_res::get_delete_article_error(),
                }
            }
        }
    }
}
