use crate::db::*;
use crate::models;
use deadpool_postgres::Client;
use std::io;
use tokio_pg_mapper::FromTokioPostgresRow;
use tokio_postgres::types;
use types::Type;

pub async fn get_system_article(
    client: &Client,
    article_id: &i32,
) -> Result<Option<models::db::ReadArticle>, &'static str> {
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
                    id = $1 AND is_system = true AND is_deleted = false
            "#,
        )
        .await
        .unwrap();

    match client.query_opt(&statement, &[article_id]).await {
        Ok(ref row_opt) => match row_opt {
            Some(ref row) => match models::db::ReadArticle::from_row_ref(row) {
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

pub async fn get_system_article_for_edit(
    client: &Client,
    article_id: &i32,
) -> Result<Option<models::db::EditArticle>, &'static str> {
    let statement = client
        .prepare(
            r#"
                SELECT 
                    title, author, content, content_description,
                    
                    is_private,

                    lang, tags, 

                    FROM article 
                WHERE 
                    id = $1 AND is_system = true AND is_deleted = false
            "#,
        )
        .await
        .unwrap();

    match client.query_opt(&statement, &[article_id]).await {
        Ok(ref row_opt) => match row_opt {
            Some(ref row) => match models::db::EditArticle::from_row_ref(row) {
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

pub async fn get_system_article_list(
    client: &Client,
    offset: &i64,
    lang: &Option<String>,
    search: &Option<String>,
    limit: &Option<i64>,
) -> Result<Vec<models::db::SimpleArticle>, io::Error> {
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
                        is_system = true AND 
                        is_private = false AND 
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
            ],
        )
        .await
        .expect("Error getting articles")
        .iter()
        .map(|row| models::db::SimpleArticle::from_row_ref(row).unwrap())
        .collect::<Vec<models::db::SimpleArticle>>();

    Ok(articles)
}
