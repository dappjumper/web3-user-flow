const EthUtil = require('ethereumjs-util');

const User = require('./user');

const Jwt = require('express-jwt');
const JwtGen = require('jsonwebtoken');

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
	verbose: false,
	registrationChallenge: (user)=>{
		return "I wish to register on this work in progress as: "+user.address
	},
	loginChallenge: (user)=>{
		return "I wish to login on this work in progress as: "+user.address+" with nonce: "+(parseInt(user.nonce)+1)
	},
	decodeSignature: (signature, content)=>{
		return new Promise((resolve, reject)=>{
			var res = EthUtil.fromRpcSig(signature);
			var addr = EthUtil.bufferToHex(EthUtil.pubToAddress(EthUtil.ecrecover(EthUtil.hashPersonalMessage(Buffer.from(content)), res.v, res.r, res.s)));
			if(addr) {
				resolve(addr)
			} else {
				reject()
			}
		})
	}
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
	'/wuf/dist/:static/:sub?/:sub2?/:sub3?': {
		method: "get",
		function: (req,res)=>{
			res.sendFile(__dirname+'/dist/'+req.params.static+(req.params.sub||'')+(req.params.sub2||'')+(req.params.sub3||''));
		}
	},
	'/wuf/api/user/:address': {
		method: "get",
		description: "",
		protected: false,
		function: function(req,res){
			let userAddress = req.params.address;
			if(typeof userAddress == 'string' && (userAddress||'').length == 42) {
				User.model.findOne({address:userAddress}, "address nonce", function(err, user){
					if(!err && user) {
						res.send({user: user.address, challenge:this.loginChallenge({address:user.address,nonce:user.nonce})})
					} else {
						res.send({error:"User not found",challenge:this.registrationChallenge({address:userAddress})})
					}
				}.bind(this))
			} else {
				res.send({error:"Invalid address",address:userAddress})
			}
		}
	},
	'/wuf/api/user/:address/profile': {
		method: "get",
		description:"",
		protected: true,
		function: function(req,res){
			User.model.findOne({address:req.user.address}, function(err, user){
				if(!err && user) {
					res.send({user: user})
				} else {
					res.send({error:"User not found"})
				}
			}.bind(this))
		}
	},
	'/wuf/api/user/:address/getjwt': {
		method: "post",
		description:"",
		protected: false,
		function: function(req,res){
			if(!req.params.address) return res.send({error:"No address specified"})
			if(!req.body.signature) return res.send({error:"No signature attached"})
			User.model.findOne({address:req.params.address}, "address nonce", (err, user)=>{
				let challenge = ""
				if(err) {
					return res.send({error:"Could not look for user: "+req.params.address})
				}
				if(user) {
					//Login challenge
					challenge = this.loginChallenge(user)
				} else {
					//Registration challenge
					challenge = this.registrationChallenge({address:req.params.address})
				}
				this.decodeSignature(req.body.signature, challenge)
					.then((address)=>{
						JwtGen.sign({ address: address }, process.env.JWTSECRET, function(err, token) {
						  if(err) return res.send({error:"Could not generate token"})
						  User.model.updateOne({address: address}, {$set: {address:address}, $inc:{nonce: 1}}, {upsert:true})
							.then(()=>{
								res.send({token:token, address:address})
							})
							.catch(()=>{
								res.send({error:"Failed to login or register"})
							})
						});
					})
					.catch(()=>{
						res.send({error:"Invalid signature"})
					})
			})
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
			log('Protected route: <'+route.method+'>"'+prop+'" available')
			wuf.app[route.method](prop,Jwt({secret: process.env.JWTSECRET }), route.function.bind(wuf.conf))
		} else {
			log('Public route: <'+route.method+'>"'+prop+'" available')
			wuf.app[route.method](prop,route.function.bind(wuf.conf))
		}
	}

	return (wuf.db == 'connect' ? new Promise((resolve,reject)=>{
		log('Connecting to database')
		let mongoose = require('mongoose')
		mongoose.connect(options.database,{useUnifiedTopology: true,useNewUrlParser: true})
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