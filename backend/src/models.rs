use actix_web::error::ErrorUnauthorized;
use actix_web::{dev, Error, FromRequest, HttpRequest};
use futures_util::future::{err, ok, Ready};
use serde::{Deserialize, Serialize};
use std::time::SystemTime;
use tokio_pg_mapper_derive::PostgresMapper;

pub mod gen {
    use super::*;

    pub mod net {
        use super::*;

        // General
        #[derive(Serialize)]
        pub struct StatusResponse {
            pub status: String,
        }

        #[derive(Serialize)]
        pub struct ResultResponse {
            pub success: bool,
        }

        #[derive(Serialize)]
        pub struct Message {
            pub message: &'static str,
        }

        #[derive(Serialize)]
        pub struct ErrorResponse {
            pub error: &'static str,
        }
    }
}

pub mod user {
    use super::*;

    pub mod db {
        use super::*;

        #[derive(Serialize, Deserialize, PostgresMapper)]
        #[pg_mapper(table = "fruser")]
        pub struct User {
            pub id: i32,
            pub username: String,
            pub display_name: String,
            pub pass: String,
            pub created_on: SystemTime,
            pub study_lang: String,
            pub display_lang: String,
            pub refresh_token: String,
        }

        pub struct UpdateUserOpt {
            pub username: Option<String>,
            pub display_name: Option<String>,
            pub pass: Option<String>,
            pub study_lang: Option<String>,
            pub display_lang: Option<String>,
            pub refresh_token: Option<String>,
        }

        impl UpdateUserOpt {
            pub fn none() -> Self {
                Self {
                    username: None,
                    display_name: None,
                    pass: None,
                    study_lang: None,
                    display_lang: None,
                    refresh_token: None,
                }
            }

            pub fn from_req(req: net::UpdateUserRequest) -> Self {
                Self {
                    username: req.username,
                    display_name: req.display_name,
                    pass: req.password,
                    study_lang: req.study_lang,
                    display_lang: req.display_lang,
                    refresh_token: None,
                }
            }
        }

        #[derive(Serialize, Deserialize, PostgresMapper)]
        #[pg_mapper(table = "fruser")]
        pub struct SimpleUser {
            pub id: i32,
            pub display_name: String,
            pub study_lang: String,
            pub display_lang: String,
        }

        impl SimpleUser {
            #[inline]
            pub fn new(user: User) -> SimpleUser {
                SimpleUser {
                    id: user.id,
                    display_name: user.display_name,
                    study_lang: user.study_lang,
                    display_lang: user.display_lang,
                }
            }
        }
    }

    pub mod net {
        use super::db::*;
        use super::*;

        pub mod auth {
            use super::*;

            #[derive(Deserialize)]
            pub struct RegisterRequest {
                pub username: String,
                pub display_name: String,
                pub password: String,
                pub study_lang: String,
                pub display_lang: String,
            }

            #[derive(Serialize)]
            pub struct RegisterResponse {
                pub user: SimpleUser,
            }

            impl RegisterResponse {
                #[inline]
                pub fn new(user: SimpleUser) -> RegisterResponse {
                    RegisterResponse { user }
                }
            }

            #[derive(Deserialize)]
            pub struct LoginRequest {
                pub username: String,
                pub password: String,
            }

            #[derive(Serialize)]
            pub struct LoginResponse {
                pub token: String,
                pub refresh_token: String,
            }

            #[derive(Deserialize)]
            pub struct RefreshRequest {
                pub token: String,
                pub refresh_token: String,
            }

            #[derive(Serialize)]
            pub struct RefreshResponse {
                pub token: String,
            }
        }

        #[derive(Deserialize)]
        pub struct GetUsersRequest {
            pub offset: Option<i64>,
        }

        #[derive(Serialize)]
        pub struct GetUsersResponse {
            pub users: Vec<SimpleUser>,
            pub count: i64,
        }

        impl GetUsersResponse {
            #[inline]
            pub fn new(users: Vec<SimpleUser>) -> GetUsersResponse {
                let count = users.len() as i64;
                GetUsersResponse { users, count }
            }
        }

        #[derive(Serialize)]
        pub struct GetUserResponse {
            pub user: SimpleUser,
        }

        impl GetUserResponse {
            #[inline]
            pub fn new(user: User) -> GetUserResponse {
                GetUserResponse {
                    user: SimpleUser::new(user),
                }
            }
        }

        #[derive(Deserialize)]
        pub struct UpdateUserRequest {
            pub username: Option<String>,
            pub display_name: Option<String>,
            pub password: Option<String>,
            pub study_lang: Option<String>,
            pub display_lang: Option<String>,
        }
    }

    pub mod auth {
        use super::db::*;
        use super::*;

        #[derive(Serialize, Deserialize)]
        pub struct ClaimsUser {
            pub id: i32,
            pub username: String,
            pub created_on: SystemTime,
            pub study_lang: String,
            pub display_lang: String,
        }

        impl ClaimsUser {
            #[inline]
            pub fn from_user(user: &User) -> ClaimsUser {
                ClaimsUser {
                    id: user.id,
                    username: user.username.clone(),
                    created_on: user.created_on,
                    study_lang: user.study_lang.clone(),
                    display_lang: user.display_lang.clone(),
                }
            }
        }

        impl FromRequest for ClaimsUser {
            type Error = Error;
            type Future = Ready<Result<Self, Self::Error>>;
            type Config = ();

            #[inline]
            fn from_request(req: &HttpRequest, _: &mut dev::Payload) -> Self::Future {
                match crate::auth::attempt_req_token_auth(req) {
                    Ok(user) => ok(user),
                    Err(error) => {
                        eprintln!("{}", error);
                        err(ErrorUnauthorized("auth_fail"))
                    }
                }
            }
        }

        #[derive(Serialize, Deserialize)]
        pub struct TokenClaims {
            pub exp: usize,
            pub user: ClaimsUser,
        }
    }

    pub mod data {
        use super::*;

        pub mod db {
            use super::*;

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
                pub color: String
            }

            #[derive(Serialize, Deserialize, PostgresMapper)]
            #[pg_mapper(table = "read_article_data")]
            pub struct ReadData {
                pub fruser_id: i32,
                pub article_id: i32,
                pub learned_words: Vec<serde_json::Value>,
                pub underlines: Vec<serde_json::Value>,
            }
        }

        pub mod net {
            use super::db::*;
            use super::*;

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
        }
    }
}

pub mod article {
    use super::*;

    pub mod db {
        use super::*;

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
    }

    pub mod net {
        use super::db::*;
        use super::*;

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
    }
}

pub mod db {
    use super::*;

    pub use user::auth::*;
    pub use user::data::db::*;
    pub use user::db::*;

    pub use article::db::*;
}

pub mod net {
    use super::*;

    pub use gen::net::*;

    pub use user::net::auth::*;
    pub use user::net::*;

    pub use user::data::net::*;

    pub use article::net::*;
}
