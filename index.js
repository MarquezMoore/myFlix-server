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

const express = require('express'),
 morgan = require('morgan'),
 bodyParser = require('body-parser'),
 uuid = require('uuid'),
 mongoose = require('mongoose'),
 models = require('./models.js');
  
const app = express();
const movies = models.movie;
const users = models.user;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });


/*
  To be used on each request
*/
app.use(morgan(':method :host :url :status :res[content-length] - :response-time ms')); // ??
app.use(bodyParser.json()); // ?? 
app.use(express.static('public'));// ??

morgan.token('host', (req, res) =>{ // ??
  return req.hostname;
})

app.use((err, req, res, next)=>{// ??
  console.error(err.stack);
  res.status(500).send('Something Broke');
  
})



/*
  Routes
*/

// GET Requests
app.get('/api/movies', (req, res ) =>{
  movies.find()
    .then((movies) => {
      if(!movies){
        return res.status(400).send({'message': 'No movies not found...'});
      }
      res.status(200).json(movies);
    })
    .catch((err) => {
      res.status(500).send(`Error: ${ err.stack }`);
    })
})

app.get('/api/movies/:title', (req, res) =>{
  let title = req.params.title;

  movies.findOne({title: title})
    .then((movie) => {
      if(!movie){
        return res.status(400).send({'message': 'Cannot find movie with this title...'})
      }
      res.status(200).json(movie);
    })
    .catch((err) => {
      res.status(500).send(`Error: ${ err.stack }`);
    })
  
})

app.get('/api/genre/:genre', (req, res) =>{
  let genre = req.params.genre;

  movies.findOne({'genre.name': genre})
    .then((movie) => {
      if(!movie){
        return res.status(400).send({'message': 'Cannot find genre with this name...'})
      }
      res.status(200).json(movie.genre.description);
    })
    .catch((err) => {
      res.status(500).send(`Error: ${ err.stack }`);
    })
}) 


app.get('/api/movies/:title/director', (req, res) =>{
  let title = req.params.title;

  movies.findOne({title: title})
    .then((movie) => {
      if(!movie){
        return res.status(400).send({'message': 'Cannot find movie with this title... Please enter another.'})
      }
      res.status(200).json(movie.director);
      
    })
    .catch((err) => {
      res.status(500).send(`Error: ${ err.stack }`)
    })

})

// POST Requests
app.post('/api/users',(req, res) =>{
  users.findOne({username: req.body.username})
    .then((user) => {
      if(user){
        return res.status(400).json({'message':'This user already exists...'})
      }else{
        users
          .create({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            birthday: req.body.birthday,
            movies: req.body.movies
          })
            .then(user => {
              res.status(201).json(user);
            })
            .catch(err => {
              res.status(400).send(`Error: ${ err.stack }`);
            })
      }
    })
    .catch((err) => {
      res.status(500).send(`Error: ${ err.stack }`)
    })
})


// PUT Request
app.put('/api/users/:username/:movieID', ( req, res ) =>{ 
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

app.put('/api/users/:username', (req, res) =>{
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
      res.status(200).json(user)
    }).catch( err => {
      res.status(500).send(`Error: ${ err.stack }`)
    })
}) 

// DELETE Request
app.delete('/api/users/:username/:movieID', (req, res) =>{
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

app.delete('/api/users/:username', (req, res) =>{
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


app.listen(8080, () => {
  console.log('Listening on port 8080');
})


