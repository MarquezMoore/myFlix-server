# MyFlix Server
## Table of Contents
- [Objective](#Objective)
- [Technologies](#Technologies)
- [Features](#Features)
- [Technical-Specks](#Technical-Specks)


## Objective
The objective of this project was to build a server-side component, API, of a “movies” web application. The web application provides clients with access to information about different movies, directors, and genres. Clients will be able to register users, update user profile information, and create a list of user's favorite movies.

## Technologies
- Node.js
- Express
- MongoDB
- Mongoose

## Features
- Returns a list of ALL movies to the user
- Returns data (description, genre, director, image URL, whether it’s featured or not) about a
single movie by title to the user
- Returns data about a genre by name
- Returns data about a director by name
- Allows new users to register
- Allows users to update their user info (username, password, email, date of birth)
- Allows users to add a movie to their list of favorites
- Allows users to remove a movie from their list of favorites
- Allows existing users to deregister
## Technical-Specks
- The API is build with Node.js and Express.
- The API uses REST architecture, with URL endpoints corresponding to the data
operations listed above.
- The API uses at middleware modules, such as the body-parser package for
reading data from requests and morgan for logging.
- The database is built using MongoDB.
- The business logic is modeled with Mongoose.
- The API was tested via Postman.
- The API uses passport JWT based for authorization and authentication and the express validator for input validation.
- The API is deployed to Heroku.
