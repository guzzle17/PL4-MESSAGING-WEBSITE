const express = require('express')
const app = express();

require('./db/connection')


const port = process.env.port || 8000
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get('/', (req, res) => {
    res.send("Welcome");
    // res.end();
})

app.listen(port, () => {
    console.log("Listening on port " + port);
})