import mongoose from "mongoose";
const schema=new mongoose.Schema({
    users:{
        type:Number,
        require:true
    },
    subscribers:{
        type:Number,
        require:true
    },
    views:{
        type:Number,
        require:true
    },
  
    createdAt:{
        type:Date,
        default:Date.now
        }
}
)
export const Stats=mongoose.model("stats",schema)