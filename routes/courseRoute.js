import express from 'express'
import { createCourse, getAllFreeCourses,getCourseLectures,addLectures,deleteCourse,deleteLecture,getAllCourses } from '../controlers/courseControler.js'
import {auth, adiminAuth } from '../middlewares/auth.js'
import singleUpload from '../middlewares/multer.js'
const courseRouter=express.Router()
courseRouter.route('/courses').get(auth, getAllFreeCourses)
courseRouter.route('/admin/courses').get(auth,adiminAuth,getAllCourses)
courseRouter.route('/createCourse').post(auth,adiminAuth, singleUpload, createCourse)
courseRouter.route('/courses/:id').get(auth, getCourseLectures).post(auth, adiminAuth, singleUpload,addLectures).delete(auth, adiminAuth,deleteCourse)
courseRouter.route('/lectures').delete(auth,adiminAuth, deleteLecture)
export default courseRouter