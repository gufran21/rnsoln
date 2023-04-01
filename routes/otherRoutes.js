import express from 'express'
import { contact, stats } from '../controlers/otherControler.js'

import {adiminAuth, auth} from '../middlewares/auth.js'

const otherRouter=express.Router()
otherRouter.route("/contact").post(auth,contact)
otherRouter.route("/admin/stats").get(auth,adiminAuth,stats)
export default otherRouter