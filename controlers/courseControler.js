 import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import { Courses } from "../models/courseModel.js"
import { ErrorHandler } from "../errorHandlers/ErrorHandler.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from 'cloudinary'
import { User } from "../models/userModel.js";
import { Stats } from "../models/stats.js";

export const getAllFreeCourses=catchAsyncError(async (req,resp,next)=>{
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
     courses=courses.filter((item)=>{if(item.courseType!=="paid") return item})
    resp.status(200).json({
      success:true,
      courses
    })
  }
)
export const getAllCourses=catchAsyncError(async (req,resp,next)=>{
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
  resp.status(200).json({
   success:true,
   courses
 })
}
)
export const getCourseLectures=catchAsyncError(async(req,resp,next)=>{

  const course=await Courses.findById(req.params.id)
  if(!course) return next(new ErrorHandler("course does not exist",404))
  course.views+=1
  await course.save()
  resp.status(200).json({
    success:true,
    lectures:course.lectures
  })
})
export const createCourse=catchAsyncError(async(req,resp,next)=>{
    const {title,description,createdBy,category,courseType}=req.body;
    const thumbnail=req.file
    const fileUri=getDataUri(thumbnail)
    const myCloud=await cloudinary.v2.uploader.upload(fileUri.content)
    if(!title||!description||!createdBy||!category||!courseType) return next(new ErrorHandler("please add all fields",400))
   const result= await Courses.create({title,description,createdBy,category,courseType,thumbnail:{
        public_id:myCloud.public_id,
        url:myCloud.secure_url
    }})
 resp.status(201).json({
    success:true,
    message:"course created successfully"
 })
})
export const addLectures=catchAsyncError(async(req,resp,next)=>{
  const course=await Courses.findById(req.params.id)
  if(!course) return next(new ErrorHandler("course does not exist",404))
  const {title,description}=req.body
  const video=req.file
  if(!title||!description||!video) return next(new ErrorHandler("please fill all field",400))
  const fileUri=getDataUri(video)
  const myCloud=await cloudinary.v2.uploader.upload(fileUri.content,{resource_type:"video"})
  course.lectures.push({title,description,video:{public_id:myCloud.public_id,url:myCloud.secure_url}})
  course.noOfLecture=course.lectures.length
  await course.save()
  resp.status(200).json({
    success:true,
    message:"lecture added successfully"
  })
})
export const deleteCourse=catchAsyncError(async(req,resp,next)=>{
     const {id}=req.params
     const course=await Courses.findById(id)
     if(!course) return next(new ErrorHandler("course not found",404))
     await cloudinary.v2.uploader.destroy(course.thumbnail.public_id)
     for(let i=0;i<course.lectures.length;i++){
      let lecture=course.lectures[i]
      await cloudinary.v2.uploader.destroy(lecture.video.public_id,{resource_type:"video"})

     }
    await course.deleteOne()
    resp.status(200).json({
      success:true,
      message:"course deleted successfully"
    })
})
export const deleteLecture=catchAsyncError(async(req,resp,next)=>{
   const {courseId,lectureId}=req.query
   const course=await Courses.findById(courseId)
   if(!course) return next(new ErrorHandler("course not found",404))
   const lecture=course.lectures.find((lecture)=>{
    if(lecture._id.toString()===lectureId.toString()) return lecture
   })
   await cloudinary.v2.uploader.destroy(lecture.video.public_id,{resource_type:"video"})
   course.lectures=course.lectures.filter((lecture)=>{
    if(lecture._id.toString()!==lectureId.toString()) return lecture
  })
  course.noOfLecture=course.lectures.length
  await course.save()
   resp.status(200).json({
    success:true,
    message:"lecture deleted successfully"
  })
})
Courses.watch().on("change",async()=>{
  const stats=await Stats.find({}).sort({createdAt:"desc"}).limit(1)
  const courses=await Courses.find({})
  let views=0
  courses.map((item)=>{
    views+=item.views
  })
  stats.views=views
  await stats[0].save()
})