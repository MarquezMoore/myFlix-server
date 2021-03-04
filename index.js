const express = require('express');
const morgan = require('morgan');
  
const app = express();
 


app.use(express.static('public'));

morgan.token('host', (req, res) =>{
  return req.hostname;
})
app.use(morgan(':method :host :url :status :res[content-length] - :response-time ms')); 

app.use((err, req, res, next)=>{
  console.error(err.stack);
  res.status(500).send('Something Broke');
  //res.status(404).send('Something Broke') ... tried to test this with 404, however, did not work.
})

app.get('/', (req, res, next) =>{
  res.send('This is the /index.html');
})

app.get('/movies', (req, res, next) =>{
  res.send({
    '1' : 'Movie 1',
    '2' : 'Movie 2',
    '3' : 'Movie 3',
    '4' : 'Movie 4',
    '5' : 'Movie 5',
    '6' : 'Movie 6',
    '7' : 'Movie 7',
    '8' : 'Movie 8',
    '9' : 'Movie 9',
    '10' : 'Movie 10'
  })
});

app.listen(8080, ()=>{
  console.log('Listening on port 8080');
})

