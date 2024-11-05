const express = require('express');
const { default: mongoose } = require('mongoose');
const app = express();
const cors = require('cors');

require('./db/connection')
const Users = mongoose.model('Users', {
    _id: {type: Number},
    email: {type: String},
    password: {type: String}
});

const port = process.env.port || 8000
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cors());

app.get('/', (req, res) => {
    res.send("Welcome");
    // res.end();
})

app.post('/users/sign_in', (req, res) =>{
    mongoose.connection.db.collection('Users').findOne({email: req.body.email, password: req.body.password}, {_id: 0})
        .then((data) => console.log(data))
        .catch((err) => console.log(err));
})

app.listen(port, () => {
    console.log("Listening on port " + port);
})