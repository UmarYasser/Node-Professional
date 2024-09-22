//EVERYTHING FOR EXPRESS
const express = require("express");
const app = express();
const fs = require("fs");
const morgan = require('morgan')
const sanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')

app.use(sanitize())
app.use(xss())

const rateLimit = require('express-rate-limit')
const CustomError = require('./Utils/CustomError.js')
const {NormalErrors} = require('./Controllers/GlobalErrorHandler.js')
const moviesRouter = require('./Routes/moviesRouter.js')
const authRouter = require('./Routes/authRouter.js');
const userRouter = require('./Routes/userRoute.js')

const productList = fs.readFileSync('./Template/text/product-list.html','utf-8')
const myhtml = fs.readFileSync("./Template/text/nav.html",'utf8');
const store = JSON.parse( fs.readFileSync('./Data/Store.json','utf-8'));
app.use(express.static('/Template'))

let movies = JSON.parse(fs.readFileSync("./Data/Movies.json"));
app.use(express.json())
app.set('trust proxy', 1); // 1 means trust the first proxy
//if(process.env.NODE_ENV == 'development')
  //  app.use(morgan('dev'))


app.use((req,res,next) =>{
  req.requestedAt = new Date().toISOString();
  next();
})

/*
let replaceHTML=  (template,prod) =>{
  let output = template;
  output = output.replace('{{%NAME%}}',prod.name);
  output = output.replace('{{%PRICE%}}',prod.price);
}
app.get('/',(req,res) =>{
  res.setHeader('Content-Type','text/html')
  res.end(myhtml)
})
app.get('/products',(req,res) =>{
  res.setHeader('Content-Type','text/html')
  res.end(myhtml.replace('{{%CONTENT%}}',productList))
}) */

const limiter = rateLimit({
  max:3,
  windowMs:100000,
  handler: function (req, res) {
    res.status(429).json({
      error: 'Too Many Requests, try again later.'
    });
  }
})

app.use('/api',limiter)
app.use('/api/v1/movies',moviesRouter);
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/users',userRouter);


app.all('*',(req,res,next) =>{
  const err = new CustomError(`${req.originalUrl} isn't found on The Server...`,404);
  next(err)
})
//Recive the errors from the above next fn
app.use(NormalErrors)

module.exports = app
