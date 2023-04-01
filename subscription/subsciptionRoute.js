import express from "express"
import { auth } from "../middlewares/auth.js"
import { subscription,verifySubscription ,getrazorpayKey, cancelSubscription} from "./subscriptionControler.js"
const Router=express.Router()

Router.route("/subscription").post(auth,subscription)
Router.route("/verifySubscription").post(auth,verifySubscription)
Router.route("/cancelSubscription").delete(auth,cancelSubscription)
Router.route("/razorpaykey").get(getrazorpayKey)
export default Router
