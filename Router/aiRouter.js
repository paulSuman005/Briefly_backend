import express from 'express';
import upload from '../middleware/multer.js';
import { deleteDoc, getChats, getDocument, questionAndAnswer, updateTitle, uploadAndSummarize } from '../controllers/aiControllers.js';
import { isLoggedIn } from '../middleware/authUser.js';


const aiRouter = express.Router();

aiRouter.post("/uploadAndSummarize", isLoggedIn, upload.single("file"), uploadAndSummarize);
aiRouter.post("/questionAnswer", isLoggedIn, questionAndAnswer);
aiRouter.post("/getDocument", isLoggedIn, getDocument);
aiRouter.delete("/deleteDocument", isLoggedIn, deleteDoc)
aiRouter.patch("/updateTitle", isLoggedIn, updateTitle);
aiRouter.get("/getChats", isLoggedIn, getChats);


export default aiRouter;