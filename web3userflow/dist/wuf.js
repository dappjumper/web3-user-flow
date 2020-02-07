window.wuf = {
	rootURL: window.location.host,
	baseURL: "/api/wuf/",
	basePrefix: "_wuf_",
	error: {
		noJWT:"No JWT token found"
	}
}

wuf.checkJWT = ()=>{
	return new Promise((resolve, reject)=>{
		if(localStorage.getItem(wuf.basePrefix+'jwt')) {
			let url = wuf.baseURL + wuf.baseURL + '/user';
			resolve(url)
		} else {
			reject(wuf.error.noJWT)
		}
	});
}

wuf.getWeb3 = ()=>{
	return new Promise((resolve, reject)=>{
		if (typeof Web3 !== 'undefined') {
			wuf.provider = new Web3(Web3.givenProvider);
			wuf.account = wuf.provider.givenProvider;
			resolve(wuf.account.selectedAddress)
        } else {
            reject();
        }
	})
}

wuf.connectWeb3 = ()=>{
	return new Promise((resolve, reject)=>{
		if(window.ethereum) {
			window.ethereum.enable().then((response)=>{
				resolve();
			}).catch((error)=>{
				reject("Denied");
			});
		} else {
			reject("No available provider")
		}
	})
}

wuf.provider = false;

wuf.api = {

}

wuf.login = ()=>{

}

wuf.init = ()=>{

}