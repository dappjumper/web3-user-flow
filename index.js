var express = require('express')
var app = express()

require('dotenv').config()

require('./web3userflow')({
	database: process.env.MONGODB_URI || "mongodb://localhost:27017/web3_example",
	verbose: (process.env.NODE_ENV == 'development')
}, app);

app.get('/', function (req, res) {
  res.sendFile(__dirname+'/dist/index.html');
})

app.get('/dist/:file', function(req,res){
	res.sendFile(__dirname+'/dist/'+req.params.file)
})

app.listen(process.env.PORT || 3000)