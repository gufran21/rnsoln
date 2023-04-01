export const Error=(err,req,resp,next)=>{
    err.statusCode=err.statusCode||500
    err.message=err.message||"internal server error"
    resp.status(err.statusCode).json({
        success:false,
        message:err.message
    })
}