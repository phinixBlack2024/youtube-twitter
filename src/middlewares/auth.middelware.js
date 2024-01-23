import { userMode } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new apiError(401, "Unauthroize request");
        }
        let decorderToken;
       try {
         decorderToken = await Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
       } catch (error) {
        throw new apiError(401, "Access Token Not valid");
       }
        
      
        const userExists = await userMode.findById(decorderToken?._id).select("-password -refreshToken");
        if (!userExists) {
            throw new apiError(401, "invalid Access Token");
        }
         req.user = userExists;
        next()
    } catch (error) {
        throw new apiError(401, error.message || "invalid Access Token");
    }


})