const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const url = process.env.MONGO_URI || 'mongodb+srv://pbl4admin:pbl4admin@cluster0.x14gr.mongodb.net/test';
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
