import express from "express";
import { changePassword, forgetPassword, getUser, logout, resendOTP, resetPassword, signin, signup, verifyEmail } from "../controllers/authControllers.js";
import { isLoggedIn } from "../middleware/authUser.js";

const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/verifyEmail', verifyEmail);
authRouter.post('/resendOTP', resendOTP);
authRouter.post('/signin', signin);
authRouter.post('/forgetPassword', forgetPassword);
authRouter.post('/resetPassowrd', resetPassword);

authRouter.patch('/changePassword', changePassword);

authRouter.get('/logout', logout);
authRouter.get('/getUser', isLoggedIn, getUser);

export default authRouter;