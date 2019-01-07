var express = require('express');
var app = express();
var port = process.env.NODE_ENV === 'test' ? 8001 : 8000;

app.use(express.static('.'));
app.listen(port);

console.log('Server is running on localhost:' + port);