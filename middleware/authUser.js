import AppError from "../utils/error.js";
import JWT from 'jsonwebtoken';

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;
    console.log(token);

    if(!token) return next(new AppError('Unauthenticated, please login', 401));

    const verifiedUser = await JWT.verify(token, process.env.JWT_SECRET);
    console.log("auth middleware : ",verifiedUser);

    if(!verifiedUser){
        return res.status(401).json({
            success: false,
            message: "Invalid token, please login again!"
        })
    }

    req.user = verifiedUser;

    next();
}

export {
    isLoggedIn
}