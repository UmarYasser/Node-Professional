const CustomError = require('../Utils/CustomError');
const User = require('./../Models/userModel');
const {asyncErHandler,NormalErrors} = require('./GlobalErrorHandler');
const jwt = require('jsonwebtoken')
const util = require('util')
const crypto = require('crypto')
const Email = require('./../Utils/Email')



const signToken = (id) => {
    return jwt.sign({id:id},process.env.SECRET_STR/*, {expiresIn: process.env.EXPIRES_IN}*/);
}

const createRes = (user,statusCode,res) =>{
    const token = signToken(user._id);


    const options = {
        maxAge:process.env.EXPIRES_IN,
        httpOnly:true
    }

    if(process.env.NODE_ENV === 'production'){
        options.secure = true;
    }

    res.cookie('jwt',token,options)

    user.password = undefined

    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
}

const signup = asyncErHandler( async(req,res,next) => {
    const newUser = await User.create(req.body);
    const token = signToken(newUser._id);
    console.log('USer Created!')
   createRes(newUser,201,res);
})
//$2a$12$jmkSH7Nr8m8rDNkIFPY8H.HFEQ1PBnYDDwhMKdrwIME1osA7YZ52C
const login = asyncErHandler( async(req,res,next) => {
    const {email,password} = req.body;
    if(!email || !password){
        const err = new CustomError("Please Enter an Email and a Password");
        return next(err);
    } 

    const user = await User.findOne({email:email}).select('+password')
    
    if(!user){
        const err = new CustomError('Wrong Email...',404)
        return next(err)
    }
    
    const isMatch = await user.comparePassword(password,user.password);
    if(!isMatch){
        const err = new CustomError('Wrong Password...',404);
        return next(err);
    }
    console.log(req.get('host'))
    const token = signToken(user._id);
    createRes(user,200,res);

}) 

// For checking if the user is logged in
const protect = asyncErHandler( async(req,res,next) =>{
    //1. Read the token & check if it exists
    const testToken = req.headers.authorization;
    let token
    
    if(testToken && testToken.startsWith('bearer')){
        token = testToken.split(' ')[1]; // [0] = bearer, [1] = {the token}
    } 
     
    if(!token) {
        console.log('token:' + token)
        return next(new CustomError('You are not logged in',401))
    }
     
    //2. Validate Token    
    const decoded = await util.promisify(jwt.verify)(token,process.env.SECRET_STR)
    // Returns the user ID, Time The Token was issued (iat) <= will be used
    //3. Ensure that the user exists
    const user = await User.findById(decoded.id);

    if(!user ) { next(new CustomError("The User with that token isn't found at the moment",401)) }; 
    
    //4. Check if the Password is changed
    const isChangedAfterIssue = await user.isPasswordChanged(decoded.iat);

    if(isChangedAfterIssue){
        const err = new CustomError('Password Changed! Please Log In Again...',401)
        return next(err);
    }

    //5. Continuing the Stack
    req.user = user
    next()
})

//For Roles
const restrict = (...role) => {
    return (req,res,next) =>{
        if(!role.includes(req.user.role)){
            const err = new CustomError("'You Don't have the permission to perform this action",403);
            return next(err);
        }
        next()
    }
}

const forgotPassword = asyncErHandler(async(req,res,next) =>{
    //1.Get THe User with the given Email
    const user = await User.findOne({email:req.body.email})
    
    if(!user){
        const err = new CustomError("Can't find a user with this email...",401);
        return next(err);
    }
    //2.Generate A Random Token
    const resetToken =  await user.resetPasswordToken();
   
   
        //sSave changes on the user
    await user.save({validateBeforeSave:false})

    //3.Send the token back to the User's Email
    const devUrl = `sturdy-rotary-phone-5jrxjr469q4c74x9-3000.app.github.dev/`
    const resetUrl = `${req.protocol}://${devUrl}api/v1/users/resetPassword/${resetToken}\n\n`
    const until = Date.now() +10*60*1000
    const message = `We have recieved a password reset request, Please use the link below the reset it\n\n${resetUrl}This link will only be valid for 10 mins. (${new Date(until)})`
   
    try{
        await Email.sendEmail({
             email: user.email,
            message:message,
            subject: 'Password Reset Request'
        })

        res.status(200).json({
            status:'success',
            message:'Password Reset link sent'
        })
    }catch(err){
        user.passwordResetToken = undefined;
        user.resetTokenExpires = undefined;

        user.save({validateBeforeSave:false})
        return next( new CustomError('There was a problem sending the email: ' + err.message,500));
    }
})

const resetPassword = asyncErHandler( async(req,res,next) =>{
    //1.Find User with the given Password Reset Token && validate the token
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({passwordResetToken:token,resetTokenExpires: {$gt:Date.now()}});
  
    if(!user){
        const err = new CustomError('Token has expired ( Vaild for 10 mins only) ',401);   
        console.log(`${Date.now()},${new Date(user.resetTokenExpires)}`);
        return next(err)
    }
    
    //2.Set the user's password with the new password
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.resetTokenExpires = undefined;
    user.isChangedAt = Date.now();
    
    user.save();
    
    //3. Log In The User
    const loginToken = signToken(user._id);

    res.status(200).json({
        status:'success',
        token: loginToken
    })

})



module.exports = {signup,login,protect,restrict,forgotPassword,resetPassword}