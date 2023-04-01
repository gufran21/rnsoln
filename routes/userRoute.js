import express from "express";
import { getAllUsers, login, logout, ragister,profile,changePassword, updateProfile, updateProfilePics, forgotPassword, resetPassword ,addToPlaylist, deleteFromPlaylist,updateRole,deleteUser,deleteMyProfile} from "../controlers/userControler.js";
import { adiminAuth, auth } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";
const userRouter =express.Router()
userRouter.route("/admin/allusers").get(auth,adiminAuth, getAllUsers)
userRouter.route("/admin/user/:id").put(auth,adiminAuth, updateRole).delete(auth,adiminAuth,deleteUser)

userRouter.route("/ragister").post(singleUpload, ragister)
userRouter.route("/login").post(login)
userRouter.route("/logout").get(logout)
userRouter.route("/profile").get(auth, profile).delete(auth,deleteMyProfile)
userRouter.route("/changePassword").put(auth, changePassword)
userRouter.route("/updateProfile").put(auth,updateProfile)
userRouter.route("/updateProfilePics").put(auth,singleUpload,updateProfilePics)
userRouter.route("/forgotPassword").post(forgotPassword)
userRouter.route("/resetpassword/:token").put(resetPassword)
userRouter.route("/addtoplaylist").post(auth,addToPlaylist)
userRouter.route("/addtoplaylist").post(auth,addToPlaylist)
userRouter.route("/deletefromplaylist").delete(auth,deleteFromPlaylist)


export default userRouter