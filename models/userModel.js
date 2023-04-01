import mongoose from "mongoose";
import validator from "validator";
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"
import crypto from 'crypto'
const schema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter your name"]
    },
    email:{
        type:String,
        required:[true,"please enter your email"],
        unique:true,
        validate:validator.isEmail
    },
    password:{
        type:String,
        required:[true,"please enter your email"],
        minLength:[6,"password must be atleast 6 character"],
        select:false
    },
    role:{
        type:String,
        enum:["admin","user"],
        default:"user",
    },
    subscription:{
      id:String,
      status:String
    },
    profilePics:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true  
        }
    },
    playlists:[{
    cousrse_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"courseModel", 
    },
    poster:String
    }],
    createdAt:{
        type:Date,
        default:Date.now
    },
    resetPasswordToken:String,
    resetpasswordExpire:String
}

)
schema.pre("save",async function(next){
    if(!this.isModified("password")) return next()

    this.password=await bcrypt.hash(this.password,10)
    
    next()
})
schema.methods.matchPassword=async function(password){
    return await bcrypt.compare(password,this.password)
}
schema.methods.getJWTToken=function(){
    return jwt.sign({_id:this._id},process.env.SECRET_KEY,{
        expiresIn:"7d"
    })
}

schema.methods.getResetToken=function(){
    
    const resetToken=crypto.randomBytes(20).toString("hex") 
    this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex")
    this.resetpasswordExpire=new Date(Date.now()+10*60*1000)
    this.save()
    return resetToken
}
export const User=mongoose.model("users",schema)