const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
dotenv.config()

const pokeapiRouter = require('./routes/poke_api_routes');




app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.use(pokeapiRouter);





let port = process.env.PORT || 3000
let host = process.env.HOST || 'localhost'


app.listen(port, function () {
    console.log(`PORT: ${port}`);
    console.log(`HOST: ${host}`);
})
console.log("Holi");