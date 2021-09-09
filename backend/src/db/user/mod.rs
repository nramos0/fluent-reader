pub mod word_data;

use crate::db::*;
use crate::models::db::user::*;
use deadpool_postgres::Client;
use futures::future;
use std::io;
use tokio_pg_mapper::FromTokioPostgresRow;
use tokio_postgres::types;
use tokio_postgres::Statement;
use types::ToSql;

pub async fn get_user(client: &Client, username: &String) -> Result<Option<User>, &'static str> {
    let statement = client
        .prepare("SELECT * FROM fruser WHERE username = $1")
        .await
        .unwrap();

    match client.query_opt(&statement, &[username]).await {
        Ok(ref row) => match row {
            Some(ref user) => match User::from_row_ref(user) {
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

pub async fn get_user_by_id(client: &Client, user_id: &i32) -> Result<Option<User>, &'static str> {
    let statement = client
        .prepare("SELECT * FROM fruser WHERE id = $1")
        .await
        .unwrap();

    match client.query_opt(&statement, &[user_id]).await {
        Ok(ref row) => match row {
            Some(ref user) => match User::from_row_ref(user) {
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
    update: &UpdateUserOpt,
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

pub async fn get_users(client: &Client, offset: &i64) -> Result<Vec<SimpleUser>, io::Error> {
    let statement = client
        .prepare("SELECT id, username FROM fruser ORDER BY id LIMIT 10 OFFSET $1")
        .await
        .unwrap();

    let users = client
        .query(&statement, &[offset])
        .await
        .expect("Error getting users")
        .iter()
        .map(|row| SimpleUser::from_row_ref(row).unwrap())
        .collect::<Vec<SimpleUser>>();

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
) -> Result<SimpleUser, &'static str> {
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

    let user: SimpleUser = match trans
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
        Ok(result) => match SimpleUser::from_row_ref(&result) {
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
