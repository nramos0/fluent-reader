use serde::{Deserialize, Serialize};

use crate::models::db::user_data::*;

#[derive(Serialize)]
pub struct GetWordDataResponse {
    pub data: UserWordData,
}

impl GetWordDataResponse {
    pub fn new(data: UserWordData) -> GetWordDataResponse {
        GetWordDataResponse { data }
    }
}

#[derive(Deserialize)]
pub struct UpdateWordStatusRequest {
    pub lang: String,
    pub word: String,
    pub status: String,
}

#[derive(Deserialize)]
pub struct BatchUpdateWordStatusRequest {
    pub lang: String,
    pub words: Vec<String>,
    pub status: String,
}

#[derive(Deserialize)]
pub struct UpdateWordDefinitionRequest {
    pub lang: String,
    pub word: String,
    pub definition: String,
}

#[derive(Deserialize)]
pub struct MarkArticleRequest {
    pub mark: Mark,
    pub article_id: i32,
}

#[derive(Deserialize)]
pub struct DeleteMarkRequest {
    pub index: i32,
    pub article_id: i32,
}

#[derive(Serialize)]
pub struct GetReadDataResponse {
    pub data: ReadData,
}

impl GetReadDataResponse {
    pub fn new(data: ReadData) -> GetReadDataResponse {
        GetReadDataResponse { data }
    }
}
