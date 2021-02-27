let http = require('http');
let url = require('url');

http.createServer((req, res) =>{
  res.writeHead(200, {'contentType': 'text/plain'});
  let q = url.parse(req.url, true);
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
//Update the log.txt file using the 'f'ile 's'ystem module's appendFile method, with the request url.
  fs.appendFile('log.txt', `Date: ${new Date()}:\n URL: ${req.url}\n\n`, (err,file) =>{
    if(err) throw err;
    console.log(`${file} Saved!`);
  })
  

}).listen(8080);//Listen for http requests on port 8080


console.log('My first Node test server is running on Port 8080.');