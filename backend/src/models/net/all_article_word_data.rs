use super::super::db::all_article_word_data::*;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct InsertArticlesRequest {
    pub article_id_list: Vec<i32>,
    pub lang: String,
}

#[derive(Deserialize)]
pub struct GetArticleListWordCountDataRequest {
    pub article_id_list: Vec<i32>,
    pub lang: String,
}

#[derive(Serialize)]
pub struct GetArticleListWordCountDataResponse {
    pub word_status_count_list: Vec<WordStatusCountInfo>,
}
