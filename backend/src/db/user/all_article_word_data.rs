use crate::models::db::all_article_word_data::*;
use crate::models::db::article::*;
use futures::future;
use serde_json::json;
use tokio_pg_mapper::FromTokioPostgresRow;

pub async fn get_user_all_article_word_data(
    trans: &deadpool_postgres::Transaction<'_>,
    user_id: &i32,
) -> Result<AllArticleWordData, &'static str> {
    let statement = match trans
        .prepare(
            r#"
            SELECT all_article_word_data
                FROM user_all_article_word_data
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
        Ok(result) => match AllArticleWordData::from_row_ref(&result) {
            Ok(word_data) => Ok(word_data),
            Err(err) => {
                eprintln!("{}", err);
                Err("Error getting all article word data")
            }
        },
        Err(err) => {
            eprintln!("{}", err);
            Err("Error getting all article word data")
        }
    }
}

async fn update_user_all_article_word_data(
    trans: &deadpool_postgres::Transaction<'_>,
    user_id: &i32,
    new_data: serde_json::Value,
) -> Result<(), &'static str> {
    let statement = match trans
        .prepare(
            r#"
            UPDATE user_all_article_word_data
                SET all_article_word_data = $2
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

    match trans.execute(&statement, &[user_id, &new_data]).await {
        Ok(_) => Ok(()),
        Err(err) => {
            eprintln!("{}", err);
            Err("Error getting word data")
        }
    }
}

fn get_word_status(
    word: &str,
    learning: &serde_json::Map<std::string::String, serde_json::Value>,
    known: &serde_json::Map<std::string::String, serde_json::Value>,
) -> &'static str {
    if known.get(word).is_some() {
        return "known";
    } else if learning.get(word).is_some() {
        return "learning";
    }

    "new"
}

pub async fn insert_articles(
    trans: &deadpool_postgres::Transaction<'_>,
    user_id: &i32,
    article_id_list: &Vec<i32>,
    lang: &str,
) -> Result<(), &'static str> {
    let article_list_fut =
        crate::db::article::get_visible_article_list_words(trans, user_id, article_id_list);
    let all_article_word_data_fut = get_user_all_article_word_data(trans, user_id);
    let word_data_fut = crate::db::user::word_data::get_user_word_data(trans, user_id);

    let (article_list, mut all_article_word_data_outer, word_data) =
        match future::try_join3(article_list_fut, all_article_word_data_fut, word_data_fut).await {
            Ok(data) => data,
            Err(err) => {
                eprintln!("{}", err);
                return Err("Error inserting articles into all article word data");
            }
        };

    // handle word status data objects
    let word_status_data = word_data
        .word_status_data
        .as_object()
        .expect("word_status_data isn't an object")
        .get(lang)
        .expect(&format!("lang {} obj doesn't exist", lang)[..])
        .as_object()
        .expect(&format!("lang {} entry isn't an object", lang)[..]);

    let err_learn = "word_status_data.learning isn't an object";
    let err_known = "word_status_data.known isn't an object";

    let learning_status_map = word_status_data
        .get("learning")
        .expect(err_learn)
        .as_object()
        .expect(err_learn);

    let known_status_map = word_status_data
        .get("known")
        .expect(err_known)
        .as_object()
        .expect(err_known);

    let inner_get_word_status =
        |word: &str| get_word_status(word, learning_status_map, known_status_map);

    // handle all article word data objects
    let all_article_word_data = all_article_word_data_outer
        .all_article_word_data
        .as_object_mut()
        .expect("all_article_word_data is not an object");

    let all_article_word_data_lang = all_article_word_data
        .get_mut(lang)
        .expect(&format!("all_article_word_data {} obj doesn't exist", lang)[..]);

    article_list
        .iter()
        .for_each(|article_words: &ArticleWords| {
            let article_id = article_words.id;
            let unique_words = &article_words.unique_words;

            let mut new_count = 0i64;
            let mut learning_count = 0i64;
            let mut known_count = 0i64;

            unique_words
                .as_object()
                .expect("unique_words is not an object!")
                .iter()
                .for_each(|(word, frequency)| {
                    // get obj that maps words to objects that map article ids to frequencies
                    let status = inner_get_word_status(word);
                    let word_map = all_article_word_data_lang
                        .get_mut(status)
                        .unwrap()
                        .as_object_mut()
                        .unwrap();

                    let frequency_i64 = frequency.as_i64().unwrap();

                    match status {
                        "new" => new_count += frequency_i64,
                        "learning" => learning_count += frequency_i64,
                        "known" => known_count += frequency_i64,
                        _ => unreachable!(),
                    };

                    // get the object that maps article ids to frequencies for the current word
                    if word_map.get(word).is_none() {
                        word_map.insert(word.to_string(), json!({}));
                    }

                    let word_obj = word_map.get_mut(word).unwrap().as_object_mut().unwrap();

                    // ensure that the word object contains an entry for this article id
                    word_obj.insert(article_id.to_string(), frequency.clone());
                });

            all_article_word_data_lang
                .get_mut("article_word_counts")
                .unwrap()
                .as_object_mut()
                .unwrap()
                .insert(
                    article_id.to_string(),
                    json!({
                        "learning": learning_count,
                        "known": known_count,
                        "new": new_count
                    }),
                );
        });

    update_user_all_article_word_data(
        trans,
        user_id,
        all_article_word_data_outer.all_article_word_data,
    )
    .await
}

pub async fn change_word_list_status(
    trans: &deadpool_postgres::Transaction<'_>,
    user_id: &i32,
    words: &[&str],
    new_status: &str,
    lang: &str,
) -> Result<(), &'static str> {
    let all_article_word_data_fut = get_user_all_article_word_data(trans, user_id);
    let word_data_fut = crate::db::user::word_data::get_user_word_data(trans, user_id);

    let (mut all_article_word_data_outer, word_data) =
        match future::try_join(all_article_word_data_fut, word_data_fut).await {
            Ok(data) => data,
            Err(err) => {
                eprintln!("{}", err);
                return Err("Error changing word list statuses");
            }
        };

    let word_status_data_lang = word_data
        .word_status_data
        .as_object()
        .unwrap()
        .get(lang)
        .unwrap()
        .as_object()
        .unwrap();

    let learning_status_map = word_status_data_lang
        .get("learning")
        .unwrap()
        .as_object()
        .unwrap();

    let known_status_map = word_status_data_lang
        .get("known")
        .unwrap()
        .as_object()
        .unwrap();

    let inner_get_word_status =
        |word: &str| get_word_status(word, learning_status_map, known_status_map);

    let all_article_word_data = all_article_word_data_outer
        .all_article_word_data
        .as_object_mut()
        .unwrap();

    let all_article_word_data_lang = all_article_word_data.get_mut(lang).unwrap();

    let mut did_change = false;

    words.iter().map(|word| &word[..]).for_each(|word| {
        let prev_status = inner_get_word_status(word);

        if prev_status == new_status {
            return;
        }

        did_change = true;

        let word_obj_prev_status_clone = all_article_word_data_lang
            .get(prev_status)
            .unwrap()
            .as_object()
            .unwrap()
            .get(word)
            .unwrap()
            .clone();

        // remove word object from prev status object
        all_article_word_data_lang
            .get_mut(prev_status)
            .unwrap()
            .as_object_mut()
            .unwrap()
            .remove(word);

        // add word object to new status object
        let word_map_new_status = all_article_word_data_lang
            .get_mut(new_status)
            .unwrap()
            .as_object_mut()
            .unwrap();

        word_map_new_status.insert(word.to_string(), word_obj_prev_status_clone.clone());

        let article_word_counts = all_article_word_data_lang
            .get_mut("article_word_counts")
            .unwrap()
            .as_object_mut()
            .unwrap();

        word_obj_prev_status_clone
            .as_object()
            .unwrap()
            .iter()
            .map(|(article_id, frequency)| (article_id, frequency.as_i64().unwrap()))
            .for_each(|(article_id, frequency)| {
                let article_word_count_obj = article_word_counts
                    .get_mut(article_id)
                    .unwrap()
                    .as_object_mut()
                    .unwrap();

                let prev_status_word_count = article_word_count_obj
                    .get(prev_status)
                    .unwrap()
                    .as_i64()
                    .unwrap();
                article_word_count_obj.insert(
                    prev_status.to_string(),
                    json!(prev_status_word_count - frequency),
                );

                let new_status_word_count = article_word_count_obj
                    .get(new_status)
                    .unwrap()
                    .as_i64()
                    .unwrap();
                article_word_count_obj.insert(
                    new_status.to_string(),
                    json!(new_status_word_count + frequency),
                );
            });
    });

    if !did_change {
        return Ok(());
    }

    update_user_all_article_word_data(
        trans,
        user_id,
        all_article_word_data_outer.all_article_word_data,
    )
    .await
}
