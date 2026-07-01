import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

const dbConnection = async () => {
    console.log("mongo db : ",MONGODB_URI);
    try {
        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`database connected to ${conn.connection.host}`);
        
    } catch (error) {
        console.log('error in connection : ', error);
        process.exit(1);
    }

}

export default dbConnection;