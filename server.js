const http = require('http'),
  url = require('url'),
  fs = require('fs');

http.createServer((req, res) =>{
  let q = url.parse(req.url, true);
  filePath = '';

  if(q.pathname.includes('documentation')){//set filePath to requested path in current directory
    filePath = `${__dirname}/documentation.html`;
  }else{// set filePath to home page
    filePath = 'index.html';
  }

//Update the log.txt file using the 'f'ile 's'ystem module's appendFile method, with the request url.
  fs.appendFile('./log.txt', `Date: ${new Date()}:\n URL: ${req.url}\n\n`, (err) =>{
    if(err){
      throw err
    };
    console.log('Files Saved!');
  })
  
// Read the contents of the form filePath and return/log the data
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if(err) {
      throw err;
    }

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end('Accessed');
    
  })

}).listen(8080);//Listen for http requests on port 8080


console.log('My first Node test server is running on Port 8080.');



