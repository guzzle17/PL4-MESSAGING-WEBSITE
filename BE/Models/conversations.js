const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    members: {
        type: Array,
        required: true,
    },
    groupName: { type: String },
    isGroup: { type: Boolean, default: false },
    admins: { type: [mongoose.Schema.Types.ObjectId], ref: 'User' }, 
    avatar: {type: String,
        default: "" },
    last_message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', ConversationSchema);
