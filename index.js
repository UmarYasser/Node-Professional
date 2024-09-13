//EVERYTHING FOR EXPRESS

const express = require("express");
const app = express();
const fs = require("fs");
const morgan = require('morgan')
const CustomError = require('./Utils/CustomError.js')
const {NormalErrors} = require('./Controllers/GlobalErrorHandler.js')
const moviesRouter = require('./Routes/moviesRouter.js')


const myhtml = fs.readFileSync("./Template/text/nav.html",'utf8');
app.use(express.static('/Template'))

 

let movies = JSON.parse(fs.readFileSync("./Data/Movies.json"));
app.use(express.json())
if(process.env.NODE_ENV == 'development')
  //  app.use(morgan('dev'))

app.use((req,res,next) =>{
  req.requestedAt = new Date().toISOString();
  next();
})

app.get('/',(req,res) =>{
  res.end(myhtml)
}) 

app.use('/api/v1/movies',moviesRouter);
app.all('*',(req,res,next) =>{
  /*res.status(404).json({
    status:'fail',
    message:``
  })*/
  const err = new CustomError(`${req.originalUrl} isn't found on The Server...`,404);
  next(err)
})
//Recive the errors from the above next fn
app.use(NormalErrors)

module.exports = app