
import { verify } from "crypto"
import { userMode } from "../models/user.model.js"
import { apiError } from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import uploadOnCloud from "../utils/cloudnary.js"
import Jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const userDetails = await userMode.findById(userId);
    const generateAcessToken = await userDetails.generateAcessToken();
    const refreshToken = await userDetails.generateRefreshToken();
    userDetails.refreshToken = refreshToken
    await userDetails.save({ validateBeforeSave: false })
    return { generateAcessToken, refreshToken }
  } catch (error) {
    throw new apiError(500, 'something went wrong')
  }
}
const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password, fullname } = req.body
  if ([fullname, userName, email, password].some((field) => field?.trim() === "")) {
    throw new apiError(400, "All field is required")
  }
  // userMode.findOne({email})
  let userExistCheck = await userMode.findOne({ $or: [{ userName }, { email }] });

  if (userExistCheck) {
    throw new apiError(409, "user already exists ")
  }
  const avatartPath = req.files?.avatar[0]?.path;
  if (!avatartPath) {
    throw new apiError(400, "Avatar field is required")
  }
  let uploadPathCoverImage;
  if (req.files && Array.isArray(req.files.coverImage)) {
    let coverImagePath = req.files?.coverImage[0]?.path;
    uploadPathCoverImage = await uploadOnCloud(coverImagePath);
  }

  const uploadPathAvatar = await uploadOnCloud(avatartPath);
  if (!uploadPathAvatar) {
    throw new apiError(400, "Avatar field is required")
  }

  const userCreate = await userMode.create({
    fullname,
    avatar: uploadPathAvatar.url,
    email,
    password,
    coverImage: uploadPathCoverImage?.url || "",
    username: userName
  })
  const userDataFind = await userMode.findById(userCreate._id).select("-password -refreshToken")
  res.status(200).json(new apiResponse(200, userDataFind, "registed"))
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if ([email, password].some((field) => field?.trim() === "")) {
    throw new apiError(400, "All field is required")
  }
  let userExistCheck = await userMode.findOne({ email });

  if (!userExistCheck) {
    throw new apiError(409, "user not exists ")
  }
  let check = await userExistCheck.isPasswordCorret(password);
  if (!check) {
    throw new apiError(401, "Creditional not match")
  }

  const { generateAcessToken, refreshToken } = await generateAccessAndRefreshTokens(userExistCheck._id)
  const option = {
    httpOnly: true,
    secure: true
  }
  // userMode.is
  return res.status(200).cookie("accessToken", generateAcessToken, option).cookie("refreshToken", refreshToken, option).json(new apiResponse(200, "userLogged in successfulley", { generateAcessToken, refreshToken }))
});

const logOut = asyncHandler(async (req, res) => {
  await userMode.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } },
    { new: true }
  )
  const option = {
    httpOnly: true,
    secure: true
  }

  res.status(200).cookie("accessToken", option).cookie("refreshToken", option).json(new apiResponse(200, {}, "userLogout in successfulley"))
});


const userList = asyncHandler(async (req, res) => {
  const userList = await userMode.find().select("-password -refreshToken");
  res.status(200).json(new apiResponse(200, userList, "registed"))
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  let incominRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if (!incominRefreshToken) {
    throw new apiError(401, "unauthorize request")
  }
  try {
    let decodedToken = Jwt.verify(incominRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    if (!decodedToken._id) {
      throw new apiError(401, "invalid refresh token")
    }

    let userDetails = await userMode.findById(decodedToken._id)

    if (!userDetails) {
      throw new apiError(401, "invalid refresh token")
    }
    if (incominRefreshToken !== userDetails?.refreshToken) {
      throw new apiError(401, "refresh token expired")
    }

    const { newGenerateAcessToken, newRefreshToken } = await generateAccessAndRefreshTokens(decodedToken._id)

    const option = {
      httpOnly: true,
      secure: true
    }
    return res.status(200).cookie("accessToken", newGenerateAcessToken, option).cookie("refreshToken", newRefreshToken, option).json(new apiResponse(200, "access token refresh token", { newGenerateAcessToken, newRefreshToken }));
  } catch (error) {
    throw new apiError(401, error?.message || "invalid refresh token")
  }


});

const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body
  const userId = req.user?._id;
  if (confirmPassword != newPassword) {
    throw new apiError(401, "The passwords entered do not match. Please ensure that the new password and the confirmed password are identical.")
  }
  let userDetails = await userMode.findById(userId);
  let passwordCheck = await userDetails.isPasswordCorret(oldPassword)
  if (!passwordCheck) {
    throw new apiError(401, "The provided old password is incorrect.")
  }
  userDetails.password = newPassword
  await userDetails.save({ validateBeforeSave: false })
  res.status(200).json(new apiResponse(200, {}, "Password changed successfully."))
});

export { registerUser, loginUser, logOut, userList, refreshAccessToken, changeUserPassword }