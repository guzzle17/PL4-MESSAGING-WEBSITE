const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',  // Tham chiếu đến collection Conversation
        required: true
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',          // Tham chiếu đến collection User
        required: true
    },
    content: {
        type: String,
        required: function() { return this.type === 'text'; } // Chỉ yêu cầu nếu type là "text"
    },
    type: {
        type: String,
        enum: ['text', 'image', 'file'],  // Chỉ cho phép các loại này
        required: true
    },
    attachments: [
        {
            file_type: {
                type: String,
                required: true
            },
            file_url: {
                type: String,
                required: true
            },
            file_name: {
                type: String,
                required: true
            },
            file_size: {
                type: Number,
                required: true
            }
        }
    ],
    created_at: {
        type: Date,
        default: Date.now  // Tự động thiết lập thời gian khi tin nhắn được tạo
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],  // Chỉ cho phép các trạng thái này
        default: 'sent'                       // Mặc định là "sent"
    }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
