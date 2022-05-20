mod app_config;
mod auth;
mod db;
mod handlers;
mod lang;
mod models;
mod response;
mod util;

extern crate argon2;
extern crate rand;

use crate::app_config::AppConfig;
use crate::handlers::*;

use actix_cors::Cors;
use actix_web::{
    http,
    middleware::{Logger, NormalizePath},
    web, App, HttpServer,
};
use dotenv::dotenv;
use env_logger::Env;
use std::process;
use tokio_postgres::NoTls;

use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    if let Err(err) = dotenv() {
        eprintln!("Couldn't parse .env file. Exiting with error:\n{}", err);
        process::exit(1);
    }

    let config = AppConfig::from_env();
    let config = {
        if config.is_ok() {
            config.unwrap()
        } else {
            eprintln!("Error parsing config: {}", config.unwrap_err());
            process::exit(0);
        }
    };

    println!(
        "Starting server at http://{0}:{1}/",
        config.server.host, config.server.port
    );

    let address: String = config.server.host.clone() + ":" + &config.server.port.to_string();
    let ssl_address: String =
        config.server.host.clone() + ":" + &config.server.port_ssl.to_string();
    let pool = config.pg.create_pool(NoTls).expect("Failed to create pool");

    env_logger::Builder::from_env(Env::default().default_filter_or("info")).init();
    let json_config = web::JsonConfig::default().limit(config.server.json_max_size);

    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder
        .set_private_key_file("key.pem", SslFiletype::PEM)
        .unwrap();
    builder.set_certificate_chain_file("cert.pem").unwrap();

    HttpServer::new(move || {
        let cors = Cors::default()
            .send_wildcard()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST", "DELETE", "PATCH", "PUT", "OPTIONS"])
            .allowed_headers(vec![
                http::header::AUTHORIZATION,
                http::header::ACCEPT,
                http::header::ORIGIN,
                http::header::CONTENT_TYPE,
            ]);

        App::new()
            .wrap(NormalizePath::default())
            .wrap(Logger::default())
            .wrap(cors)
            .app_data(json_config.clone())
            .data(pool.clone())
            .service(user::login)
            .service(user::register)
            .service(user::update_user)
            .service(user::refresh)
            .service(user::auth)
            .service(user::get_user)
            .service(user::data::get_user_word_data)
            .service(user::data::update_word_status)
            .service(user::data::batch_update_word_status)
            .service(user::data::update_word_definition)
            // .service(article::edit_article)
            .service(article::create_article)
            .service(article::system::get_articles)
            .service(article::system::get_full_article)
            .service(article::user::get_single_user_article_list)
            .service(article::user::get_all_user_article_list)
            .service(article::user::get_saved_article_list)
            .service(article::user::get_full_article)
            .service(article::user::delete_article)
            .service(article::user::save_data::save_article)
            .service(article::user::save_data::remove_saved_article)
            .service(user::all_article_word_data::insert_articles)
            .service(user::all_article_word_data::get_user_all_article_word_data)
            .service(user::all_article_word_data::get_article_list_word_status_counts)
            .service(user::data::create_read_data)
            .service(user::data::get_read_data)
            .service(user::data::mark_article)
            .service(user::data::delete_mark)
            .service(status)
    })
    .bind(address)?
    .bind_openssl(&ssl_address[..], builder)?
    .run()
    .await
}
