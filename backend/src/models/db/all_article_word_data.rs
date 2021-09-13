use serde::{Deserialize, Serialize};
use tokio_pg_mapper_derive::PostgresMapper;

#[derive(Serialize, Deserialize, PostgresMapper)]
#[pg_mapper(table = "user_word_data")]
pub struct AllArticleWordData {
    pub all_article_word_data: serde_json::Value,
}

#[derive(Serialize, Deserialize)]
pub struct WordStatusCountInfo {
    pub new: i64,
    pub learning: i64,
    pub known: i64,
    pub total: i64,
    pub article_id: i32,
}
