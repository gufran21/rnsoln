import { ErrorHandler } from '../errorHandlers/ErrorHandler.js'
import { catchAsyncError } from '../middlewares/catchAsyncError.js'
import {User} from '../models/userModel.js'
import { sendMail } from '../utils/sendEmail.js'
import { sendToken } from '../utils/sendToken.js'
import crypto from "crypto"
import cloudinary  from 'cloudinary'
import { Courses } from '../models/courseModel.js'
import getDataUri from '../utils/dataUri.js'
import { instance } from '../server.js'
import { Stats } from '../models/stats.js'
export const ragister=catchAsyncError(async(req,resp,next)=>{
const  {name,email,password}=req.body
const  profilePics=req.file
if(!name||!email||!password ||!profilePics) return next(new ErrorHandler("please enter all field",400))
let user=await User.findOne({email})
if(user) return next(new ErrorHandler("user already exist",409))

const profileUri=getDataUri(profilePics)
const myCloud=await cloudinary.v2.uploader.upload(profileUri.content)
user =await User.create({name,email,password,profilePics:{
    public_id:myCloud.public_id,
    url:myCloud.secure_url
 }})
   sendToken(resp,user,"user ragistered",201)
})
export const login=catchAsyncError(async(req,resp,next)=>{
    const {email,password}=req.body
    if(!email||!password) return next(new ErrorHandler("please enter all field",400))
    let user =await User.findOne({email}).select("+password")
    
    if(!user) return next(new ErrorHandler("user does not exist",401))
    const ismatch=await user.matchPassword(password)
    if(!ismatch) return  next(new ErrorHandler("incorrect password or email",401))
    sendToken(resp,user,`welcome back ${user.name}`,200)
}) 
export const logout=catchAsyncError(async(req,resp,next)=>{
    resp.status(200).cookie("token",null,{
        expires:new Date(Date.now())
    }).json({
        success:true,
        message:"logout successfully"
    })
})
export const profile=catchAsyncError(async(req,resp,next)=>{
    const user=await User.findById(req.user._id)
    resp.status(200).json({
        success:true,
        user
    })
})
export const deleteMyProfile=catchAsyncError(async(req,resp,next)=>{
      const user=await User.findById(req.user._id)
      await cloudinary.v2.uploader.destroy(user.profilePics.public_id)
      await user.deleteOne()
      resp.status(200).cookie("token",null,{expires:new Date(Date.now())}).json({
        success:true,
        message:"profile deleted"
      })
})
export const changePassword=catchAsyncError(async(req,resp,next)=>{
    const {oldPassword,newPassword}=req.body
    if(!oldPassword||!newPassword) return next(new ErrorHandler("please enter all field",400))
    const user=await User.findById(req.user._id).select("+password")
    const ismatch=await user.matchPassword(oldPassword)
    if(!ismatch) return next(new ErrorHandler("incorrect password",401))
    user.password=newPassword
    await user.save()
    resp.status(200).json({
        success:true,
        messege:"password change successfully"
    })
})
export const updateProfile=catchAsyncError(async(req,resp,next)=>{
    const {name,email}=req.body
    
    let user=await User.findById(req.user._id)
   console.log(user +"1")
    if(name) user.name = name
    if(email) user.email = email
    await user.save()
    console.log(user)
    resp.status(200).json({
        success:true,
        messege:"profile updated successfully"
    })
})
export const updateProfilePics=catchAsyncError(async(req,resp,next)=>{
    const user=await User.findById(req.user._id)
    if(!user) return next(new ErrorHandler("user not found",404))
   
    const newProfilePics=req.file
    const profileUri=getDataUri(newProfilePics)
    const myCloud=await cloudinary.v2.uploader.upload(profileUri.content)
    await cloudinary.v2.uploader.destroy(user.profilePics.public_id)
    user.profilePics.public_id=myCloud.public_id
    user.profilePics.url=myCloud.secure_url
    await user.save()
 
    resp.status(200).json({
        success:true,
        messege:"profile picture updated successfully"
    })
    
})
export const forgotPassword=catchAsyncError(async(req,resp,next)=>{
    const {email}=req.body
    const user=await User.findOne({email})
    if(!user) return next(new ErrorHandler("user not found",400))
    const resettoken=await user.getResetToken()
    const url=`${process.env.FRONTEND_URL}/resetpassword/${resettoken}`
    const message=`You're receiving this e-mail because you or someone else has requested a password reset for your user account at .\n\n
    Click the link below to reset your password:\n
    ${url}\n\n
    If you did not request a password reset you can safely ignore this email.`
    await sendMail(user.email,"RNSOLN reset password",message)
    resp.status(200).json({
        success:true,
        message:`reset token has been sent to ${user.email}`
    })
})
export const resetPassword=catchAsyncError(async(req,resp,next)=>{
    const {token}=req.params
    const resetPasswordToken=crypto.createHash("sha256").update(token).digest("hex")
    const user=await User.findOne({resetPasswordToken,resetpasswordExpire:{$gt:new Date(Date.now())}})
    if(!user) return next(new ErrorHandler("reset token is invalid or has been expired",))
    user.password=req.body.password
    user.resetPasswordToken=undefined
    user.resetpasswordExpire=undefined
    await user.save()
    resp.status(200).json({
        success:true,
       messege:"passwsord changed successfully"
    })

})
export const addToPlaylist=catchAsyncError(async(req,resp,next)=>{
    const user=await User.findById(req.user._id)
    const course=await Courses.findById(req.body.id)
    if(!course) return next(new ErrorHandler("invalid course id",404))
    const isExist=user.playlists.find((item)=>{
        if(item.cousrse_id.toString()===course._id.toString()) return true
    })
    if(isExist) return next(new ErrorHandler("item already exist",409))
    user.playlists.push({cousrse_id:course._id,poster:course.thumbnail.url})
    await user.save()
    resp.status(200).json({
        success:true,
        message:"add to playlist"
    })
})
export const deleteFromPlaylist=catchAsyncError(async(req,resp,next)=>{
    const user=await User.findById(req.user._id)
    const course=await Courses.findById(req.query.id)
    if(!course) return next(new ErrorHandler("item does not exist",404))
    const isExist=user.playlists.find((item)=>{
        if(item.cousrse_id.toString()===course._id.toString()) return true
    })
    if(!isExist) return next(new ErrorHandler("course does exist in playlist",404))
    const newPlaylist=user.playlists.filter((item)=>{
        if(item.cousrse_id.toString()!==course._id.toString()) return item
    })
      user.playlists=newPlaylist
      await user.save()
      resp.status(200).json({
        success:true,
        message:"course deleted from playlist"
      })
})

export const getAllUsers=catchAsyncError( async(req,resp,next)=>{
    const users=await User.find()
    resp.status(200).json({
        success:true,
        users
    })
  })
  export const updateRole=catchAsyncError(async(req,resp,next)=>{
        const user= await User.findById(req.params.id)
        if(!user) return next(new ErrorHandler("user not found",404))
        
        if(user.role==="user") user.role="admin"
        if(user.role==="admin") user.role="user"
        await user.save()
        resp.status(200).json({
            success:true,
            messege:"role updated successfully"
        })
  })
  export const deleteUser=catchAsyncError(async(req,resp,next)=>{
    const user= await User.findById(req.params.id)
    if(!user) return next(new ErrorHandler("user not found",404))
    await cloudinary.v2.uploader.destroy(user.profilePics.public_id)
    await user.deleteOne()
   resp.status(200).json({
    success:true,
    message:"deleted successfully"
   })
  })
User.watch().on("change",async()=>{
    const stats=await Stats.find({}).sort({createdAted:"desc"}).limit(1)
    const subscriber=await User.find({"subscription.status":"active"})
    stats[0].users=await User.countDocuments()
    stats[0].subscribers=subscriber.length
    stats[0].createdAt=new Date(Date.now())
  
    await stats[0].save()
})