/*
  Reuirements
  1. Return a list of ALL movies to the user - done
  2. Return all data about a single movie by title to the user - done
  3. Return data about a genre (description) by name/title (e.g., “Thriller”)
  4. Return data about a director (bio, birth year, death year) by name
  5. Allow new users to register
  6. Allow users to update their user info (username, password, email, date of birth)
  7. Allow users to add a movie to their list of favorites
  8. Allow users to remove a movie from their list of favorites
  9. Allow existing users to deregister
*/

const dotenv = require('dotenv').config();


const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  mongoose = require('mongoose'),
  models = require('./models.js'),
  passport = require('passport'),
  cors = require('cors'),
  { check, validationResult } = require('express-validator');

require('./passport.js');


  
const app = express();
const movies = models.movie;
const users = models.user;

// mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

/*
  To be used on each request
*/
app.use(morgan(':method :host :url :status :res[content-length] - :response-time ms')); // ??
app.use(bodyParser.json()); // ?? 
app.use(express.static('public'));// ??

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
app.use(cors(
  // {
  //   origin: (origin, callback) => {
  //     if(!origin) return callback(null, true);
  //     if(allowedOrigins.indexOf(origin) === -1){
  //       let message = 'The CORS policy for this application doesn’t allow access from origin';
  //       return callback(new Error(message), false);
  //     }
  //     return callback(null, true);
  //   }
  // }
));

let auth = require('./auth.js')(app);

morgan.token('host', (req, res) =>{
  return req.hostname;
})

app.use((err, req, res, next)=>{
  console.error(err.stack);
  res.status(500).send('Something Broke');
})

/**
 * 
 * @param {object} req - Request object from client trying to register account
 * @returns {object} New user record formed from the request body.
 */
function userDetails(req) {
  let user = {
    username: req.body.username,
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    birthday: req.body.birthday
  }
  return user;
}

/*
  * Routes
*/

// GET Endpoints


app.get('/', (req, res) => {
  res.status(200).send('Welcome');
})

/*
  passport.authenticate(): a passport method that is used to define which passport authentication strategy will be used to authenticate the respective endpoint.
*/

/**
 * 
 * @param {string} endpoint - Endpoint to fetch all movies.
 * @param {func} passportAuth - Passwort authentication method with method used for authentication and options.
 * @param {func} reqHandler - Callback queries database for all movies.
 * @returns {object} - Returns object of all movies in database.
 */
app.get('/api/movies',  passport.authenticate('jwt', {session: false}) ,(req, res ) =>{
  movies.find()
    .then( movies => {
      if(!movies) return res.status(400).send({'msg': 'No movies not found...'});
      res.status(200).json(movies);
    })
    .catch( err => {
      res.status(500).send(`Error: ${ err.stack }`);
    })
})

/**
 * 
 * @method getMovieDetails
 * @param {string} endpoint - Endpoint to fetch movie details.
 * @param {func} passportAuth - Passwort authentication method with method used for authentication and options.
 * @param {func} reqHandler - Callback to query database for the requested movie.
 * @returns {object} - Returns object of requested movie.
 */
app.get('/api/movies/:title', passport.authenticate('jwt', {session: false}), (req, res) =>{
  let title = req.params.title;

  movies.findOne({title: title})
    .then( movie => {
      if(!movie) return res.status(400).send({'msg': 'Cannot find movie with this title...'})
      res.status(200).json(movie);
    })
    .catch( err => {
      res.status(500).send(`Error: ${ err.stack }`);
    })
  
})

/**
 * 
 * @method getGenreDetails
 * @param {string} endpoint - Endpoint to fetch genre description.
 * @param {func} passportAuth - Passwort authentication method with method used for authentication and options.
 * @param {func} reqHandler - Callback to query database for genre description.
 * @returns {object} - Returns object of the genre description of the specified movie.
 */
app.get('/api/genre/:genre', passport.authenticate('jwt', {session: false}), (req, res) =>{
  let genre = req.params.genre;

  movies.findOne({'genre.name': genre})
    .then( movie => {
      if(!movie) return res.status(400).send({'msg': 'Cannot find genre with this name...'})
      res.status(200).json(movie.genre.description);
    })
    .catch( err => {
      res.status(500).send(`Error: ${ err.stack }`);
    })
}) 

/**
 * 
 * @method getDirectorDetails
 * @param {string} endpoint - Endpoint to fetch details director.
 * @param {func} passportAuth - Passwort authentication method with method used for authentication and options.
 * @param {func} reqHandler - Callback that queries database for director details.
 * @returns {object} - Returns object of director details.
 */
app.get('/api/movies/:title/director', passport.authenticate('jwt', {session: false}), (req, res) =>{
  let title = req.params.title;

  movies.findOne({title: title})
    .then( movie => {
      if(!movie) return res.status(400).send({'msg': 'Cannot find movie with this title...'})
      res.status(200).json(movie.director);
    })
    .catch( err => {
      res.status(500).send(`Error: ${ err.stack }`)
    })

})

/**
 * 
 * @method getUser
 * @param {string} endpoint - Endpoint to fetch user details.
 * @param {func} passportAuth - Passwort authentication method with method used for authentication and options.
 * @param {func} reqHandler - Callback that locates specified user and returns that user's details.
 * @returns {object} - Returns object of requested user.
 */
app.get('/api/users/:username', passport.authenticate('jwt', {session: false}), (req, res) => {
  let username = req.params.username

  users.findOne({username: req.params.username})
  .then( user => {
    if(!user) return res.status(400).send({'msg': 'Could not find user...'})
    res.status(200).json(user);
  })
  .catch( err => {
    res.status(500).send(`Error: ${ err.stack }`)
  })
})

// POST Endpoints

/**
 * 
 * @method registerUser
 * @param {string} endpoint - Endpoint to register new user.
 * @param {array} expressValidationOpts - Express-validation options for validating req data.
 * @param {func} reqHandler - Callback 
 * @return {object} - Returns object of newly registered user.
 */
app.post('/api/users', 
  [
    check('username', 'Username is must have 5 or more characters...').isLength({min: 5}),
    check('username', 'Username contains non-alphanumeric characters - not allowed...').isAlphanumeric(),
    check('password', 'Password is required...').not().isEmpty(),
    check('password', 'Password contains non-alphanumeric characters - no allowed...'),
    check('email', 'Email does not appear to be valid...').isEmail()
  ]
  ,(req, res) =>{

  let errors = validationResult(req),  
    hashedPwd = users.hashPassword(req.body.password);

  if( !errors.isEmpty() ) return res.status(422).json(  errors.array() )

  users.findOne({username: req.body.username})
    .then( user => {
      if(user){
        return res.status(400).json([{'msg':'This user already exists...'}])
      }else{
        users
          .create({
            username: req.body.username,
            password: hashedPwd,
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            birthday: req.body.birthday,
          })
            .then( user => {
              console.log(userDetails(req));
              res.status(201).json(userDetails(req));
            })
            .catch( err => {
              res.status(400).send(`Error: ${ err.stack }`);
            })
      }
    })
    .catch( err => {
      res.status(500).send(`Error: ${ err.stack }`)
    })
})


// PUT Endpoints

/**
 * 
 * @method addMovie
 * @param {string} endpoint - Endpoint to add movie to favoirtes.
 * @param {func} passportAuth - Passwort authentication method with method used for authentication and options.
 * @param {func} reqHandler - Callback that locates use and adds specified movie to their favorites.
 * @returns {object} - Returns updated user object.
 */
app.put('/api/users/:username/:movieID', passport.authenticate('jwt', {session: false}), ( req, res ) =>{ 
  users.findOneAndUpdate(
    { username: req.params.username },
    {$addToSet: 
      { movies: req.params.movieID }
    }, 
    { new: true })
    .then( user => {
      if( !user ) return res.status(400).send({'message': 'Could not find user...'})
      res.status(200).json(user)
    }).catch( err => {
      res.status(500).send(`Error: ${ err.stack }`)
    })
});

/**
 * 
 * @method editUser
 * @param {string} endpoint - Endpoint to edit user profile.
 * @param {func} passportAuth - Passwort authentication method with method used for authentication and options.
 * @param {func} reqHandler - Callback that locates current user and updates their using data from req body.
 * @returns {object} - Returns updated user object.
 */
app.put('/api/users/:username', passport.authenticate('jwt', {session: false}), (req, res) =>{
  const params = {
    username: req.body.username,
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    birthday: req.body.birthday,
  }

  // Loops through properties in params object and deletes properties with falsey values
  for(let prop in params) {
    if (!params[prop]){
      delete params[prop]
    }
  }

  users.findOneAndUpdate(
    {username: req.params.username},
    {$set: 
      params
    }, 
    {new: true})
    .then( user => {
      if( !user ) return res.status(400).send({'message': 'Could not find user...'})
      res.status(200).json(userDetails(req))
    }).catch( err => {
      res.status(500).send(`Error: ${ err.stack }`)
    })
}) 

// DELETE Endpoints

/**
 * 
 * @method deleteMovie
 * @param {string} endpoint - Endpoint to remove movies form user favorites.
 * @param {func} passportAuth - Passwort authentication method with method used for authentication and options.
 * @param {func} reqHandler - Callback that locates current user and removes specified movie from their favorites if found.
 * @returns {object} - Returns user object hat was deleted.
 */
app.delete('/api/users/:username/:movieID', passport.authenticate('jwt', {session: false}), (req, res) =>{
  users.findOneAndUpdate(
    { username: req.params.username },
    {$pull: 
      { movies: req.params.movieID }
    }, 
    { new: true })
    .then( user => {
      if( !user ) return res.status(400).send({'message': 'User not found...'})
      res.status(200).json(user)
    }).catch( err => {
      res.status(500).send(`Error: ${ err.stack }`)
    })
}) 

/**
 * 
 * @method deleteUser
 * @param {string} endpoint - Endpoint to remove user profile.
 * @param {func} passportAuth - Passwort authentication method with method used for authentication and options.
 * @param {func} reqHandler - Callback that locates current user and deletes profile if found.
 */
app.delete('/api/users/:username', passport.authenticate('jwt', {session: false}), (req, res) =>{
  users.findOneAndRemove({username: req.params.username})
    .then( user => {
      if( !user ) return res.status(400).send({'message': 'User not found...'});
      res.status(200).send({'message': `${ req.params.username } was successfully deleted!`});
    }).catch( err => {
      res.status(500).send(`Error: ${ err.stack }`);
    });
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log(`CORS enabled web server listening on port: ${port}`);
});


