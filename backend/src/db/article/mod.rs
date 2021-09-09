pub mod system;
pub mod user;

use crate::db::*;
use crate::models;
use deadpool_postgres::Client;
use tokio_pg_mapper::FromTokioPostgresRow;
use tokio_postgres::types;
use types::{ToSql, Type};

pub async fn create_article(
    trans: &deadpool_postgres::Transaction<'_>,
    article_meta_data: models::db::ArticleMetadata,
    article_main_data: models::db::ArticleMainData,
    words: Vec<String>,
) -> Result<models::db::NewArticle, &'static str> {
    let statement = match trans
        .prepare(
            r#"
            INSERT INTO article 
                    (
                       title, author, created_on, uploader_id, content_description,

                       is_system, is_private, is_deleted,

                       lang, tags,

                       content, 
                       
                       words, word_count,
                       
                       unique_words, unique_word_count,

                       word_index_map, stop_word_map,

                       sentences, sentence_stops,

                       page_data
                    ) 
            VALUES (
                $1, $2, NOW(), $3, $4,

                $5, $6, FALSE,

                $7, $8, 

                $9,
                
                $10, $11, 
                
                $12, $13, 
                
                $14, $15, 
                
                $16, $17,

                $18
            ) 
            RETURNING 
                id, title, created_on
        "#,
        )
        .await
    {
        Ok(statement) => statement,
        Err(err) => {
            eprintln!("{}", err);
            return Err("Error creating article");
        }
    };

    let tags: Vec<String> = match article_meta_data.tags {
        Some(tags) => tags.clone(),
        None => vec![],
    };

    match trans
        .query_one(
            &statement,
            &[
                &article_meta_data.title,
                &article_meta_data.author,
                // created_on = NOW()
                &article_meta_data.uploader_id,
                &article_meta_data.content_description,
                &((article_meta_data.uploader_id == 1) as bool), // is_system
                &article_meta_data.is_private,
                // is_deleted = FALSE
                &article_meta_data.lang,
                &tags,
                &article_main_data.content,
                &words,
                &article_main_data.word_count,
                &article_main_data.unique_words,
                &article_main_data.unique_word_count,
                &article_main_data.word_index_map,
                &article_main_data.stop_word_map,
                &article_main_data.sentences,
                &article_main_data.sentence_stops,
                &article_main_data.page_data,
            ],
        )
        .await
    {
        Ok(result) => match models::db::NewArticle::from_row_ref(&result) {
            Ok(article) => Ok(article),
            Err(err) => {
                eprintln!("{}", err);
                Err("Error creating article")
            }
        },
        Err(err) => {
            eprintln!("{}", err);
            Err("Error creating article")
        }
    }
}

pub async fn edit_article(
    trans: &deadpool_postgres::Transaction<'_>,
    article_id: i32,
    user_id: i32,
    update_metadata_opt: models::db::UpdateArticleMetadataOpt,
    main_data_opt: Option<models::db::ArticleMainData>,
    words_opt: Option<Vec<String>>,
) -> Result<(), &'static str> {
    let mut params: [&'_ (dyn ToSql + Sync); 18] = [&0; 18];
    let mut current_param: usize = 0;

    let mut update_statements: Vec<String> = vec![];

    let mut add_to_statement = |name: &str, curr: &usize| {
        update_statements.push(format!(" {} = ${}", name, curr + 1));
    };

    let mut types: Vec<Type> = vec![];

    {
        if extract_opt_inc_param(
            &mut params,
            &mut current_param,
            &update_metadata_opt.title,
            "title",
            &mut add_to_statement,
        ) {
            types.push(Type::TEXT);
        }

        if extract_opt_inc_param(
            &mut params,
            &mut current_param,
            &update_metadata_opt.author,
            "author",
            &mut add_to_statement,
        ) {
            types.push(Type::TEXT);
        }

        if extract_opt_inc_param(
            &mut params,
            &mut current_param,
            &update_metadata_opt.content_description,
            "content_description",
            &mut add_to_statement,
        ) {
            types.push(Type::TEXT);
        }

        if extract_opt_inc_param(
            &mut params,
            &mut current_param,
            &update_metadata_opt.language,
            "lang",
            &mut add_to_statement,
        ) {
            types.push(Type::TEXT);
        }

        if extract_opt_inc_param(
            &mut params,
            &mut current_param,
            &update_metadata_opt.tags,
            "tags",
            &mut add_to_statement,
        ) {
            types.push(Type::TEXT_ARRAY);
        }

        if extract_opt_inc_param(
            &mut params,
            &mut current_param,
            &update_metadata_opt.is_private,
            "is_private",
            &mut add_to_statement,
        ) {
            types.push(Type::BOOL);
        }
    }

    if let Some(ref main_data) = main_data_opt {
        if let Some(ref words) = words_opt {
            params[current_param] = words;
            add_to_statement("words", &current_param);
            current_param += 1;
            types.push(Type::TEXT_ARRAY);

            let models::db::ArticleMainData {
                content,

                word_count,

                unique_words,
                unique_word_count,

                word_index_map,
                stop_word_map,

                sentences,
                sentence_stops,

                page_data,
            } = main_data;

            params[current_param] = content;
            add_to_statement("content", &current_param);
            current_param += 1;
            types.push(Type::TEXT);

            params[current_param] = word_count;
            add_to_statement("word_count", &current_param);
            current_param += 1;
            types.push(Type::INT4);

            params[current_param] = unique_words;
            add_to_statement("unique_words", &current_param);
            current_param += 1;
            types.push(Type::JSONB);

            params[current_param] = unique_word_count;
            add_to_statement("unique_word_count", &current_param);
            current_param += 1;
            types.push(Type::INT4);

            params[current_param] = word_index_map;
            add_to_statement("word_index_map", &current_param);
            current_param += 1;
            types.push(Type::JSONB);

            params[current_param] = stop_word_map;
            add_to_statement("stop_word_map", &current_param);
            current_param += 1;
            types.push(Type::JSONB);

            params[current_param] = sentences;
            add_to_statement("sentences", &current_param);
            current_param += 1;
            types.push(Type::JSONB);

            params[current_param] = sentence_stops;
            add_to_statement("sentence_stops", &current_param);
            current_param += 1;
            types.push(Type::INT4_ARRAY);

            params[current_param] = page_data;
            add_to_statement("page_data", &current_param);
            current_param += 1;
            types.push(Type::JSONB);
        } else {
            panic!("main_data_opt was Some but words was None");
        }
    }

    params[current_param] = &article_id;
    current_param += 1;
    types.push(Type::INT4);

    params[current_param] = &user_id;
    current_param += 1;
    types.push(Type::INT4);

    let set_clause = update_statements.join(",");

    let statement = match trans
        .prepare_typed(
            &format!(
                r#"
                    UPDATE article
                    SET {}
                    WHERE id = ${} AND uploader_id = ${}
                "#,
                set_clause,
                current_param - 1,
                current_param
            )[..],
            &types[..],
        )
        .await
    {
        Ok(statement) => statement,
        Err(err) => {
            eprintln!("{}", err);
            return Err("Error editing article");
        }
    };

    match trans.execute(&statement, &params[..current_param]).await {
        Ok(_) => Ok(()),
        Err(err) => {
            eprintln!("{}", err);
            Err("Error editing article")
        }
    }
}

pub async fn does_own_article(
    client: &Client,
    article_id: i32,
    user_id: i32,
) -> Result<(String, String), &'static str> {
    let statement = client
        .prepare(
            r#"
                SELECT content, lang FROM article 
                WHERE 
                    id = $1 AND 
                    uploader_id = $2
            "#,
        )
        .await
        .unwrap();

    match client.query_opt(&statement, &[&article_id, &user_id]).await {
        Ok(ref row_opt) => match row_opt {
            Some(ref row) => Ok((row.get(0), row.get(1))),
            None => Err("missing"),
        },
        Err(err) => {
            eprintln!("{}", err);
            Err("Error getting article")
        }
    }
}
