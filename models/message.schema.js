import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
  query: {
    type: String,
    required: [true, 'A question must be provided'],
    trim: true,
    maxlength: [2000, 'Question cannot exceed 2000 characters'],
  },

  response: {
    type: String,
    required: [true, 'An answer must be generated'],
    trim: true,
  },
  latencyMs: {
    type: Number,
    default: null,
  },
},
  {
    timestamps: true
  }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;