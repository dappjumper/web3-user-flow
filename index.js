var express = require('express')
var app = express()

require('dotenv').config()

var init = require('./web3userflow');

init({
	database: process.env.MONGODB_URI,
	verbose: true
}, app).then((result)=>{

	app.get('/', function (req, res) {
	  res.sendFile(__dirname+'/dist/index.html');
	})

	app.listen(3000)

})