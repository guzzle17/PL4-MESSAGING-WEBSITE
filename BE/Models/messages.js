const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    type: { type: String, enum: ['text', 'image', 'file'], required: true },
    file_url: { type: String },
    created_at: { type: Date, default: Date.now },
    status: { type: String, default: 'sent' }
});

module.exports = mongoose.model('Message', MessageSchema);
