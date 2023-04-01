import { ErrorHandler } from "../errorHandlers/ErrorHandler.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Stats } from "../models/stats.js";
import { sendMail } from "../utils/sendEmail.js";

export const contact=catchAsyncError(async(req,resp,next)=>{
   const {name,email,message}=req.body
   if(!name||!email||!message) return next(new ErrorHandler("please fill all field",400))
   const to=process.env.MY_EMAIL
   const subject="user contact from rnsoln website"
   const text=`I am ${name}m and my email is ${email}.\n ${message}`
   await sendMail(to,subject,text)
   resp.status(200).json({
    success:true,
    message:"message has been sent,thank you"
   })
})
export const stats=catchAsyncError(async(res,resp,next)=>{
const stats=await Stats.find().sort({createdAt:"desc"}).limit(12)
const remaimnig=12-stats.length
const statsData=[]
for(let i=0;i<stats.length;i++){
    statsData.unshift(stats[i])
}
for(let i=0;i<remaimnig;i++){
    statsData.unshift({
        users:0,
        subscriptions:0,
        views:0
    })
}
const userCount=statsData[11].users;
const subscriberCount=statsData[11].subscribers
const viewsCount=statsData[11].views

let usersPercent=0;
let subscriberPercent=0;
let viewsPercent=0;
let userProfit=false
let subscriberProfit=false
let viewsProfit=false
if(statsData[10].users===0) usersPercent=statsData[11].users*100
else usersPercent=(statsData[11].users-statsData[10].users)/statsData[10].users*100
if(statsData[10].subscribers===0) subscriberPercent=statsData[11].subscribers*100
else subscriberPercent=(statsData[11].subscribers-statsData[10].subscribers)/statsData[10].subscribers*100
if(statsData[10].views===0) viewsPercent=statsData[11].views*100
else viewsPercent=(statsData[11].views-statsData[10].views)/statsData[10].views*100
if(usersPercent>=0) userProfit=true
if(subscriberPercent>=0) subscriberProfit=true
if(viewsPercent>=0) viewsProfit=true

resp.status(200).json({
    success:true,
    stats:statsData,
    userCount,subscriberCount,viewsCount,
    usersPercent,subscriberPercent,viewsPercent,userProfit,subscriberProfit,viewsProfit
})
})