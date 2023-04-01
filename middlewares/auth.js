import { ErrorHandler } from "../errorHandlers/ErrorHandler.js";
import { catchAsyncError } from "./catchAsyncError.js";
import  jwt  from "jsonwebtoken";
import { User } from "../models/userModel.js";
export const auth=catchAsyncError(async(req,resp,next)=>{
    const {token}=req.cookies
    if(!token) return next(new ErrorHandler("not logged in",401))
    const decode=jwt.verify(token,process.env.SECRET_KEY)
    req.user=await User.findById(decode._id)
    next()

})
export const adiminAuth=(req,resp,next)=>{
    if(req.user.role!=="admin") return next(new ErrorHandler(`${req.user.role} is not allowed to this actions`,403))
    next()

}
export const subscriberAuth=(req,resp,next)=>{
    if(req.user.role!=="admin"&&req.user.subscription.status!=="active") return next(new ErrorHandler(`only subscriber are  allowed to access these courses`,403))
    next()

}