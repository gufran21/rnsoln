import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import { ErrorHandler } from '../errorHandlers/ErrorHandler.js'
import { User } from "../models/userModel.js"
import { instance } from "../server.js"
import crypto from 'crypto'
import { Payment } from "../models/paymentModel.js"
export const subscription=catchAsyncError(async(req,resp,next)=>{
    const user=await User.findById(req.user._id)
    if(!user) return next(new ErrorHandler("user not found",404))
    if(user.role==="admin") return next(new ErrorHandler("no need to buy subscription for admin",400))
    const plan_id=process.env.PLAN_ID
    const subscription=await instance.subscriptions.create({
      plan_id:plan_id,
      customer_notify:1,
      total_count:12
    })
    user.subscription.id=subscription.id,
    user.subscription.status=subscription.status
    await user.save()
    resp.status(201).json({
      success:true,
      subsriptionId:subscription.id
    })
})
export const verifySubscription=catchAsyncError(async(req,resp,next)=>{
   const {razorpay_payment_id,razorpay_signature,razorpay_subscription_id}=req.body
   const user=await User.findById(req.user._id)
   const subcriptionId=user.subscription.id
   const generated_signature=crypto.createHmac("sha256",process.env.RAZORPAY_SECRET).update(razorpay_payment_id+"|"+subcriptionId).digest("hex")
   const isauthentic=generated_signature===razorpay_signature
   if(!isauthentic) return resp.redirect(`${process.env.FRONTEND_URL}/paymentfailed`)
   await Payment.create({razorpay_payment_id,razorpay_signature,razorpay_subscription_id})
    user.subscription.status="active"
    await user.save()
    await user.save()
    resp.redirect(`${process.env.FRONTEND_URL}/paymentSuccess?reference=${razorpay_payment_id}`)
})
export const getrazorpayKey=catchAsyncError(async(req,resp,next)=>{
       resp.status(200).json({
        success:true,
        key:process.env.RAZORPAY_KEY
       })
}
)
export const cancelSubscription=catchAsyncError(async(req,resp,next)=>{
  const user=await User.findById(req.user._id)

  await instance.subscriptions.cancel(user.subscription.id)
  const payment=await Payment.findOne({razorpay_subscription_id:user.subscription.id})
  const isrefundable=Date.now()-payment.createdAt<process.env.REFUND_DAYS*24*60*60*1000
  if(isrefundable){
  await instance.payments.refund(payment.razorpay_payment_id)
  }
   await payment.deleteOne()
  user.subscription.id=undefined,
  user.subscription.status=undefined
 
  await user.save()
  resp.status(200).json({
    success:true,
    message:isrefundable?"subscription canceled, you will recieve refund within 3-4 days":"subscription canceled, you will not recieve refund as you cancel subscription after 7days"
  })
})