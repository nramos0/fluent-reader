pub mod system;
pub mod user;

use crate::db;
use crate::lang;
use crate::models::db::article::*;
use crate::models::db::user::ClaimsUser;
use crate::models::net::article::*;
use crate::response;
use crate::response::get_success;

use actix_web::{patch, post, web, HttpResponse, Responder};
use deadpool_postgres::{Client, Pool};
use std::convert::TryFrom;

fn compute_article_content_data(content: &str, language: &str) -> ArticleContentData {
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

    ArticleContentData {
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
    json: web::Json<NewArticleRequest>,
    auth_user: ClaimsUser,
) -> impl Responder {
    let mut client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::article::get_create_article_error();
        }
    };

    let NewArticleRequest {
        title,
        author,
        content_description,
        language,
        tags,
        content,
        is_private,
    } = json.0;

    let ArticleContentData {
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
            return response::article::get_create_article_error();
        }
    };

    let result = db::article::create_article(
        &trans,
        ArticleMetadata {
            title,
            author,
            uploader_id: auth_user.id,
            content_description,

            is_private,

            lang: language,
            tags,
        },
        ArticleMainData {
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
        return response::article::get_create_article_error();
    }

    let article = result.unwrap();

    let save_result =
        db::article::user::user_save_article(&trans, &auth_user.id, &article.id).await;

    if let Err(err) = save_result {
        eprintln!("{}", err);
        return response::article::get_save_article_error();
    }

    if let Err(err) = trans.commit().await {
        eprintln!("{}", err);
        return response::article::get_save_article_error();
    }

    HttpResponse::Created().json(NewArticleResponse::from(article))
}

#[patch("/article/")]
pub async fn edit_article(
    db_pool: web::Data<Pool>,
    json: web::Json<EditArticleRequest>,
    auth_user: ClaimsUser,
) -> impl Responder {
    let mut client: Client = match db_pool.get().await {
        Ok(client) => client,
        Err(err) => {
            eprintln!("{}", err);
            return response::article::get_edit_article_error();
        }
    };

    let EditArticleRequest { article_id, .. } = json.0;

    let (content_original, language_original) =
        match db::article::does_own_article(&client, article_id, auth_user.id).await {
            Ok((content, language)) => (content, language),
            Err(err) => {
                if err == "missing" {
                    return response::article::get_edit_article_missing_error();
                }

                eprintln!("{}", err);
                return response::article::get_edit_article_error();
            }
        };

    let mut main_data_opt: Option<ArticleMainData> = None;
    let mut words_opt: Option<Vec<String>> = None;

    if json.content.is_some() || json.language.is_some() {
        let EditArticleRequest {
            content: content_opt,
            language: ref language_opt,
            ..
        } = json.0;

        let content = content_opt.unwrap_or(content_original);
        let language = language_opt.as_ref().unwrap_or(&language_original);

        let ArticleContentData {
            words,
            unique_words,
            unique_word_count,
            word_index_map,
            stop_word_map,
            sentences,
            sentence_stops,
            page_data,
        } = compute_article_content_data(&content[..], &language[..]);

        main_data_opt = Some(ArticleMainData {
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

    let EditArticleRequest {
        title,
        author,
        content_description,
        language,
        tags,
        is_private,
        ..
    } = json.0;

    let update_metadata_opt = UpdateArticleMetadataOpt {
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
            return response::article::get_create_article_error();
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
        return response::article::get_edit_article_error();
    }

    if let Err(err) = trans.commit().await {
        eprintln!("{}", err);
        return response::article::get_edit_article_error();
    }

    get_success()
}
