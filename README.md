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

## Example (without promises)
Does not wait for database connection
```
require('./web3userflow')({
	database: 'mongodb://localhost:27017/web3_example', //Use local mongodb 
	verbose: true //Set to false to prevent log spam
}, app); //Remember to pass express app object

//app.listen etc

```

## Example (with promises)
Wait for database connection to be established
```
require('./web3userflow')({
	database: 'mongodb://localhost:27017/web3_example', //Use local mongodb 
	verbose: true //Set to false to prevent log spam
}, app).then((web3userflow)=>{

//app.listen etc

}); //Remember to pass express app object
```