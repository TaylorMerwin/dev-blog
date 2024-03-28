# Bloggy
## Introduction

Bloggy is a new platform for writing and sharing technical blog posts.

## Features :sparkles:

* **Markdown Support:** Bloggy stands out with its ability to support writing blogs directly in Markdown format. This feature is powered by the EasyMDE library, allowing users to create rich text blogs with ease.
* **Responsive Design:** Designed with responsiveness and mobility in mind, Bloggy adapts to various screen sizes, ensuring a seamless experience across different devices.
* **Powered by PostgreSQL:** Data is securely stored and retrieved using PostgreSQL, hosted by Neon db to ensure stability and future proofing scale.
* **Data Caching:** Blog post data is frequently cached by the server to reduce redundant database calls and vastly improve loading times.
* **Photo Uploads** Bloggy supports the uploading of images which are then stored and retrieved utilizing cloud storage.
* **Server-Side Rendering:** With Node.js and Express at its core, Bloggy ensures fast and efficient server-side rendering for a smoother user experience.
* **Security Focused:** Bloggy is developed with security in mind at every stage. This means utilizing strong password hashing and utiliziing session based authentication.

## Coming Soon :eyes:

* **Intuitive Search:** Find the content you need in a flash.
* **Flexible Tagging:** Organize and discover posts by relevant tags.

## Installation
1. Clone the main repo found at https://github.com/TaylorMerwin/bloggy
2. Install Node.js on your development machine
3. Install required packages with `npm install`
4. Generate Database using the specified [schema](https://github.com/TaylorMerwin/bloggy/blob/main/schema.sql)
5. Set up a new project using GCP and create a storage bucket for images
6. Create `.env` file with Database and storage bucket credentials

## Commands
* Run development (Typescript) `npm run dev`
* Build the application (compile)`npm run build`
* Run the build (JavaScript) `npm start`


## Contributing :hammer_and_wrench:

Contributions to Bloggy are always welcome. Whether it's bug fixes, feature additions, or improvements in documentation, your help is appreciated. Submit your pull request today to join the revolution!
