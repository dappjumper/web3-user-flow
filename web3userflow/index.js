const EthUtil = require('ethereumjs-util');

const User = require('./user');

const verify = (publicKey, signature, content)=>{
	return new Promise((resolve,reject)=>{
		let res = EthUtil.fromRpcSig(signature);
		let key = [publicKey,""];

		key[1] = EthUtil.bufferToHex(EthUtil.pubToAddress(EthUtil.ecrecover(EthUtil.hashPersonalMessage(Buffer.from(content)), res.v, res.r, res.s))) || '';
		
		for(var s in key) {
			key[s] = (key[s].indexOf('0x') > -1 ? key[s] : '0x'+key[s]).toLowerCase();
		}

		if(key[0] == key[1]) {
			resolve({keys:key})
		} else {
			reject({keys:key})
		}
	})
}

const defaultOptions = {
	database: false,
	verbose: false
}

var protected = function(req,res,next){
	if(req.user){
		next();
	} else {
		res.status(500).json({error:'login is required'});
	}
}

const middleware = {
	protected: protected
}

const routes = {
	'/wuf/:static/:sub?/:sub2?/:sub3?': {
		method: "get",
		function: (req,res)=>{
			res.sendFile(__dirname+'/dist/'+req.params.static+(req.params.sub||'')+(req.params.sub2||'')+(req.params.sub3||''));
		}
	},
	'/wuf/api/user': {
		method: "get",
		description: "",
		protected: false,
		function: (req,res)=>{
			res.send("200");
			let userAddress = req.body.address;
			if(typeof userAddress == 'string' && (userAddress||'').length == 42) {
				res.send({address:userAddress})
			} else {
				res.send({error:"Invalid address"})
			}
		}
	}
}

function _Web3UserFlow(options,app){
	options = options || {};
	var log = (!options.verbose ? ()=>{} : console.log)
	
	log("web3-user-flow loading verbosely "+(options.database ? 'with '+typeof options.database+' database.' : 'without database'))
	
	var wuf = {
		conf: {...defaultOptions,...options},
		db: (typeof options.database == 'string' ? 'connect' : (options.database||false)),
		app: app || false
	}

	for(var prop in middleware) {
		log('Loading middleware: '+prop)
		wuf[prop] = middleware[prop].bind(wuf);
	}

	if(wuf.app) for(var prop in routes) {
		let route = routes[prop];
		if(route.protected) {
			log('Protected route: "'+prop+'" available')
			wuf.app[route.method](prop,wuf.protected, route.function)
		} else {
			log('Public route: "'+prop+'" available')
			wuf.app[route.method](prop,route.function)
		}
	}

	return (wuf.db == 'connect' ? new Promise((resolve,reject)=>{
		log('Connecting to database')
		let MongoClient = require('mongodb').MongoClient
		MongoClient.connect(options.database,{useUnifiedTopology: true})
		.then(function (db) {
			log('Database connection success')
			wuf.db = db
			resolve(wuf)
		})
		.catch(function (err) {
			log('Database connection failed')
			wuf.db = false
			resolve(wuf)
		})
	}) : new Promise((resolve,reject)=>{
		log('No database connection established')
		resolve(wuf)
	}))
}

module.exports = _Web3UserFlow;