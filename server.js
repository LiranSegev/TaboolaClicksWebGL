var express = require('express');
 
var server = express();
 
var port = 3000;
server.listen(port, function() {
    console.log('server listening on port ' + port);

});
server.use(express.static("globe"));
server.use(express.static(__dirname));