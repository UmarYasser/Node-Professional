//EVERYTHING FOR NODE
const dotenv = require('dotenv')
dotenv.config({path:'./config.env'});
const mongoose = require('mongoose')
const Movie = require('./Models/movieModel');

const app = require('./index');
mongoose.connect(process.env.CONN_STR)
.then( ()=> {console.log('Connection Established with MongoDB Atlas')})
.catch(err =>{ console.log('Error: ' + err.message)});

//Server Listening  
const Port = process.env.PORT || 3500;
app.listen(Port, () => {
    console.log(`-------------------\nServer running on Port: ${Port}`);
})