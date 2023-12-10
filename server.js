const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require("mongoose");
dotenv.config();

mongoose.connect('mongodb://127.0.0.1:27017/flowermania');

const port = process.env.PORT;

app.listen(port, () => {
   console.log('Listening to the port 3010');
});