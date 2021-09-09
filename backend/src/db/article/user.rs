use crate::db::*;
use crate::models::db::article::*;
use deadpool_postgres::Client;
use std::io;
use tokio_pg_mapper::FromTokioPostgresRow;
use tokio_postgres::error::SqlState;
use tokio_postgres::types;
use types::Type;

pub async fn get_user_article(
    client: &Client,
    article_id: &i32,
    user_id: &i32,
) -> Result<Option<ReadArticle>, &'static str> {
    let statement = client
        .prepare(
            r#"
            SELECT 
                id, title, author, created_on, uploader_id, content_description,
                    
                is_system, is_private,

                lang, tags, 

                word_count, unique_word_count,
                
                word_index_map, stop_word_map,

                page_data

                FROM article 
            WHERE 
                id = $1 AND 
                (NOT is_private OR uploader_id = $2) AND
                is_system = false AND
                is_deleted = false
        "#,
        )
        .await
        .unwrap();

    match client.query_opt(&statement, &[article_id, user_id]).await {
        Ok(ref row_opt) => match row_opt {
            Some(ref row) => match ReadArticle::from_row_ref(row) {
                Ok(article) => Ok(Some(article)),
                Err(err) => {
                    eprintln!("{}", err);
                    Err("Error getting article")
                }
            },
            None => Ok(None),
        },
        Err(err) => {
            eprintln!("{}", err);
            Err("Error getting article")
        }
    }
}

pub async fn get_user_article_for_edit(
    client: &Client,
    article_id: &i32,
    user_id: &i32,
) -> Result<Option<EditArticle>, &'static str> {
    let statement = client
        .prepare(
            r#"
            SELECT 
                title, author, content, content_description,
                    
                is_private,

                lang, tags, 

                FROM article 
            WHERE 
                id = $1 AND 
                (NOT is_private OR uploader_id = $2) AND
                is_system = false AND
                is_deleted = false
        "#,
        )
        .await
        .unwrap();

    match client.query_opt(&statement, &[article_id, user_id]).await {
        Ok(ref row_opt) => match row_opt {
            Some(ref row) => match EditArticle::from_row_ref(row) {
                Ok(article) => Ok(Some(article)),
                Err(err) => {
                    eprintln!("{}", err);
                    Err("Error getting article")
                }
            },
            None => Ok(None),
        },
        Err(err) => {
            eprintln!("{}", err);
            Err("Error getting article")
        }
    }
}

pub async fn user_delete_article(
    client: &Client,
    user_id: &i32,
    article_id: &i32,
) -> Result<(), &'static str> {
    let statement = client
        .prepare(
            r#"
            UPDATE article
            SET is_deleted = TRUE
            WHERE uploader_id = $1 AND id = $2
        "#,
        )
        .await
        .unwrap();

    match client.execute(&statement, &[user_id, article_id]).await {
        Ok(_) => Ok(()),
        Err(err) => {
            eprintln!("{}", err);
            Err("Failed to delete article")
        }
    }
}

pub async fn user_save_article(
    trans: &deadpool_postgres::Transaction<'_>,
    user_id: &i32,
    article_id: &i32,
) -> Result<(), &'static str> {
    let insert_statement = trans
        .prepare(
            r#"
            INSERT INTO saved_article (fruser_id, article_id, saved_on)
            VALUES 
            (
                $1, 
                (
                    SELECT id 
                    FROM article
                    WHERE 
                        id = $2 AND
                        (
                            NOT is_private OR 
                            uploader_id = $1
                        ) AND
                        is_deleted = FALSE
                ), 
                NOW()
            )
        "#,
        )
        .await
        .unwrap();

    match trans
        .execute(&insert_statement, &[user_id, article_id])
        .await
    {
        Ok(_) => Ok(()),
        Err(err) => {
            eprintln!("{}", err);
            if let Some(sql_state) = err.code() {
                if sql_state.code() == SqlState::UNIQUE_VIOLATION.code() {
                    println!("exists");
                    return Err("exists");
                }
            }
            Err("Error saving article")
        }
    }
}

pub async fn user_delete_saved_article(
    client: &Client,
    user_id: &i32,
    article_id: &i32,
) -> Result<(), &'static str> {
    let statement = client
        .prepare(
            r#"
            DELETE FROM saved_article
            WHERE fruser_id = $1 AND article_id = $2
        "#,
        )
        .await
        .unwrap();

    match client.execute(&statement, &[user_id, article_id]).await {
        Ok(_) => Ok(()),
        Err(err) => {
            eprintln!("{}", err);
            Err("Failed to delete saved article")
        }
    }
}

pub async fn get_user_saved_article_list(
    client: &Client,
    user_id: &i32,
    offset: &i64,
    lang: &Option<String>,
    search: &Option<String>,
    limit: &Option<i64>,
) -> Result<Vec<SimpleArticle>, io::Error> {
    let order_by_str = if search.is_some() {
        "pgroonga_score(a.tableoid, a.ctid)"
    } else {
        "s.saved_on"
    };

    let statement = client
        .prepare_typed(
            &get_article_query(
                r#"
                    saved_article AS s
                    INNER JOIN article AS a
                        ON a.id = s.article_id  
                "#,
                r#"
                    AND
                    s.fruser_id = $5 AND 
                    (NOT a.is_private OR a.uploader_id = $5) AND
                    is_deleted = false
                "#,
                order_by_str,
            )[..],
            &[Type::TEXT, Type::TEXT],
        )
        .await
        .unwrap();

    let articles = client
        .query(
            &statement,
            &[
                lang,
                search,
                offset,
                match limit {
                    Some(limit) => limit,
                    None => &(10i64),
                },
                user_id,
            ],
        )
        .await
        .expect("Error getting articles")
        .iter()
        .map(|row| SimpleArticle::from_row_ref(row).unwrap())
        .collect::<Vec<SimpleArticle>>();

    Ok(articles)
}

pub async fn get_user_uploaded_article_list(
    client: &Client,
    req_user_id: &i32,
    want_user_id: &i32,
    offset: &i64,
    lang: &Option<String>,
    search: &Option<String>,
    limit: &Option<i64>,
) -> Result<Vec<SimpleArticle>, io::Error> {
    let order_by_str = if search.is_some() {
        "pgroonga_score(tableoid, ctid)"
    } else {
        "created_on"
    };

    let statement = client
        .prepare_typed(
            &get_article_query(
                "article",
                r#"
                    AND
                    uploader_id = $5 AND 
                    ($6 OR NOT is_private) AND
                    is_deleted = false
                "#,
                order_by_str,
            )[..],
            &[Type::TEXT, Type::TEXT],
        )
        .await
        .unwrap();

    let articles = client
        .query(
            &statement,
            &[
                lang,
                search,
                offset,
                match limit {
                    Some(limit) => limit,
                    None => &(10i64),
                },
                want_user_id,
                &(want_user_id == req_user_id),
            ],
        )
        .await
        .expect("Error getting articles")
        .iter()
        .map(|row| SimpleArticle::from_row_ref(row).unwrap())
        .collect::<Vec<SimpleArticle>>();

    Ok(articles)
}

pub async fn get_all_user_uploaded_article_list(
    client: &Client,
    req_user_id: &i32,
    offset: &i64,
    lang: &Option<String>,
    search: &Option<String>,
    limit: &Option<i64>,
) -> Result<Vec<SimpleArticle>, io::Error> {
    let order_by_str = if search.is_some() {
        "pgroonga_score(tableoid, ctid)"
    } else {
        "created_on"
    };

    let statement = client
        .prepare(
            &format!(
                r#"
                    SELECT 
                        id, title, author, created_on, uploader_id, content_description,
            
                        is_system, is_private,
                        
                        lang, tags,

                        unique_word_count 
                        
                        FROM article 
                    WHERE 
                        is_deleted = false AND
                        is_system = false AND
                        (NOT is_private OR uploader_id = $1) AND
                        COALESCE(lang = $2, TRUE) AND
                        COALESCE(title &@~ $3, TRUE)
                    ORDER BY {} DESC 
                    LIMIT $5
                    OFFSET $4
                "#,
                order_by_str
            )[..],
        )
        .await
        .unwrap();

    let articles = client
        .query(
            &statement,
            &[
                req_user_id,
                lang,
                search,
                offset,
                match limit {
                    Some(limit) => limit,
                    None => &10i64,
                },
            ],
        )
        .await
        .expect("Error getting articles")
        .iter()
        .map(|row| SimpleArticle::from_row_ref(row).unwrap())
        .collect::<Vec<SimpleArticle>>();

    Ok(articles)
}
