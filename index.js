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
        return res.status(404).send({'message': 'No movies not found...'});
      }
      res.status(200).json(movies);
    })
    .catch((err) => {
      res.status(500).send(`Error: ${err}`);
    })
})

app.get('/api/movies/:title', (req, res) =>{
  let title = req.params.title;

  movies.find({title: title})
    .then((movie) => {
      if(movie === []){
        return res.status(404).send({'message': 'Cannot find movie with this title...'})
      }
      res.status(200).json(movie);
    })
    .catch((err) => {
      res.status(500).send(`Error: ${err}`);
    })
  
})

app.get('/api/genre/:genre', (req, res) =>{
  let genre = req.params.genre;

  movies.find({'genre.name': genre})
    .then((movie) => {
      if(!movie){
        return res.status(404).send({'message': 'Cannot find genre with this name...'})
      }
      res.status(200).json(movie.genre.description);
    })
    .catch((err) => {
      res.status(500).send(`Error: ${err}`);
    })
}) 


app.get('/api/movies/:title/director', (req, res) =>{
  res.send('Director is being fetched');
})

// POST Requests
app.post('/api/users',(req, res) =>{
 res.send('Registration Successful');
})
app.post('/api/movies', (req, res) =>{
  res.send('Movie has been added');
}) 

// PUT Request
app.put('/api/movies', (req, res) =>{
  res.send('Movie has been updated');
}) 
app.put('/api/users/:username', (req, res) =>{
  res.send('User has been updated');
}) 

// DELETE Request
app.delete('/api/movies', (req, res) =>{
  res.send('Movie has been removed');
}) 
app.delete('/api/users', (req, res) =>{
  res.send('User has been removed');
}) 


app.listen(8080, () =>{
  console.log('Listening on port 8080');
})

