const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',   // Tham chiếu đến collection Users
        required: true
    }],
    last_message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message', // Tham chiếu đến collection chứa tin nhắn (giả sử là Message)
    },
    created_at: {
        type: Date,
        default: Date.now  // Tự động thiết lập thời gian tạo khi tạo mới tài liệu
    },
    updated_at: {
        type: Date,
        default: Date.now  // Tự động thiết lập thời gian cập nhật khi tạo mới tài liệu
    }
});

// Middleware để tự động cập nhật `updated_at` mỗi khi tài liệu được cập nhật
conversationSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
