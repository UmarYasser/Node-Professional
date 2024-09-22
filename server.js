//EVERYTHING FOR NODE
const dotenv = require('dotenv')
dotenv.config({path:'./config.env'});
const mongoose = require('mongoose')
const Movie = require('./Models/movieModel');

const app = require('./index');
mongoose.connect(process.env.CONN_STR)
.then( ()=> {console.log('Connection Established with MongoDB Atlas')})


//Server Listening  
const Port = process.env.PORT || 3500;
const server = app.listen(Port, () => {
    console.log(`-------------------\nServer running on Port: ${Port}`);
})
  
process.on('unhandledRejection',(err) =>{
  console.log(err.name,err.message)
  console.log('Unhandled Rejection Detected! Self-destructing now...');
  server.close( () =>{
    process.exit(1);
  })

})