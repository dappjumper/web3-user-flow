const EthUtil = require('ethereumjs-util');

const verify = (publicKey, signature)=>{
	return new Promise((resolve,reject)=>{
		let res = EthUtil.fromRpcSig(signature);
		let decodedKey = EthUtil.bufferToHex(EthUtil.pubToAddress(EthUtil.ecrecover(EthUtil.hashPersonalMessage(Buffer.from(content)), res.v, res.r, res.s)));
		if(decodedKey == publicKey) {
			resolve({ok:true, publicKey: decodedKey})
		} else {
			reject({ok:false, publicKey: decodedKey})
		}
	})
}

module.exports = {
	expensive: {
		verify: verify
	}
}