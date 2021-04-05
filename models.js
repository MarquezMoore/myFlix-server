const mongoose = require('mongoose'),
  bcrypt = require('bcrypt');

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


// Custom static method of the usersSchema
usersSchema.statics.hashPassword = (password) => {// Static methods do not bind to the instance created through a class.
  return bcrypt.hashSync(password, 10);
}

//Custom instance method of the usersSchema
usersSchema.methods.validatePassword = function(password) {
  return bcrypt.hashSync(password, this.password);
} 


let movie = mongoose.model('movie', moviesSchema);
let user = mongoose.model('user', usersSchema)

module.exports.movie = movie;
module.exports.user = user;
