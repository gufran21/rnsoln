import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import { Courses } from "../models/courseModel.js"
import { User } from "../models/userModel.js";
import { ErrorHandler } from "../errorHandlers/ErrorHandler.js";
export const getAllPaidCourses=catchAsyncError(async(req,resp,next)=>{
    const user=await User.findById(req.user._id)
    const keyword=req.body.keyword
    let courses=await Courses.find({
      title:{
        $regex:keyword,
        $options:"i"
      },
      category:{
        $regex:keyword,
        $options:"i"
      }
     }).select("-lectures");
    courses=courses.filter((item)=>{if(item.courseType==="paid") return item})

   resp.status(200).json({
     success:true,
     courses
   })
 })