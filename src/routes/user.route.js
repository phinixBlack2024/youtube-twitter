import { Router } from "express";
import { registerUser, loginUser, logOut } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middelware.js";
const router = Router();

// Defining the routes with post method and the corresponding controller functions
router.route("/register").post(upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }]), registerUser);
router.route("/login").post(loginUser);
router.route('/logout').get(verifyJWT, logOut)



export default router;