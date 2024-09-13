//Import from the Json file the db
const mongoose = require('mongoose')
const fs = require('fs')
const dotenv = require('dotenv');
const Movie = require('./../Models/movieModel')
dotenv.config({path:'./config.env'});
//Connection
mongoose.connect(process.env.CONN_STR) 
.then((conn) => {console.log('Connection Established with MongoDB Atlas')}) 
.catch( (err) => {err.message})

//Read JSON file
// readFileSync will run in the cmd so the path should be relative to the root directory
const movies = JSON.parse(fs.readFileSync('./Data/Movies.json'))

const deleteMovies = async() =>{
  try{
    await Movie.deleteMany();
    console.log('Data Deleted...')
  }catch(err){
    console.log(err)
  }
  process.exit()
} 

const importMovies = async() =>{
  try{
    await Movie.create(movies);
    console.log("Data Imported Successfully")
  }catch(err){
    console.log(err.message)
  }
  process.exit()
}

console.log(process.argv)
if(process.argv[2] == '--import'){
  importMovies();
}
else if(process.argv[2] == '--delete'){
  deleteMovies();
}
setTimeout(() =>{
console.log("Done...")
},3500)