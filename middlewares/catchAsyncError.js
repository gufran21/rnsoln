export const catchAsyncError=(funct)=>{
    return (req,resp,next)=>{
       Promise.resolve(funct(req,resp,next)).catch(next)
    }
}