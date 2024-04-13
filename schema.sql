--Bloggy Database Schema
DROP DATABASE IF EXISTS `Bloggy`;

CREATE DATABASE IF NOT EXISTS `Bloggy`;

USE `Bloggy`;

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE BlogPosts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    post_description VARCHAR(140) DEFAULT NULL,
    content TEXT NOT NULL,
    author_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    image_path VARCHAR(255),
);