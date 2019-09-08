var http = require('http');
var url= require('url');


http.createServer(function (req, res) {
    var queryParams=url.parse(req.url,true).query;
  res.write('Hello '+queryParams.email); //write a response to the client
  res.end(); //end the response
}).listen(8080);

function createLicenseKey(userEmail){

    
}

checkUserExists(String email){

}