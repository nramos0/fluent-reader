use crate::models::db::user_data::*;
use deadpool_postgres::Client;
use serde_json::json;
use tokio_pg_mapper::FromTokioPostgresRow;
use tokio_postgres::types;
use tokio_postgres::{error::SqlState, Error, Statement};
use types::{ToSql, Type};

pub async fn get_user_word_data(
    trans: &deadpool_postgres::Transaction<'_>,
    user_id: &i32,
) -> Result<UserWordData, &'static str> {
    let statement = match trans
        .prepare(
            r#"
            SELECT word_status_data, word_definition_data
                FROM user_word_data
            WHERE fruser_id = $1
        "#,
        )
        .await
    {
        Ok(statement) => statement,
        Err(err) => {
            eprintln!("{}", err);
            return Err("Error getting word data");
        }
    };

    match trans.query_one(&statement, &[user_id]).await {
        Ok(result) => match UserWordData::from_row_ref(&result) {
            Ok(word_data) => Ok(word_data),
            Err(err) => {
                eprintln!("{}", err);
                Err("Error getting word data")
            }
        },
        Err(err) => {
            eprintln!("{}", err);
            Err("Error getting word data")
        }
    }
}

async fn get_word_status_statement(
    client: &deadpool_postgres::Transaction<'_>,
    new_status: &str,
) -> Result<Statement, Error> {
    match new_status {
        "known" | "learning" => {
            let old_status = if new_status == "known" {
                "learning"
            } else {
                "known"
            };

            client
                .prepare_typed(
                    &format!(
                        r#"
                        UPDATE user_word_data
                        SET word_status_data = 
                            jsonb_set(
                                (word_status_data #- 
                                    CAST(FORMAT('{{%s, {1}, %s}}', $1, $2) AS TEXT[])
                                ), 
                                CAST(FORMAT('{{%s, {0}, %s}}', $1, $2) AS TEXT[]),
                                '1'
                            )
                        WHERE fruser_id = $3;
                    "#,
                        new_status, old_status
                    )[..],
                    &[Type::TEXT, Type::TEXT],
                )
                .await
        }
        "new" => {
            client
                .prepare_typed(
                    r#"
                    UPDATE user_word_data
                    SET word_status_data = word_status_data 
                        #- CAST(FORMAT('{%s, known, %s}', $1, $2) AS TEXT[])
                        #- CAST(FORMAT('{%s, learning, %s}', $1, $2) AS TEXT[])
                    WHERE fruser_id = $3
                "#,
                    &[Type::TEXT, Type::TEXT],
                )
                .await
        }
        _ => panic!("new_status is invalid: {}", new_status),
    }
}

pub async fn update_word_status(
    trans: &deadpool_postgres::Transaction<'_>,
    user_id: &i32,
    lang: &String,
    word: &String,
    new_status: &String,
) -> Result<(), &'static str> {
    let statement_result = get_word_status_statement(trans, &new_status[..]).await;

    let statement = match statement_result {
        Ok(statement) => statement,
        Err(err) => {
            eprintln!("{}", err);
            return Err("Error updating word status");
        }
    };

    match trans.execute(&statement, &[lang, word, user_id]).await {
        Ok(_) => Ok(()),
        Err(err) => {
            eprintln!("{}", err);
            Err("Error updating word status")
        }
    }
}

fn get_batch_update_json_strings(
    words: &[String],
    new_status: &str,
) -> (serde_json::Value, String) {
    let mut json_dict = json!({});

    let map = match json_dict {
        serde_json::Value::Object(ref mut map) => map,
        _ => panic!("json_dict serde_json::Value isn't an Object!"),
    };

    let parameter_offset = if new_status == "new" { 3 } else { 4 };
    let mut delete_str = String::from("");

    for (i, word) in words.iter().enumerate() {
        map.insert(word.to_lowercase(), json!(1));
        delete_str += &format!("#- ${} ", i + parameter_offset)[..];
    }

    (json_dict, delete_str)
}

async fn get_batch_update_statement(
    trans: &deadpool_postgres::Transaction<'_>,
    new_status: &str,
    json_delete_str: String,
    word_count: usize,
) -> Result<Statement, Error> {
    let mut types: Vec<Type> = vec![Type::TEXT, Type::INT4];

    let formatted_string = match new_status {
        "new" => format!(
            r#"
            UPDATE user_word_data
            SET word_status_data = 
                jsonb_set(
                    jsonb_set(
                        word_status_data, 
                        CAST(FORMAT('{{%s, known}}', $1) AS TEXT[]),
                        (word_status_data)->$1->'known'
                            {0}
                    ),
                    CAST(FORMAT('{{%s, learning}}', $1) AS TEXT[]),
                    (
                        (word_status_data)->$1->'learning'
                            {0}
                    )
                )
            WHERE fruser_id = $2;
        "#,
            json_delete_str
        ),
        "learning" | "known" => {
            types.push(Type::JSONB);

            let old_status = match new_status {
                "learning" => "known",
                "known" => "learning",
                _ => panic!(
                    "Unsupported batch word status update new status: {}",
                    new_status
                ),
            };

            // $1: lang
            // $2: user_id
            // $3: insert_json
            // $4..$n: (n - 4 + 1) words
            // {0}: new_status
            // {1}: old_status
            // {2}: json_delete_str
            let formatted_string = format!(
                r#"
                UPDATE user_word_data
                SET word_status_data = 
                    jsonb_set(
                        jsonb_set(
                            word_status_data, 
                            CAST(FORMAT('{{%s, {0}}}', $1) AS TEXT[]),
                            (word_status_data)->$1->'{0}' ||
                            $3
                        ),
                        CAST(FORMAT('{{%s, {1}}}', $1) AS TEXT[]),
                        (
                            (word_status_data)->$1->'{1}'
                                {2}
                        )
                    )
                WHERE fruser_id = $2;
            "#,
                new_status, old_status, json_delete_str
            );

            formatted_string
        }

        _ => panic!(
            "Unsupported batch word status update new status: {}",
            new_status
        ),
    };

    types.reserve(word_count);
    for _ in 0..word_count {
        types.push(Type::TEXT_ARRAY);
    }

    trans.prepare_typed(&formatted_string, &types).await
}

fn build_batch_update_params<'a>(
    lang: &'a String,
    user_id: &'a i32,
    insert_json: &'a serde_json::Value,
    words: &'a [Vec<&'a str>],
    new_status: &str,
) -> Vec<&'a (dyn ToSql + Sync)> {
    let mut params: Vec<&(dyn ToSql + Sync)> = vec![lang, user_id];

    if new_status != "new" {
        params.push(insert_json);
    }

    for word in words {
        params.push(word);
    }

    params
}

fn get_vectored_words(words: &[String]) -> Vec<Vec<&str>> {
    let mut vectored_words: Vec<Vec<&str>> = vec![];

    for word in words {
        vectored_words.push(vec![&word[..]]);
    }

    vectored_words
}

pub async fn batch_update_word_status(
    trans: &deadpool_postgres::Transaction<'_>,
    user_id: &i32,
    lang: &String,
    words: &[String],
    new_status: &String,
) -> Result<(), &'static str> {
    let (insert_json, json_delete_str) = get_batch_update_json_strings(words, &new_status[..]);

    let statement = match get_batch_update_statement(
        trans,
        &new_status[..],
        json_delete_str,
        words.len(),
    )
    .await
    {
        Ok(statement) => statement,
        Err(err) => {
            eprintln!("{}", err);
            return Err("Error updating word status");
        }
    };

    let vectored_words = get_vectored_words(words);

    let params = build_batch_update_params(
        lang,
        user_id,
        &insert_json,
        &vectored_words[..],
        &new_status[..],
    );

    match trans.execute(&statement, &params[..]).await {
        Ok(_) => Ok(()),
        Err(err) => {
            eprintln!("{}", err);
            Err("Error updating word status")
        }
    }
}

pub async fn update_word_definition(
    client: &Client,
    user_id: &i32,
    lang: &String,
    word: &String,
    definition: &String,
) -> Result<(), &'static str> {
    let statement = match client
        .prepare_typed(
            r#"
                UPDATE user_word_data
                SET word_definition_data = 
                    jsonb_set(
                        word_definition_data, 
                        CAST(FORMAT('{ %s, %s }', $1, $2) AS TEXT[]), 
                        FORMAT('"%s"', $3)::jsonb
                    )
                WHERE fruser_id = $4
        "#,
            &[Type::TEXT, Type::TEXT, Type::TEXT],
        )
        .await
    {
        Ok(statement) => statement,
        Err(err) => {
            eprintln!("{}", err);
            return Err("Error updating word definition");
        }
    };

    match client
        .execute(&statement, &[lang, word, definition, user_id])
        .await
    {
        Ok(_) => Ok(()),
        Err(err) => {
            eprintln!("{}", err);
            Err("Error updating word definition")
        }
    }
}

pub async fn create_read_data(
    client: &Client,
    user_id: &i32,
    article_id: &i32,
) -> Result<ReadData, &'static str> {
    let insert_statement = client
        .prepare(
            r#"
        INSERT INTO read_article_data (fruser_id, article_id, learned_words, underlines)
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
            '{}',
            '{}'
        )
        RETURNING *
    "#,
        )
        .await
        .unwrap();

    match client
        .query_one(&insert_statement, &[&user_id, &article_id])
        .await
    {
        Ok(row) => match ReadData::from_row_ref(&row) {
            Ok(read_data) => Ok(read_data),
            Err(err) => {
                eprintln!("{}", err);
                Err("Couldn't create read article data")
            }
        },
        Err(err) => {
            eprintln!("{}", err);
            if let Some(sql_state) = err.code() {
                if sql_state.code() == SqlState::UNIQUE_VIOLATION.code() {
                    println!("exists");
                    return Err("exists");
                }
            }
            Err("Couldn't create read article data")
        }
    }
}

pub async fn get_read_data(
    client: &Client,
    user_id: &i32,
    article_id: &i32,
) -> Result<ReadData, &'static str> {
    let statement = client
        .prepare(
            r#"
        SELECT * FROM read_article_data
        WHERE fruser_id = $1 AND article_id = $2
    "#,
        )
        .await
        .unwrap();

    let get_read_data_err = Err("Couldn't get read article data");

    match client.query_opt(&statement, &[&user_id, &article_id]).await {
        Ok(row_opt) => match row_opt {
            Some(row) => match ReadData::from_row_ref(&row) {
                Ok(read_data) => Ok(read_data),
                Err(err) => {
                    eprintln!("{}", err);
                    get_read_data_err
                }
            },
            None => {
                eprintln!("Read data not found");
                Err("missing")
            }
        },
        Err(err) => {
            eprintln!("{}", err);
            get_read_data_err
        }
    }
}

pub async fn mark_article(
    client: &Client,
    user_id: &i32,
    article_id: &i32,
    mark: &Mark,
) -> Result<(), &'static str> {
    let statement = client
        .prepare(
            r#"
        UPDATE read_article_data 
        SET underlines = array_append(underlines, $3)
        WHERE fruser_id = $1 AND article_id = $2
    "#,
        )
        .await
        .unwrap();

    match client
        .execute(
            &statement,
            &[&user_id, &article_id, &serde_json::to_value(mark).unwrap()],
        )
        .await
    {
        Ok(_) => Ok(()),
        Err(err) => {
            eprintln!("{}", err);
            Err("Couldn't mark article")
        }
    }
}

pub async fn delete_mark(
    client: &Client,
    user_id: i32,
    article_id: i32,
    index: i32,
) -> Result<(), &'static str> {
    let one_index = index + 1;
    let slice = match one_index {
        1 => "underlines[2:]".to_owned(),
        _ => format!(
            "underlines[1:{}] || underlines[{}:]",
            one_index - 1,
            one_index + 1
        ),
    };

    let statement = client
        .prepare(
            &format!(
                r#"
                    UPDATE read_article_data 
                    SET underlines = {}
                    WHERE fruser_id = $1 AND article_id = $2
                "#,
                slice
            )[..],
        )
        .await
        .unwrap();

    match client.execute(&statement, &[&user_id, &article_id]).await {
        Ok(_) => Ok(()),
        Err(err) => {
            eprintln!("{}", err);
            Err("Couldn't delete article mark")
        }
    }
}
