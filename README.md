# Web3 User Flow

https://web3-user-flow.herokuapp.com/ <- Live example

## Dependencies:
- express
- ethereumjs-util
- mongoose

### Developer dependencies:
- dotenv

## Installation
- Download subfolder "web3userflow"
- Place anywhere in your project
- Require the module and pass configuration and express object

## Serverside Example (without promises)
Does not wait for database connection
```javascript
require('./web3userflow')({
	database: 'mongodb://localhost:27017/web3_example', //Use local mongodb 
	verbose: true //Set to false to prevent log spam
}, app);

//app.listen etc

```

## Serverside Example (with promises)
Wait for database connection to be established
```javascript
require('./web3userflow')({
	database: 'mongodb://localhost:27017/web3_example', //Use local mongodb 
	verbose: true //Set to false to prevent log spam
}, app).then((web3userflow)=>{

//app.listen etc

}); 
```
.
## Clientside Example (Using bundled files + VueJS from CDN)
### index.html
```html
<body style="opacity:0;">
		<div id="app">
			<header>
				<div class="address">
					{{(user.connected && user.address ? user.address : 'Not logged in')}}
				</div>
			</header>

			<div v-if="user.connected">
				The user has a valid JWT token on their machine
			</div>
			
			<div v-if="!user.connected">
				<div v-if="metamask.installed && !metamask.connected">
					Metamask is installed, but user is not connected
					<button v-on:click="connectWeb3()" v-bind:class="{loading:loading.web3connect}">Connect</button>
					<div v-if="errors.web3connect">{{errors.web3connect}}</div>
				</div>

				<div v-if="metamask.installed && metamask.connected">
					Metamask is installed, and the selected user is {{user.address}}
					<button v-on:click="connectUser(user.address)" v-bind:class="{loading:loading.userconnect}">Sign in as {{user.address.substr(0,8)+'...'+user.address.substr(-6,42)}}</button>
					<div v-if="errors.userconnect">{{errors.userconnect}}</div>
				</div>
				
				<div v-if="!metamask.installed">
					Metamask is not installed
				</div>
			</div>

		</div>
		<script src="https://cdn.jsdelivr.net/npm/vue@2.6.11"></script>
		<script type="text/javascript" src="/wuf/dist/web3.js"></script>
		<script type="text/javascript" src="/wuf/dist/wuf.js"></script>
		<script type="text/javascript" src="/dist/main.js"></script>
	</body>
```
### main.js
```javascript
window.addEventListener("load", function(event) {
    var app = wuf.VueJS('#app',()=>{
        document.querySelector('body').setAttribute('style',''); //Smooth fadein to prevent ugly placeholders at load
    });
});
```
