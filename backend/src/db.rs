use crate::models;
use deadpool_postgres::Client;
use futures::future;
use serde_json::json;
use std::io;
use tokio_pg_mapper::FromTokioPostgresRow;
use tokio_postgres::types;
use tokio_postgres::{error::SqlState, Error, Statement};
use types::{ToSql, Type};

#[inline]
fn get_article_query(from_clause: &str, where_clause: &str, order_by_clause: &str) -> String {
    format!(
        r#"
            SELECT 
                id, title, author, created_on, uploader_id, content_description,
                
                is_system, is_private,
                
                lang, tags,

                unique_word_count

                FROM {} 
            WHERE 
                COALESCE(lang = $1, TRUE) AND
                COALESCE(title &@~ $2, TRUE)
                {}
            ORDER BY {} DESC 
            LIMIT $4 
            OFFSET $3
        "#,
        from_clause, where_clause, order_by_clause
    )
}

fn extract_opt_inc_param<'a, T, U>(
    params: &mut [&'a (dyn ToSql + Sync)],
    current_param: &mut usize,
    opt: &'a Option<T>,
    name: &str,
    func: &mut U,
) -> bool 
    where
        T: ToSql + Sync,
        U: FnMut(&str, &usize),
{
    if let Some(val) = opt {
        params[*current_param] = val;
        (*func)(name, current_param);
        *current_param += 1;
        return true;
    }
    
    false
}

pub mod user {
    use super::*;

    pub async fn get_user(
        client: &Client,
        username: &String,
    ) -> Result<Option<models::db::User>, &'static str> {
        let statement = client
            .prepare("SELECT * FROM fruser WHERE username = $1")
            .await
            .unwrap();

        match client.query_opt(&statement, &[username]).await {
            Ok(ref row) => match row {
                Some(ref user) => match models::db::User::from_row_ref(user) {
                    Ok(user) => Ok(Some(user)),
                    Err(err) => {
                        eprintln!("{}", err);
                        Err("Error getting user")
                    }
                },
                None => Ok(None),
            },
            Err(err) => {
                eprintln!("{}", err);
                Err("Error getting user")
            }
        }
    }

    pub async fn get_user_by_id(
        client: &Client,
        user_id: &i32,
    ) -> Result<Option<models::db::User>, &'static str> {
        let statement = client
            .prepare("SELECT * FROM fruser WHERE id = $1")
            .await
            .unwrap();

        match client.query_opt(&statement, &[user_id]).await {
            Ok(ref row) => match row {
                Some(ref user) => match models::db::User::from_row_ref(user) {
                    Ok(user) => Ok(Some(user)),
                    Err(err) => {
                        eprintln!("{}", err);
                        Err("Error getting user")
                    }
                },
                None => Ok(None),
            },
            Err(err) => {
                eprintln!("{}", err);
                Err("Error getting user")
            }
        }
    }

    pub async fn update_user(
        client: &Client,
        user_id: &i32,
        update: &models::db::UpdateUserOpt,
    ) -> Result<(), &'static str> {
        let mut params: [&'_ (dyn ToSql + Sync); 7] = [&0; 7];
        let mut current_param: usize = 0;

        let mut update_statements: Vec<String> = vec![];

        let mut add_to_statement = |name: &str, curr: &usize| {
            update_statements.push(format!(" {} = ${}", name, curr + 1));
        };

        extract_opt_inc_param(
            &mut params,
            &mut current_param,
            &update.username,
            "username",
            &mut add_to_statement,
        );
        extract_opt_inc_param(
            &mut params,
            &mut current_param,
            &update.display_name,
            "display_name",
            &mut add_to_statement,
        );
        extract_opt_inc_param(
            &mut params,
            &mut current_param,
            &update.pass,
            "password",
            &mut add_to_statement,
        );
        extract_opt_inc_param(
            &mut params,
            &mut current_param,
            &update.study_lang,
            "study_lang",
            &mut add_to_statement,
        );
        extract_opt_inc_param(
            &mut params,
            &mut current_param,
            &update.display_lang,
            "display_lang",
            &mut add_to_statement,
        );
        extract_opt_inc_param(
            &mut params,
            &mut current_param,
            &update.refresh_token,
            "refresh_token",
            &mut add_to_statement,
        );

        let set_clause = update_statements.join(",");

        params[current_param] = user_id;
        current_param += 1;

        let statement = client
            .prepare(
                &format!(
                    r#"
                        UPDATE fruser
                        SET {}
                        WHERE id = ${}
                    "#,
                    set_clause, current_param
                )[..],
            )
            .await
            .unwrap();

        match client.execute(&statement, &params[..current_param]).await {
            Ok(_) => Ok(()),
            Err(err) => {
                eprintln!("{}", err);
                Err("Error updating user")
            }
        }
    }

    pub async fn get_users(
        client: &Client,
        offset: &i64,
    ) -> Result<Vec<models::db::SimpleUser>, io::Error> {
        let statement = client
            .prepare("SELECT id, username FROM fruser ORDER BY id LIMIT 10 OFFSET $1")
            .await
            .unwrap();

        let users = client
            .query(&statement, &[offset])
            .await
            .expect("Error getting users")
            .iter()
            .map(|row| models::db::SimpleUser::from_row_ref(row).unwrap())
            .collect::<Vec<models::db::SimpleUser>>();

        Ok(users)
    }

    #[inline]
    async fn prepare_user_creation_statements(
        trans: &deadpool_postgres::Transaction<'_>,
    ) -> Result<(Statement, Statement), tokio_postgres::error::Error> {
        let insert_user_ft = trans.prepare(
            "INSERT INTO fruser (username, display_name, pass, created_on, study_lang, display_lang, refresh_token)
                VALUES ($1, $2, $3, NOW(), $4, $5, $6) RETURNING id, display_name, study_lang, display_lang",
        );

        let insert_word_data_ft = trans
            .prepare(
                r#"
                INSERT INTO user_word_data (fruser_id, word_status_data, word_definition_data)
                VALUES
                    (
                        $1,
                        '{ "en": { "learning": {}, "known": {} }, "zh": { "learning": {}, "known": {} } }',
                        '{ "en": {}, "zh": {} }'
                    )
            "#
            );

        future::try_join(insert_user_ft, insert_word_data_ft).await
    }

    pub async fn create_user(
        client: &mut Client,
        username: &String,
        display_name: &String,
        password: &String,
        study_lang: &String,
        display_lang: &String,
    ) -> Result<models::db::SimpleUser, &'static str> {
        let user_err = Err("Error creating user");

        let trans = match client.transaction().await {
            Ok(trans) => trans,
            Err(err) => {
                eprintln!("{}", err);
                return user_err;
            }
        };

        let (insert_user, insert_word_data) = match prepare_user_creation_statements(&trans).await {
            Ok((insert_user, insert_word_data)) => (insert_user, insert_word_data),
            Err(err) => {
                eprintln!("{}", err);
                return user_err;
            }
        };

        let user: models::db::SimpleUser = match trans
            .query_one(
                &insert_user,
                &[
                    username,
                    display_name,
                    password,
                    study_lang,
                    display_lang,
                    &"",
                ],
            )
            .await
        {
            Ok(result) => match models::db::SimpleUser::from_row_ref(&result) {
                Ok(user) => user,
                Err(err) => {
                    eprintln!("{}", err);
                    return user_err;
                }
            },
            Err(err) => {
                eprintln!("{}", err);
                return user_err;
            }
        };

        let insert_word_data_result = trans.query_opt(&insert_word_data, &[&user.id]).await;

        if let Err(err) = insert_word_data_result {
            eprintln!("{}", err);
            return user_err;
        }

        if let Err(err) = trans.commit().await {
            eprintln!("{}", err);
            return user_err;
        }

        Ok(user)
    }

    pub mod word_data {
        use super::*;

        pub async fn get_user_word_data(
            client: &Client,
            user_id: &i32,
        ) -> Result<models::db::UserWordData, &'static str> {
            let statement = match client
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

            match client.query_one(&statement, &[user_id]).await {
                Ok(result) => match models::db::UserWordData::from_row_ref(&result) {
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
            client: &Client,
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
            client: &Client,
            user_id: &i32,
            lang: &String,
            word: &String,
            new_status: &String,
        ) -> Result<(), &'static str> {
            let statement_result = get_word_status_statement(client, &new_status[..]).await;

            let statement = match statement_result {
                Ok(statement) => statement,
                Err(err) => {
                    eprintln!("{}", err);
                    return Err("Error updating word status");
                }
            };

            match client.execute(&statement, &[lang, word, user_id]).await {
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
            client: &Client,
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

            client.prepare_typed(&formatted_string, &types).await
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
            client: &Client,
            user_id: &i32,
            lang: &String,
            words: &[String],
            new_status: &String,
        ) -> Result<(), &'static str> {
            let (insert_json, json_delete_str) =
                get_batch_update_json_strings(words, &new_status[..]);

            let statement = match get_batch_update_statement(
                client,
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

            match client.execute(&statement, &params[..]).await {
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
        ) -> Result<models::db::ReadData, &'static str> {
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
                Ok(row) => match models::db::ReadData::from_row_ref(&row) {
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
        ) -> Result<models::db::ReadData, &'static str> {
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
                    Some(row) => match models::db::ReadData::from_row_ref(&row) {
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
            mark: &models::db::Mark,
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
    }
}

pub mod article {
    use super::*;

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
                &types[..]
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

    pub mod system {
        use super::*;

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
    }

    pub mod user {
        use super::*;

        pub async fn get_user_article(
            client: &Client,
            article_id: &i32,
            user_id: &i32,
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
        ) -> Result<Vec<models::db::SimpleArticle>, io::Error> {
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
                .map(|row| models::db::SimpleArticle::from_row_ref(row).unwrap())
                .collect::<Vec<models::db::SimpleArticle>>();

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
                .map(|row| models::db::SimpleArticle::from_row_ref(row).unwrap())
                .collect::<Vec<models::db::SimpleArticle>>();

            Ok(articles)
        }

        pub async fn get_all_user_uploaded_article_list(
            client: &Client,
            req_user_id: &i32,
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
                .map(|row| models::db::SimpleArticle::from_row_ref(row).unwrap())
                .collect::<Vec<models::db::SimpleArticle>>();

            Ok(articles)
        }
    }
}
