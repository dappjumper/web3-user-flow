var express = require('express')
var app = express()

require('dotenv').config()

var init = require('./web3userflow');

init({
	database: process.env.MONGODB_URI,
	verbose: true
}, app).then((wuf)=>{

	app.get('/', function (req, res) {
	  res.sendFile(__dirname+'/dist/index.html');
	})

	app.get('/dist/:file', function(req,res){
		res.sendFile(__dirname+'/dist/'+req.params.file)
	})

	app.listen(process.env.PORT || 3000)

})