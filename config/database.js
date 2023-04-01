import mongoose from "mongoose";

export const connectDB=async()=>{
     try{
    const {connection}=await mongoose.connect(process.env.MONGOOSE_URL, { useNewUrlParser: true,useUnifiedTopology: true })
    console.log(connection.host)
     }catch(err){
        console.log(err.message)
     }

}