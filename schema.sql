--dev-blog Database Schema
DROP DATABASE IF EXISTS `dev-blog-db`;

CREATE DATABASE IF NOT EXISTS `dev-blog-db`;

USE `dev-blog-db`;

CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE BlogPosts (
    post_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    post_description VARCHAR(140) DEFAULT NULL,
    content TEXT NOT NULL,
    author_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_path VARCHAR(255)
  )