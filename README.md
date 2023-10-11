# popcornHub API 

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


## App details 
  - Node.js
  - MongoDB (Mongoose && MongoDB Atlas)
  - Postman

## Dependencies
# Frameworks
- Express.js

# Middlewares
- Body-Parser: used for parsing incoming request bodies, essential for hadling request with JSON or URL-encoded data.
- Cors: Enabling Cross-Origin Resource Sharing, allowing controlled access to resources on allowed domains.
- Morgan: logging HTTP requests, which is used for monitoring.

# Libraries
- Bcrypt: for hashing passwords, enhacing security to user's password data.
- JSONWebTocken: creates and verifies JSON web tockens, used for authentication and authorization.
- Mongoose: for MongoDB object modeling in Node.js.
- Passport.js: implement user authentication and authorization strategies.



