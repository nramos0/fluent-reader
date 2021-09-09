use serde::{Deserialize, Serialize};
use tokio_pg_mapper_derive::PostgresMapper;

#[derive(Serialize, Deserialize, PostgresMapper)]
#[pg_mapper(table = "user_word_data")]
pub struct UserWordData {
    pub word_status_data: serde_json::Value,
    pub word_definition_data: serde_json::Value,
}

#[derive(Serialize, Deserialize)]
pub struct Selection {
    start: usize,
    end: usize,
}

#[derive(Serialize, Deserialize)]
pub struct Mark {
    pub mark_type: String,
    pub selection: Selection,
    pub color: String,
}

#[derive(Serialize, Deserialize, PostgresMapper)]
#[pg_mapper(table = "read_article_data")]
pub struct ReadData {
    pub fruser_id: i32,
    pub article_id: i32,
    pub learned_words: Vec<serde_json::Value>,
    pub underlines: Vec<serde_json::Value>,
}
