import { Router } from "express";
import { registerUser, loginUser, logOut, userList, refreshAccessToken, changeUserPassword } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middelware.js";
const router = Router();

// Defining the routes with post method and the corresponding controller functions
router.route("/register").post(upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }]), registerUser);
router.route("/login").post(loginUser);
router.route('/logout').get(verifyJWT, logOut)
router.route('/').get(verifyJWT, userList)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJWT, changeUserPassword)



export default router;