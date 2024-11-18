const mongoose = require('mongoose');
const url = 'mongodb+srv://pbl4admin:pbl4admin@cluster0.x14gr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0 '
mongoose.connect(url, {
    dbName: 'PBL4-Messaging-Website'
})
    .then(() => console.log("Connect successful"))
    .catch((e) => console.log("Error:" + e));
