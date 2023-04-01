import mongoose from "mongoose";
const schema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        minLength:[4,"title must have atleast 4 character"],
        maxLength:[50,"title must have less than 50 character"]
},
description:{
    type:String,
    required:true,
    minLength:[10,"title must have atleast 10 character"]
},
lectures:[{
    title:{
        type:String,
        required:true,
    },
    description:{
    type:String,
    required:true,
    },
    video:{
        public_id:String,
        url:String
    }
}],
thumbnail:{
    public_id:String,
    url:String
},
noOfLecture:{
   type:Number,
   default:0
},
views:{
    type:Number,
    default:0
},
category:{
    type:String,
    required:true
},
courseType:{
    type:String,
    required:true
},
createdBy:{
    type:String,
    required:[true,"please provide creator name"]
},
createdAt:{
type:Date,
default:Date.now
}
}
)
export const Courses=mongoose.model("courses",schema)