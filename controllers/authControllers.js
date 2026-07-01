import crypto from 'crypto';
import emailValidator from 'email-validator'
import User from "../models/user.schema.js";
import AppError from "../utils/error.js";
import { generateOTP, generateOTPMessage, generateResetPasswordMessage } from "../utils/helper.js";
import sendEmail from "../utils/sendEmail.js";
import { emailVerifyOTPExpiry } from "../utils/variable.js";



const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "none"
}

export const signup = async (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;

    console.log(name, email, password, confirmPassword);

    try {
        if (!name || !password || !email || !confirmPassword) {
            return next(new AppError('All fields are required!', 400));
        }

        if (password !== confirmPassword) {
            return next(new AppError("Confirm Password is not match with the password", 400));
        }

        const validEmail = emailValidator.validate(email);

        if (!validEmail) {
            return next(new AppError('Please provide a valid email!', 400));
        }

        const userExists = await User.findOne({ email, isVerified: true, password: true });
        if (userExists) return next(new AppError('User already exists with this email!', 400));

        const userAlreadyVerfied = await User.findOne({ email, isVerified: true });
        if (userAlreadyVerfied) {
            return next(new AppError('Email already verified!', 400));
        }

        const otp = generateOTP();

        const otpExpiry = new Date(Date.now() + emailVerifyOTPExpiry);

        console.log('OTP : ', otp);

        let user = await User.findOne({ email, isVerified: false });

        if (user) {
            user.name = name;
            user.password = password;
            user.emailVerificationOTP = otp;
            user.emailVerificationExpiry = otpExpiry;
        }
        else {
            user = new User({
                name,
                email,
                password,
                emailVerificationOTP: otp,
                emailVerificationExpiry: otpExpiry
            })
        }


        if (!user) return next(new AppError('User registration failed, please try again', 400));

        await user.save();
        user.password = undefined;

        const message = generateOTPMessage(name, otp);

        await sendEmail(user.email, message.subject, message.html);

        res.status(201).json({
            success: true,
            message: 'OTP is sent to your email',
            data: user
        })
    } catch (error) {
        return next(new AppError(error.message, 500));
    }

}

export const verifyEmail = async (req, res, next) => {
    for (let i = 0; i < 100000000; i++);
    return res.status(200).json({
        success: true,
        message: "verified",
        data: {
            _id: "6a43ba7bf5eee955d069ec85",
            name: "Suman Paul",
            email: "edusmartdev@gmail.com",
            isVerified: true,
            createdAt: "2026-06-30T12:45:47.868Z",
            updatedAt: "2026-06-30T12:51:22.269Z",
            __v: 0
        }
    });
    try {
        const { email, otp } = req.body;
        console.log(req.body);

        if (!email || !otp) {
            return next(new AppError('Email and OTP are required!', 400));
        }

        const user = await User.findOne({ email }).select('+emailVerificationExpiry +emailVerificationOTP');
        console.log("user : ", user);

        if (!user) {
            return next(new AppError('User not found!', 404));
        }

        if (user.isVerified) {
            return next(new AppError('Email is already verified!', 400));
        }

        if (user.emailVerificationOTP !== otp) {
            return next(new AppError('Invalid OTP!', 400));
        }

        if (user.emailVerificationExpiry < new Date()) return next(new AppError('OTP has been expired!', 400));

        user.isVerified = true;
        user.emailVerificationOTP = undefined;
        user.emailVerificationExpiry = undefined;

        await user.save();

        const token = await user.generateJWTToken();

        res.cookie('token', token, cookieOptions);

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully.',
            data: user
        });
    } catch (error) {
        console.log("error: ", error);
        return next(new AppError(error.message, 500));
    }
}

export const resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        console.log(req.body);

        if (!email) {
            return next(new AppError("Email is not found, please re-signup", 404));
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

        const user = await User.findOne({ email, isVerified: false });

        if (!user) {
            return next(new AppError("user not Exists, please try again to signup", 404));
        }

        console.log("otp : ", otp);

        user.emailVerificationOTP = otp;
        user.emailVerificationExpiry = otpExpiry;

        await user.save();

        const message = generateOTPMessage(user.name, otp);

        await sendEmail(user.email, message.subject, message.html);

        res.status(201).json({
            success: true,
            message: "otp is send to your email"
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        })
    }
}

export const signin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) return next(new AppError('every field is required!', 400));

        const user = await User.findOne({ email }).select('+password');

        if (!user) return next(new AppError('user not found!', 400));

        const checkPassword = await user.comparePassword(password);

        if (!checkPassword) return next(new AppError('wrong password', 400));

        const token = await user.generateJWTToken();

        console.log("token is : - ", token);

        res.cookie('token', token, cookieOptions);

        user.password = undefined;

        res.status(200).json({
            success: true,
            message: 'login successful',
            data: user
        })
    } catch (err) {
        return next(new AppError(err || 'Failed to login, please try again', 400));
    }

}

export const logout = (req, res, next) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/"
        });

        return res.status(200).json({
            success: true,
            message: "logout successfully"
        });

    } catch (err) {
        return next(new AppError(err || 'Failed to logout, please try again', 400));
    }
};

export const forgetPassword = async (req, res, next) => {
    const { email } = req.body;

    if (!email) return next(new AppError('Email is not registered', 400));

    const user = await User.findOne({ email });

    if (!user) return next(new AppError('User is not found', 400));

    try {

        const resetToken = await user.generatePasswordResetToken();

        await user.save();

        const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        console.log(resetPasswordUrl);

        const resetPasswordMessage = generateResetPasswordMessage(user.name, resetPasswordUrl);

        await sendEmail(email, resetPasswordMessage.subject, resetPasswordMessage.html);

        return res.status(200).json({
            success: true,
            message: 'Reset password link is sent to your email'
        })
    } catch (err) {

        user.forgetPasswordExpiry = undefined;
        user.forgetPasswordToken = undefined;

        await user.save();

        return next(new AppError(e || 'failed to sent reset password link, please try again', 400));
    }

}

export const resetPassword = async (req, res, next) => {
    const { resetToken, password } = req.body;

    if(!resetToken) return next(new AppError("Reset is required", 400));

    if (!password) return next(new AppError('Password is required', 400));
    if (password.length < 6) return next(new AppError('Password must be at least 6 characters', 400));

    const forgetPasswordToken = await crypto.createHash('sha256').update(resetToken).digest('hex');

    try {
        const user = await User.findOne({ forgetPasswordToken });

        if (!user) return next(new AppError('Token is invalid!'));

        if (user.forgetPasswordExpiry < Date.now()) {
            return next(new AppError('Forget Token has Expired, try again', 400));
        }

        user.password = password;

        user.forgetPasswordExpiry = undefined;
        user.forgetPasswordToken = undefined;

        await user.save();

        console.log('reset password successful');

        res.status(200).json({
            success: false,
            message: 'Reset password successful'
        })
    } catch (e) {
        return next(new AppError(e || 'Failed to reset password, please try again'));
    }
}

export const changePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user;

    if (!oldPassword || !newPassword) return next(new AppError('every field is required', 400));

    try {
        const user = await User.findOne({ id });

        if (!user) return next('user not found', 400);

        const validPassword = await user.comparePassword(oldPassword);

        if (!validPassword) return next(new AppError('Wrong Password, fill the valid password', 400));

        user.password = newPassword;

        await user.save();

        user.password = undefined;

        return res.status(200).json({
            success: false,
            message: 'changing password successful'
        })
    } catch (err) {
        return next(new AppError(err || 'Failed to change the password, please try again', 400));
    }
}

export const getUser = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const userData = await User.findById(userId);

        if (!userData) {
            return next(new AppError("User is not found!", 404));
        }

        return res.status(200).json({
            success: true,
            data: userData
        })
    } catch (err) {
        return next(new AppError(err.message, 500));
    }
}