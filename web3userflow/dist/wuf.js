window.wuf = {
	host: (window.location.host.indexOf('localhost') > -1 ? 'http://' : 'https://')+window.location.host,
	url: "/wuf/api/",
	basePrefix: "_wuf_",
	error: {
		noJWT:"No JWT token found"
	}
}

wuf.getJWT = ()=>{
	return localStorage.getItem(wuf.basePrefix+'jwt');
}

wuf.checkJWT = ()=>{
	return new Promise((resolve, reject)=>{
		if(localStorage.getItem(wuf.basePrefix+'jwt')) {
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
			resolve();
        } else {
            console.log("Web3provider not found")
            reject();
        }
	})
}

wuf.hasVisibleAccount = ()=>{
    return new Promise((resolve, reject)=>{
        if(wuf.account.selectedAddress) {
            resolve(wuf.account.selectedAddress)
        } else {
            reject()
        }
    })
}

wuf.connectWeb3 = ()=>{
	return new Promise((resolve, reject)=>{
		if(window.ethereum) {
			window.ethereum.enable().then((response)=>{
				resolve();
			}).catch((error)=>{
				reject("Metamask connection prompt was denied");
			});
		} else {
			reject("No available provider")
		}
	})
}

wuf.apicall = {
	getUser: (user)=>{
		return wuf.api('user/' + user.address)
	}
}

wuf.api = (endpoint, publicKey, payload)=>{
	return new Promise((resolve, reject)=>{
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			console.log(wuf.host+wuf.url+endpoint)
		    if (this.readyState == 4 && this.status == 200) {
		        resolve(this.responseText)
		    } else {
		        if (this.readyState == 4 && this.status != 200) {
		            reject()
		        }
		    }
		};
		xhttp.open((payload ? 'POST' : 'GET'), wuf.host+wuf.url+endpoint, true);
		if(publicKey) xhttp.setRequestHeader('publicKey', publicKey);
		if (typeof wuf.getJWT() == 'string') xhttp.setRequestHeader('jwtToken', wuf.getJWT());
		xhttp.send((payload ? JSON.stringify(payload) : null));
	})
}

wuf.VueJS = (selector, onload)=>{
	return new Vue({
    	el: selector,
        mounted: function(){
        	if(onload) try {
        		onload();
        	} catch(e){}

            if(window.wuf) {
                wuf.getWeb3().then((address)=>{
                    this.metamask.installed = true;
                    this.metamask.connected = (address ? true : false);
                    this.addressInterval = setInterval(this.setAddress, 500);
                    this.setAddress(address);
                }).catch(()=>{
                    this.metamask.installed = false;
                })
            } else {
                //Something went terribly wrong
            }
        },
    	data: {
            user: {
                address: false,
                connected: false
            },
            metamask: {
                installed: false,
                connected: false
            },
            loading: {
                web3connect: false,
                userconnect: false
            },
            errors: {
                web3connect: "",
                userconnect: ""
            },
            addressInterval: false
        },
        methods: {
            setAddress: function(providedAddress){
                this.user.address = providedAddress || this.getAddress();
                this.metamask.connected = (this.user.address ? true : false);
            },
            getAddress: function(){
                if(wuf.account.selectedAddress) {
                    return wuf.account.selectedAddress;
                } else {
                    return false;
                }
            },
            connectUser: function(userAddress){
            	this.loading.userconnect = true;
            	wuf.apicall.getUser({address:userAddress}).then((result)=>{
            		//API responded!
            		if(typeof result == 'string') result = JSON.parse(result)
            		if(!result.error) {
            			this.loading.userconnect = false;
            			this.errors.userconnect = "User was found, time to login! Under construction"
            		} else {
            			this.loading.userconnect = false;
            			this.errors.userconnect = "User was not found, time to register! Under construction"
            		}
            	}).catch((error)=>{
            		//API error
            		this.loading.userconnect = false;
            		this.errors.userconnect = "API failed to respond properly"
            	})
            },
            connectWeb3: function(){
                if(this.metamask.installed && wuf.provider) {
                    this.loading.web3connect = true;
                    this.errors.web3connect = "";
                    wuf.connectWeb3().then((address)=>{
                        //Connected
                        this.errors.web3connect = "";
                        this.addressInterval = setInterval(this.setAddress, 500);
                        this.setAddress(address);
                    }).catch((error)=>{
                        //Denied
                        this.loading.web3connect = false;
                        this.errors.web3connect = error;
                    });
                }
            }
        }
    });
}