var express = require('express')
var app = express()

require('dotenv').config()

var init = require('./web3userflow');

var wuf = {};

init({
	database: process.env.MONGODB_URI,
	verbose: true
}).then((result)=>{

	app.get('/', function (req, res) {
	  res.send('Hello World!<br/><br/>')
	})

	app.post('/register', result.register, (req, res)=>{
		//
	})

	app.listen(3000)

})