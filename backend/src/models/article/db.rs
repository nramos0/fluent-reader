use serde::{Deserialize, Serialize};
use std::time::SystemTime;
use tokio_pg_mapper_derive::PostgresMapper;

#[derive(Serialize, Deserialize, PostgresMapper)]
#[pg_mapper(table = "article")]
pub struct Article {
    pub id: i32,
    pub title: String,
    pub author: Option<String>,
    pub content: String,
    pub unique_word_count: i32,
    pub words: Vec<String>,
    pub sentences: serde_json::Value,
    pub unique_words: serde_json::Value,
    pub page_data: serde_json::Value,
    pub created_on: SystemTime,
    pub is_system: bool,
    pub uploader_id: i32,
    pub lang: String,
    pub tags: Vec<String>,
}

#[derive(Serialize, Deserialize, PostgresMapper)]
#[pg_mapper(table = "article")]
pub struct SimpleArticle {
    pub id: i32,

    pub title: String,
    pub author: Option<String>,
    pub created_on: SystemTime,
    pub uploader_id: i32,
    pub content_description: Option<String>,

    pub is_system: bool,
    pub is_private: bool,

    pub lang: String,
    pub tags: Vec<String>,

    pub unique_word_count: i32,
}

#[derive(Serialize, Deserialize, PostgresMapper)]
#[pg_mapper(table = "article")]
pub struct NewArticle {
    pub id: i32,
    pub title: String,
    pub created_on: SystemTime,
}

#[derive(Serialize, Deserialize, PostgresMapper)]
#[pg_mapper(table = "article")]
pub struct ReadArticle {
    pub id: i32,

    pub title: String,
    pub author: Option<String>,
    pub created_on: SystemTime,
    pub uploader_id: i32,

    pub is_system: bool,
    pub is_private: bool,

    pub lang: String,
    pub tags: Vec<String>,

    pub word_count: i32,

    pub unique_word_count: i32,

    pub word_index_map: serde_json::Value,
    pub stop_word_map: serde_json::Value,

    pub page_data: serde_json::Value,
}

#[derive(Serialize, Deserialize, PostgresMapper)]
#[pg_mapper(table = "article")]
pub struct EditArticle {
    pub title: String,
    pub author: Option<String>,

    pub is_private: bool,

    pub lang: String,
    pub tags: Option<Vec<String>>,

    pub content: String,
    pub content_description: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct ArticleMetadata {
    pub title: String,
    pub author: Option<String>,
    pub uploader_id: i32,
    pub content_description: Option<String>,

    pub is_private: bool,

    pub lang: String,
    pub tags: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize)]
pub struct ArticleMainData {
    pub content: String,

    pub word_count: i32,

    pub unique_words: serde_json::Value,
    pub unique_word_count: i32,

    pub word_index_map: serde_json::Value,
    pub stop_word_map: serde_json::Value,

    pub sentences: Option<serde_json::Value>,
    pub sentence_stops: Option<Vec<i32>>,

    pub page_data: serde_json::Value,
}

#[derive(Serialize, Deserialize)]
pub struct ArticleContentData {
    pub words: Vec<String>,

    pub unique_words: serde_json::Value,
    pub unique_word_count: i32,

    pub word_index_map: serde_json::Value,
    pub stop_word_map: serde_json::Value,

    pub sentences: Option<serde_json::Value>,
    pub sentence_stops: Option<Vec<i32>>,

    pub page_data: serde_json::Value,
}

pub struct UpdateArticleMetadataOpt {
    pub title: Option<String>,
    pub author: Option<String>,
    pub content_description: Option<String>,
    pub language: Option<String>,
    pub tags: Option<Vec<String>>,
    pub is_private: Option<bool>,
}
