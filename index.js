const express = require('express'),
 morgan = require('morgan'),
 bodyParser = require('body-parser'),
 uuid = require('uuid');
  
const app = express();

// In-Memory Data 
let movies = [
  {
    'title': 'Movie 1',
    'discription': '...1',
    'genre': 'Romance',
    'director': 'John Doe',
    'img': 'www.1.mov'
  },
  {
    'title': 'Movie 2',
    'discription': '... 2',
    'genre': 'Comedy',
    'director': 'Rick Smith',
    'img': 'www.2.mov'

  },
  {
    'title': 'Movie 3',
    'discription': '... 3',
    'genre': 'Action',
    'director': 'Norman Way',
    'img': 'www.3.mov'
  },
  {
    'title': 'Movie 3',
    'discription': '... 4',
    'genre': 'Horror',
    'director': 'Sandy Ross',
    'img': 'www.4.mov'
  },
  {
    'title': 'Movie 5',
    'discription': '... 5',
    'genre': 'Historic',
    'director': 'Tysha Galloway',
    'img': 'www.5.mov'
  }
];
app.use(morgan(':method :host :url :status :res[content-length] - :response-time ms')); 
app.use(bodyParser.json());

app.use(express.static('public'));

morgan.token('host', (req, res) =>{
  return req.hostname;
})

app.use((err, req, res, next)=>{
  console.error(err.stack);
  res.status(500).send('Something Broke');
  
})
// GET Request
app.get('/api/movies', (req, res, next) =>{
  res.send(movies);
})
app.get('/api/movies/:title', (req, res) =>{
  let title = req.params.title;

  let reqMovie = movies.find((movie) => {
    return movie.title === title;
  })
  if(reqMovie){
    res.send(reqMovie);
  }else{
    res.status(404).send('Movie not Found');
  }
  
})
app.get('/api/movies/:title/genre', (req, res) =>{
  res.send(`title has gerne of ...`);
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

