/*
    Database Creation
*/

\c postgres;
DROP DATABASE fr;
CREATE DATABASE fr WITH ENCODING 'UTF8';
\c fr;

/*
    Extension Creation
*/

CREATE EXTENSION pgroonga;

/* 
    Table Creation
*/

DROP TABLE IF EXISTS user_all_article_word_data;
DROP TABLE IF EXISTS read_article_data;
DROP TABLE IF EXISTS saved_article;
DROP TABLE IF EXISTS article;
DROP TABLE IF EXISTS user_word_data;
DROP TABLE IF EXISTS fruser;

SET timezone = 'PRC';

CREATE TABLE fruser (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR UNIQUE NOT NULL,
    pass VARCHAR NOT NULL,
    created_on TIMESTAMP NOT NULL,
    study_lang VARCHAR(6),
    display_lang VARCHAR(6),
    refresh_token VARCHAR
);

CREATE INDEX fruser_id_index ON fruser(id);
CREATE INDEX fruser_index ON fruser(username);

CREATE TABLE user_word_data (
    fruser_id INTEGER UNIQUE NOT NULL,
    FOREIGN KEY (fruser_id) REFERENCES fruser(id),
    word_status_data JSONB NOT NULL,
    word_definition_data JSONB NOT NULL
);

CREATE INDEX word_data_user_index ON user_word_data(fruser_id);

CREATE TABLE article (
    id SERIAL PRIMARY KEY,

    title VARCHAR(250) NOT NULL,
    author VARCHAR,
    created_on TIMESTAMP NOT NULL,
    uploader_id INTEGER NOT NULL,
    FOREIGN KEY (uploader_id) REFERENCES fruser(id),
    content_description VARCHAR,

    is_system BOOLEAN NOT NULL,
    is_private BOOLEAN NOT NULL,
    is_deleted BOOLEAN NOT NULL,
    
    lang VARCHAR(6) NOT NULL,
    tags VARCHAR(50)[] NOT NULL,

    content VARCHAR NOT NULL,

    words VARCHAR[] NOT NULL,
    word_count INTEGER NOT NULL,
    
    unique_words JSONB NOT NULL,
    unique_word_count INTEGER NOT NULL,

    word_index_map JSONB NOT NULL,
    stop_word_map JSONB NOT NULL,

    sentences JSONB,
    sentence_stops INTEGER[],

    page_data JSONB NOT NULL
);

CREATE INDEX article_id_index ON article(id);
CREATE INDEX article_title_index ON article USING pgroonga (title);
CREATE INDEX article_tag_index ON article USING pgroonga (tags);
CREATE INDEX article_author_index ON article USING pgroonga (author);
CREATE INDEX article_uploader_index ON article(uploader_id);
CREATE INDEX article_lang_index ON article USING HASH (lang);

CREATE TABLE saved_article (
    fruser_id INTEGER NOT NULL,
    FOREIGN KEY (fruser_id) REFERENCES fruser(id),
    article_id INTEGER NOT NULL,
    FOREIGN KEY (article_id) REFERENCES article(id),
    saved_on TIMESTAMP NOT NULL,
    PRIMARY KEY(fruser_id, article_id)
);

CREATE INDEX saved_article_user_index ON saved_article(fruser_id);
CREATE INDEX saved_article_article_index ON saved_article(article_id);

CREATE TABLE read_article_data (
    fruser_id INTEGER NOT NULL,
    FOREIGN KEY (fruser_id) REFERENCES fruser(id),
    article_id INTEGER NOT NULL,
    FOREIGN KEY (article_id) REFERENCES article(id),
    learned_words JSONB[] NOT NULL,
    underlines JSONB[] NOT NULL,
    PRIMARY KEY(fruser_id, article_id)
);

CREATE INDEX read_article_data_user_index ON read_article_data(fruser_id);
CREATE INDEX read_article_data_article_index ON read_article_data(article_id);

CREATE TABLE user_all_article_word_data (
    fruser_id INTEGER NOT NULL,
    FOREIGN KEY (fruser_id) REFERENCES fruser(id),
    all_article_word_data JSONB NOT NULL
);

CREATE INDEX all_article_word_data_user_index ON user_all_article_word_data(fruser_id);
