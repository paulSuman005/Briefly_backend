import 'dotenv/config';
import app from "./app.js";
import dbConnection from './config/dbConfig.js';
import cloudinary from './config/cloudinaryConfig.js';
import './corn-jobs/removeUser.js';



const PORT = process.env.PORT || 5010;


app.listen(PORT, async () => {
    await dbConnection();
    console.log(`server is listenning at http://localhost:${PORT}`);
})