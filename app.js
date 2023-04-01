 import express from "express";
 import { config } from "dotenv";
 import {Error} from './middlewares/error.js'
 import cookieParser from "cookie-parser"; 
 import courseRoutes from './routes/courseRoute.js'
 import userRoutes from './routes/userRoute.js'
 import paidCourseRoutes from "./routes/paidCourseRoute.js";
 import otherRoutes from "./routes/otherRoutes.js";
 import subcriptionRoutes from './subscription/subsciptionRoute.js'
 import cors from 'cors'
 config({
    path:"./config/config.env"
 })
const app=express()
app.use(cookieParser())
app.use(cors({
   origin:process.env.FRONTEND_URL,
   credentials:true,
   methods:["POST","GET","DELETE","PUT"]
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use('/api',courseRoutes)
app.use('/api',userRoutes)
app.use('/api',paidCourseRoutes)
app.use('/api',subcriptionRoutes)
app.use('/api',otherRoutes)
app.use(Error)
 export default app