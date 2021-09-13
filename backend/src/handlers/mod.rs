pub mod article;
pub mod user;

use crate::models;

use actix_web::{get, HttpResponse, Responder};

#[get("/")]
pub async fn status() -> impl Responder {
    HttpResponse::Ok().json(models::net::StatusResponse { status: "Up" })
}
