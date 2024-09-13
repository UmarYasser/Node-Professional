const CustomError = require('./../Utils/CustomError')
const devEr = (res,err)=>{
     res.status(err.statusCode).json({
       status:err.status,
       message:err.message,
       error: err,
       stackTrace:err.stack
    })
}

const prodEr = (res,err) =>{
  if(err.isOpretional){ //For error created from our code
    console.log('Error is opreatinal!')
    res.status(err.statusCode).json({
       status:err.status,
       message:err.message
    })
  }else{ // For errors created from MongoDB server
    console.log('Error is NOT opreatinal!')
    res.status(500).json({
      status: 'error',
      message: 'Something went Wrong, try again later'
    })
  }
}
const CastErHandler = (err) =>{
  const msg = `The value ${err.value} isn't acceptable for ${err.path} field`;
  console.log('CastError Detected!')
  return new CustomError(msg,400)
}
const DuplicateErHandler = (err) =>{
  const msg = `The Movie with the name '${err.errorResponse.keyValue.name}' has a duplicate`
  return new CustomError(msg,400);
} 
const ValidationErHandler = (err) =>{
  const e1 = Object.values(err.errors).map(el => el.message);
  const eMsg = e1.join('. ');
  console.log(eMsg);
  return new CustomError(eMsg,401)
}
   
exports.NormalErrors = (err,req,res,next) =>{
   err.statusCode= err.statusCode || 500;
   err.status = err.status || 'error';
  if(process.env.NODE_ENV === 'development'){
    devEr(res,err)
  }else if(process.env.NODE_ENV === 'production'){
    if(err.name === 'CastError'){  err = CastErHandler(err)  }
    console.log(err.code); 
    if(err.code === 11000){  err = DuplicateErHandler(err)  }
    if(err.name === 'ValidationError'){  err = ValidationErHandler(err) }
    prodEr(res,err)
  }  
  //Makes a Jsend with setting the error statuses
}

exports.asyncErHandler = (func)=>{
  return (req,res,next) =>{
    func(req,res,next).catch(e => next(e))
  } // the controller fn must have those 3 args too
}
