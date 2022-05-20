use config::ConfigError;
use lazy_static::lazy_static;
use serde::Deserialize;

lazy_static! {
    pub static ref CONFIG: AppConfig = AppConfig::from_env().unwrap();
}

#[derive(Clone, Deserialize, Debug)]
pub struct ServerConfig {
    pub host: String,
    pub port: i32,
    pub secret: String,
    pub token_time: i64,
    pub salt: String,
    pub json_max_size: usize,
    pub pass_hash_length: u32,
}

#[derive(Clone, Deserialize, Debug)]
pub struct AppConfig {
    pub server: ServerConfig,
    pub pg: deadpool_postgres::Config,
}

impl AppConfig {
    pub fn from_env() -> Result<Self, ConfigError> {
        let mut cfg = config::Config::new();
        cfg.merge(config::Environment::new())?;
        cfg.try_into()
    }
}
