import app from "./app.js";
import { connectDB } from "./config/database.js";
import cloudinary from 'cloudinary'
import Razorpay from 'razorpay'
import nodeCron from 'node-cron'
import { Stats } from "./models/stats.js";
import { User } from "./models/userModel.js";
import { Courses } from "./models/courseModel.js";
connectDB()

cloudinary.v2.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})
nodeCron.schedule("0 0 0 1 * *",async()=>{
   
    const user=await User.find({})
    const noOfUser=user.length
    const subscriber=user.filter((item)=>{
       if(item.subscription.status==="active") return item
    })
    const noOfSubscriber=subscriber.length
    const courses=await Courses.find({})
    let views=0
    courses.map((item)=>{
        views+=item.views
    })
    await Stats.create({users:noOfUser,subscribers:noOfSubscriber,views:views})
})

export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret:process.env.RAZORPAY_SECRET,
  });
app.listen(process.env.PORT,()=>{
    console.log("server is running"+process.env.PORT)
  
})