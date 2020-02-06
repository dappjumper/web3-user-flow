const EthUtil = require('ethereumjs-util');

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

var register = function(req, res, next){
	next();
}

var protected = function(req,res,next){
	if(req.user){
		next();
	} else {
		res.status(500).json({error:'login is required'});
	}
}

const middleware = {
	register: register,
	protected: protected
}

function _Web3UserFlow(options,app){
	options = options || {};
	var log = (!options.verbose ? ()=>{} : console.log)
	log("Web3 User Flow initiated"+(options.database ? ' with '+typeof options.database+' database.' : ' without database'))
	var wuf = {
		conf: {...defaultOptions,...options},
		db: (typeof options.database == 'string' ? 'connect' : (options.database||false)),
		app: app || false
	}

	if(wuf.app) app.get('/wuf/:static', (req,res)=>{res.sendFile(__dirname+'/dist/'+req.params.static);})

	for(var prop in middleware) {
		wuf[prop] = middleware[prop].bind(wuf);
	}

	if(wuf.db == 'connect') {
		return new Promise((resolve,reject)=>{
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
		})
	} else {
		log('No database connection established')
		return new Promise((resolve,reject)=>{
			resolve(wuf)
		})
	}
}

module.exports = _Web3UserFlow;