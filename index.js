var express = require('express')
var app = express()
var web3UserFlow = require('./web3userflow')({
	/* Options */
	debug: false
});
app.use(web3UserFlow);

app.get('/', function (req, res) {
  res.send('Hello World!<br/><br/>')
})

app.listen(3000)