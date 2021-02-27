let http = require('http');
let url = require('url');

http.createServer((req, res) =>{
  res.writeHead(200, {'contentType': 'text/plain'});
  let q = parse(req.url, true);
  filePath = '';

  if(q.path.include('documentation')){//set filePath to requested path in current directory
    filePath = `${__dirname}/documentation.html`;
  }else{// set filePath to home page
    filePath = index.html;
  }

  // Read the contents of the form filePath and return/log the data
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if(err) {
      throw err;
    }else{
      console.log(data);
    }
  })

  fs.appendFile('log.txt', `Date: ${new Date()} \n URL: ${}`, (err,file) =>{
    if(err) throw err;
    console.log(`${file} Saved!`);
  })
  

}).listen(8080);


console.log('My first Node test server is running on Port 8080.');