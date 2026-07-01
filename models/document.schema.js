// models/Document.js
import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        originalFilename: {
            type: String,
            required: true
        },
        fileType: {
            type: String
        },
        cloudinary: {
            secure_url: {
                type: String
            },
            public_id: {
                type: String
            }
        },
        summary: {
            type: String,
            default: ''
        },
        title: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['processing', 'completed', 'failed'],
            default: 'processing',
        },
        chromaDetails: {
            collectionName: {
                type: String,
                default: "Briefly"
            },
            chunkCount: {
                type: Number
            }
        },
        message: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Message'
            }
        ]
    },
    { timestamps: true }
);

const Document = mongoose.model('Document', documentSchema);
export default Document;