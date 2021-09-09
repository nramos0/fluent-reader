use serde::{Deserialize, Serialize};

use super::db::*;
// get article list
#[derive(Deserialize)]
pub struct GetArticlesRequest {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub lang: Option<String>,
    pub search: Option<String>,
}

#[derive(Serialize)]
pub struct GetArticlesResponse {
    pub articles: Vec<SimpleArticle>,
    pub count: i64,
}

impl GetArticlesResponse {
    #[inline]
    pub fn new(articles: Vec<SimpleArticle>) -> GetArticlesResponse {
        let count = articles.len() as i64;
        GetArticlesResponse { articles, count }
    }
}

#[derive(Deserialize)]
pub struct GetFullArticleQuery {
    pub only_edit_info: Option<bool>,
}

// get full article
#[derive(Deserialize)]
pub struct ArticleRequest {
    pub article_id: i32,
}

#[derive(Serialize)]
pub struct GetFullArticleResponse {
    pub article: ReadArticle,
}

impl GetFullArticleResponse {
    #[inline]
    pub fn new(article: ReadArticle) -> GetFullArticleResponse {
        GetFullArticleResponse { article }
    }
}

#[derive(Serialize)]
pub struct GetEditArticleResponse {
    pub article: EditArticle,
}

impl GetEditArticleResponse {
    #[inline]
    pub fn new(article: EditArticle) -> GetEditArticleResponse {
        GetEditArticleResponse { article }
    }
}

// post new article
#[derive(Deserialize)]
pub struct NewArticleRequest {
    pub title: String,
    pub author: Option<String>,
    pub content: String,
    pub content_description: Option<String>,
    pub language: String,
    pub tags: Option<Vec<String>>,
    pub is_private: bool,
}

#[derive(Serialize)]
pub struct NewArticleResponse {
    pub article: NewArticle,
}

impl NewArticleResponse {
    #[inline]
    pub fn from(article: NewArticle) -> NewArticleResponse {
        NewArticleResponse { article }
    }
}

#[derive(Deserialize)]
pub struct EditArticleRequest {
    pub article_id: i32,
    pub title: Option<String>,
    pub author: Option<String>,
    pub content: Option<String>,
    pub content_description: Option<String>,
    pub language: Option<String>,
    pub tags: Option<Vec<String>>,
    pub is_private: Option<bool>,
}

#[derive(Serialize)]
pub struct EditArticleResponse {
    pub article: NewArticle,
}

// get user uploaded article list
#[derive(Deserialize)]
pub struct GetUserArticlesRequest {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub user_id: Option<i32>,
    pub lang: Option<String>,
    pub search: Option<String>,
}
