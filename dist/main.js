window.addEventListener("load", function(event) {
    var app = new Vue({
    	el: '#app',
        mounted: function(){
            document.querySelector('body').setAttribute('style',''); //Smooth fadein to prevent ugly placeholders at load
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
                web3connect: false
            },
            errors: {
                web3connect: ""
            },
            addressInterval: false
        },
        methods: {
            setAddress: function(providedAddress){
                console.log(providedAddress || this.getAddress())
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
});