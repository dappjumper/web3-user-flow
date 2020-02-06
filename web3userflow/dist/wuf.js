window.wuf = {
	rootURL: window.location.host,
	baseURL: "/api/wuf/",
	basePrefix: "_wuf_",
	error: {
		noJWT:"No JWT token found"
	}
}

wuf.validateLogin = ()=>{
	return new Promise((resolve, reject)=>{
		if(localStorage.getItem(wuf.basePrefix+'jwt')) {
			let url = wuf.baseURL + wuf.baseURL + '/user';
			resolve(url)
		} else {
			reject(wuf.error.noJWT)
		}
	});
}