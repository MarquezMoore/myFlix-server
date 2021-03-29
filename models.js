const mongoose = require('mongoose');

let moviesSchema = mongoose.Schema({
  title: {type: String, required: true},
  description: {type: String, required: true},
  director: {
    name: String, 
    bio: String,
    birthday: Date, 
    deathday: Date
  },
  genre: {
    name: String, 
    description: String
  },
  actors: [String],
  imgURL: String,
  featured: Boolean
})

let usersSchema = mongoose.Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  email: {type: String, require: true},
  firstName: String,
  lastName: String,
  birthday: String,
  movies: [String]
})


let movie = mongoose.model('movie', moviesSchema);
let user = mongoose.model('user', usersSchema)

module.exports.movie = movie;
module.exports.user = user;
