const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String },
    type: { type: String, enum: ['text', 'image', 'file'] },
    file_url: { type: String },
    created_at: { type: Date, default: Date.now },
    status: { type: String, default: 'sent' }
});

module.exports = mongoose.model('Message', MessageSchema);
