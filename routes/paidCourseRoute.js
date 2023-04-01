import express from 'express'
import { getAllPaidCourses } from '../controlers/paidCourseControler.js'
import {auth, adiminAuth, subscriberAuth } from '../middlewares/auth.js'
import singleUpload from '../middlewares/multer.js'
const paidCourseRouter=express.Router()
paidCourseRouter.route('/paidcourses').get(auth,subscriberAuth, getAllPaidCourses)
export default paidCourseRouter