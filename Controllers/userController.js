const CustomError = require('../Utils/CustomError');
const User = require('./../Models/userModel');
const {asyncErHandler,NormalErrors} = require('./GlobalErrorHandler');
const jwt = require('jsonwebtoken')

const signToken = (id)=>{
    return jwt.sign({id:id},process.env.SECRET_STR);
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


const getAllUsers = asyncErHandler( async(req,res,next) =>{
    const users = await User.find();
    if(!users){
        const err = new CustomError("There's no users to see",404);
        return next(err)
    }

    res.status(200).json({
        status:'success',
        count: users.length,
        data:{
            users
        }
    })
})

const filterReq = (reqBody,...allowedF) =>{
    let newObj = {};
    Object.keys(reqBody).forEach(prop =>{
        if(allowedF.includes(prop)){
            newObj[prop] = reqBody[prop];
        }
    })
    console.log('newObj:' ,newObj)
    return newObj;
}

//Has Protect MW Before it
const updatePassword  = asyncErHandler( async(req,res,next) =>{
    //1.Get User Data from DB
    const user = await User.findById(req.user._id).select('+password')

    //2.Check if Password is Correct
    if(!(await user.comparePassword(req.body.currentPassword,user.password))){  
        const err = new CustomError("Old Password isn't correct",401);
        console.log(req.body.currentPassword,user.password)           
        return next(err);
    }
  
    //3.Update The Password with the new one
    user.password = req.body.newPassword
    user.confirmPassword = req.body.confirmPassword

    await user.save();
    //4.Log In The User and send the jwt
    const loginToken = signToken(user._id);

    res.status(200).json({
        status:'success',
        message:"Password Updated",
        token:loginToken,
        user
    })
})

//Has Protect MW Before it
const updateMe = asyncErHandler(async(req,res,next) =>{
    //1.Check if body has password or confirmPassword
    if(req.body.password ||req.body.confirmPassword){
        const err = new CustomError("You can't use this endpoint to update password",400);
        return next(err); 
    }

    //2.Filter the fields to those only allowed to change
    const allowedFields = ['name','email','photo'];
    const filterObj = filterReq(req.body,...allowedFields)
    const user = await User.findByIdAndUpdate(req.user._id,filterObj,{runVaildators:true,new:true});
    

    res.status(200).json({
        status:'success',
        message:'User Info Updated',
        data:{
            user
        }
    })
})

//Has Protect MW Before it
const deleteMe = asyncErHandler(async(req,res,next) =>{
    await User.findByIdAndUpdate(req.user._id,{active:false});
    
    res.status(204).json({
        status:'success',
        data:null
    }) 
})
module.exports = {updatePassword,updateMe,deleteMe,getAllUsers};