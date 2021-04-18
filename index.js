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

morgan.token('host', (req, res) =>{ // ??
  return req.hostname;
})

app.use((err, req, res, next)=>{// ??
  console.error(err.stack);
  res.status(500).send('Something Broke');
  
})

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
  Routes
*/

// GET Requests
app.get('/', (req, res) => {
  res.status(200).send('Welcome');
})
// passport.authenticate('jwt', {session: false}), This needs to go in the route below
app.get('/api/movies', (req, res ) =>{
  movies.find()
    .then( movies => {
      if(!movies){
        return res.status(400).send({'message': 'No movies not found...'});
      }
      res.status(200).json(movies);
    })
    .catch( err => {
      res.status(500).send(`Error: ${ err.stack }`);
    })
})

app.get('/api/movies/:title', passport.authenticate('jwt', {session: false}), (req, res) =>{
  let title = req.params.title;

  movies.findOne({title: title})
    .then( movie => {
      if(!movie){
        return res.status(400).send({'message': 'Cannot find movie with this title...'})
      }
      res.status(200).json(movie);
    })
    .catch( err => {
      res.status(500).send(`Error: ${ err.stack }`);
    })
  
})

app.get('/api/genre/:genre', passport.authenticate('jwt', {session: false}), (req, res) =>{
  let genre = req.params.genre;

  movies.findOne({'genre.name': genre})
    .then( movie => {
      if(!movie){
        return res.status(400).send({'message': 'Cannot find genre with this name...'})
      }
      res.status(200).json(movie.genre.description);
    })
    .catch( err => {
      res.status(500).send(`Error: ${ err.stack }`);
    })
}) 


app.get('/api/movies/:title/director', passport.authenticate('jwt', {session: false}), (req, res) =>{
  let title = req.params.title;

  movies.findOne({title: title})
    .then( movie => {
      if(!movie){
        return res.status(400).send({'message': 'Cannot find movie with this title... Please enter another.'})
      }
      res.status(200).json(movie.director);
      
    })
    .catch( err => {
      res.status(500).send(`Error: ${ err.stack }`)
    })

})

// POST Requests
app.post('/api/users', 
  [
    check('username', 'Username is must have 5 or more characters...').isLength({min: 5}),
    check('username', 'Username contains non-alphanumeric characters - not allowed...').isAlphanumeric(),
    check('password', 'Password is required...').not().isEmpty(),
    check('email', 'Email does not appear to be valid...').isEmail()
  ]
  ,(req, res) =>{

  let errors = validationResult(req),  
    hashedPwd = users.hashPassword(req.body.password);

    console.log(errors.array());

  if( !errors.isEmpty() ) {
    return res.status(422).json( {Error: errors.array()} )
  }

  users.findOne({username: req.body.username})
    .then( user => {
      if(user){
        return res.status(400).json({'message':'This user already exists...'})
      }else{
        users
          .create({
            username: req.body.username,
            password: hashedPwd,
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            birthday: req.body.birthday,
            //movies: req.body.movies
          })
            .then( user => {
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


// PUT Request
app.put('/api/users/:username/:movieID', passport.authenticate('jwt', {session: false}), ( req, res ) =>{ 
  users.findOneAndUpdate(
    { username: req.params.username },
    {$addToSet: 
      { movies: req.params.movieID }
    }, 
    { new: true })
    .then( user => {
      if( !user ){
        return res.status(400).send({'message': 'Could not find user...'})
      }
      res.status(200).json(user)
    }).catch( err => {
      res.status(500).send(`Error: ${ err.stack }`)
    })
});

app.put('/api/users/:username', passport.authenticate('jwt', {session: false}), (req, res) =>{
  users.findOneAndUpdate(
    {username: req.params.username},
    {$set: {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      birthday: req.body.birthday,
    }}, 
    {new: true})
    .then( user => {
      if( !user ){
        return res.status(400).send({'message': 'Could not find user...'})
      }
      res.status(200).json(userDetails(req))
    }).catch( err => {
      res.status(500).send(`Error: ${ err.stack }`)
    })
}) 

// DELETE Request
app.delete('/api/users/:username/:movieID', passport.authenticate('jwt', {session: false}), (req, res) =>{
  users.findOneAndUpdate(
    { username: req.params.username },
    {$pull: 
      { movies: req.params.movieID }
    }, 
    { new: true })
    .then( user => {
      if( !user ){
        return res.status(400).send({'message': 'User not found...'})
      }
      res.status(200).json(user)
    }).catch( err => {
      res.status(500).send(`Error: ${ err.stack }`)
    })
}) 

app.delete('/api/users/:username', passport.authenticate('jwt', {session: false}), (req, res) =>{
  users.findOneAndRemove({username: req.params.username})
    .then( user => {
      if( !user ) {
        return res.status(400).send({'message': 'User not found...'})
      }
    
      res.status(200).send(`${ req.params.username } was successfully deleted!`)
    }).catch( err => {
      res.status(500).send(`Error: ${ err.stack }`)
    })
}) 

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
  console.log(`CORS enabled web server listening on port: ${port}`);
});


