# popcornHub API 

![popcornWelcome](https://github.com/tompra/popcornHub/assets/143709419/52581151-25b3-47d0-befe-a112eda8736c)

## Description
An API able to receive infomration on movies, directors, and genres so that anyone can learn more about movies. It allows users to create profiles to save data about their favorite movies.

## Objective

To build the server-side component of a “movies” web application. The web
application will provide users with access to information about different
movies, directors, and genres. Users will be able to sign up, update their
personal information, and create a list of their favorite movies.

## Tasks in the project

I'm the developer behind this project, responsible for various tasks:

  - Created a server with Express.
  - Designed a REST API with CRUD functionality.
  - Generated API documentation.
  - Conducted testing with Postman.
  - Established a NoSQL database using MongoDB.
  - Integrated the database with the API, implementing business logic.
  - Ensured security with CORS middleware, permitting access from specific domains.
  - Enhanced data security by encrypting user passwords using bcrypt.
  - Implemented server-side validation and data escaping to prevent XSS and SQL injection.
  - Successfully deployed the API to an online hosting server.
  - Migrated the local database to a cloud-based hosting platform.


## Technologies
  - Node.js
  - Express
  - MongoDB (Mongoose && MongoDB Atlas)
  - Postman

## Project Dependencies

| Dependency            | Description                                                                           |
|-----------------------|---------------------------------------------------------------------------------------|
| bcrypt                | A library for hashing passwords.                                                      |
| body-parser           | Middleware for parsing JSON and urlencoded request bodies.                            |
| cors                  | Middleware for enabling Cross-Origin Resource Sharing (CORS) in Express.js.            |
| express               | A web application framework for Node.js.                                               |
| express-validator     | A set of express.js middlewares that wraps validator.js validator and sanitizer functions. |
| jsonwebtoken          | A library for generating and verifying JSON Web Tokens (JWT).                          |
| mongoose              | A MongoDB object modeling tool designed to work in an asynchronous environment.        |
| morgan                | HTTP request logger middleware for Node.js.                                            |
| passport              | A authentication middleware for Node.js.                                               |
| passport-jwt          | Passport strategy for authenticating with a JSON Web Token (JWT).                      |
| passport-local        | Passport strategy for authenticating with a username and password.                     |
| uuid                  | A library for generating universally unique identifiers (UUIDs).                       |
| nodemon               | A tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected. |

## Live Demo
[Popcornhub Live](https://popcornhub-api.onrender.com/index.html)
