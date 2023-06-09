

export const sendToken=(resp,user,message,statusCode=200)=>{
    const token =user.getJWTToken()
    const options={
         expires:new Date(Date.now()+7*24*60*60*1000),
         httpOnly:true,
         secure:true,
         sameSite:"none"
    }
   resp.status(statusCode).cookie("token",token,options).json({
    success:true,
    message,
    user
   })
}