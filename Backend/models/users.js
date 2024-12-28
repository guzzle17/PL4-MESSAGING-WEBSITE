const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profile_picture: {
        type: String,
        default: ""  // Có thể để trống nếu người dùng chưa có ảnh đại diện
    },
    status: {
        type: String,
        default: "offline"  // Ví dụ: trạng thái mặc định là "offline"
    },
    contacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'  // Tham chiếu đến các tài khoản người dùng khác
    }],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    conversation: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'  // Tham chiếu đến các cuộc trò chuyện
    }]
});

// Middleware để cập nhật `updated_at` khi tài liệu được cập nhật
userSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
