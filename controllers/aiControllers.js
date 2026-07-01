import path from 'path';
import crypto from 'crypto';
import Document from '../models/document.schema.js';
import { ingestDocument } from '../langchainServices/ingestion.js';
import { answerQuestion } from '../langchainServices/qna.js';
import Message from '../models/message.schema.js';
import AppError from '../utils/error.js';
import cloudinary from '../config/cloudinaryConfig.js';
import mongoose from 'mongoose';
import { deleteDocument } from '../langchainServices/embedding.js';

export const uploadAndSummarize = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError("No file uploaded!"), 400);
        }
        const userId = req.user.id;
        console.log("file name: ", req.file.originalname);

        const document = new Document({ originalFilename: req.file.originalname, fileType: req.file.mimetype });

        try {
            const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
                folder: "Briefly",
                resource_type: "raw",
                unique_filename: true
            });
            console.log("cloudinary result : ", cloudinaryResult);
            document.cloudinary.public_id = cloudinaryResult.public_id;
            document.cloudinary.secure_url = cloudinaryResult.secure_url;
        } catch (err) {
            console.log("error : ", err);
            return next(new AppError("Error in uploading file" + err.message), 400);
        }

        const result = await ingestDocument(document._id, req.file.path, req.file.originalname);
        console.log("summary result : ", result);

        document.userId = userId;
        document.summary = result.summary;
        document.title = result.title;
        document.chromaDetails.chunkCount = result.chunkCount;
        document.status = 'completed';
        await document.save();

        res.status(201).json({
            success: true,
            data: document
        });

    } catch (error) {
        console.log('Upload error:', error);
        return next(new AppError(error.message, 500));
    }
}

export const questionAndAnswer = async (req, res, next) => {
    try {
        const { query, docId } = req.body;

        if (!query) {
            return next(new AppError("query is required!", 400));
        }

        if (!docId) {
            return next(new AppError("docId is required!", 400));
        }

        const document = await Document.findById(docId);
        console.log("db document : ", document);
        if (!document) {
            return next(new AppError("Document is not found!", 404));
        }

        const response = await answerQuestion(query, docId);

        const messageResult = await Message.create({
            query,
            response: response.answer,
            latencyMs: response.latencyMs
        });

        document.message.push(messageResult._id);

        await document.save();

        return res.status(200).json({
            success: true,
            data: {
                messageResult,
                docId: document._id
            }
        });

    } catch (err) {
        return next(new AppError(err.message, 500));
    }
}

export const getChats = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const chats = await Document.find({ userId }).select("_id title updatedAt").sort({ updatedAt: -1 });

        if (!chats) {
            return next(new AppError("Chats not found!", 404));
        }

        return res.status(200).json({
            success: true,
            data: chats,
        });
    } catch (err) {
        return next(new AppError(err.message, 500));
    }
};

export const getDocument = async (req, res, next) => {
    try {
        console.log("get document called");
        console.log("get document : ", req.body);
        console.log("user : ", req.user);
        const userId = new mongoose.Types.ObjectId(req.user.id);
        const docId = new mongoose.Types.ObjectId(req.body.docId);

        if (!docId) {
            return next(new AppError("Document Id is required!", 400));
        }

        if (!mongoose.Types.ObjectId.isValid(docId)) {
            return res.status(404).json({
                success: false,
                message: 'Document not found!',
            });
        }
        console.log(docId, userId);

        const document = await Document.findOne({ _id: docId, userId }).populate('message');
        console.log("document details : ", document);
        if (!document) {
            return next(new AppError("Document is not found!", 404));
        }

        return res.status(200).json({
            success: true,
            data: document
        });
    } catch (err) {
        return next(new AppError(err.message, 500));
    }
}

export const deleteDoc = async (req, res, next) => {
    console.log("req body : ", req.body);
    const docId = new mongoose.Types.ObjectId(req.body.docId);
    const userId = new mongoose.Types.ObjectId(req.user.id);

    if (!docId) {
        return next(new AppError("Doc Id is required!", 400));
    }

    try {
        const document = await Document.findOneAndDelete({ _id: docId, userId });
        if (!document) return next(new AppError("Document not found!", 404));

        await deleteDocument(docId);

        return res.status(200).json({
            success: true,
            message: "Successfully deleted document!",
            data: document
        })
    } catch (err) {
        return next(new AppError(err.message, 500));
    }
}

export const updateTitle = async (req, res, next) => {
    const { docId, title } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    if (!docId) {
        return next(new AppError("Doc Id is required!", 400));
    }

    try {
        const document = await Document.findOneAndUpdate({ _id: docId, userId }, { title }, { new: true });
        if (!document) return next(new AppError("Document not found!", 404));

        return res.status(200).json({
            success: true,
            message: "Title successfully updated!",
            data: document
        })
    } catch (err) {
        return next(new AppError(err.message, 500));
    }
}