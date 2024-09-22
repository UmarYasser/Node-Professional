const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please Enter a Name!'],
        minlength:[4,'Name must have atleast 4 characters']
    },
    email:{
        type:String,
        unique:false,
        required:[true,'Please Enter an Email!'],
        validate: {
            validator: (value) => {
            return validator.isEmail(value);
            },
            message:"Please Enter a valid Email!"
        }

    }, //npm install validator , require vaildator
    photo: String,
    password:{
        type:String,
        required:[true,'Please Enter a Password!'],
        minlength:[8,'Password must be alteast 8 characters'],
        select:false
    },
    confirmPassword:{
        type:String,
        required:[true,'Please Confirm Your Password!'],
        validate:{
            validator: function(v){
                return v === this.password;
            },
            message: "The Password Doesn't match!"
        }
    },
    role:{
        type:String,
        enum:['user','admin','test'],
        default:'user'
    },
    active:{
        type:Boolean,
        select:false,
        default:true
    },
    passwordChanged:Date,
    passwordResetToken:String,
    resetTokenExpires:Date
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
     
    this.password = await bcrypt.hash(this.password,12);
    this.confirmPassword = undefined;
    next(); 
})

userSchema.methods.comparePassword = async(pass,passDB) =>{
    return await bcrypt.compare(pass,passDB)
}

userSchema.methods.isPasswordChanged = async function(JWTTS){
    let changeTS
    if(this.passwordChanged){
        changeTS = this.passwordChanged.getTime();
    }
    return changeTS > JWTTS;
}

userSchema.methods.resetPasswordToken = async function(){
    const resetToken =  crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetTokenExpires = Date.now() + 10*60 * 1000;

    return resetToken
}
const User = new mongoose.model('User',userSchema,'User');


module.exports = User