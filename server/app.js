require('dotenv').config();   
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
var cors = require('cors')
const routes = require("./Routes/user")
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose
  .connect(process.env.MongoURI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err))
var port = process.env.PORT || 3001

app.use("/", routes);

app.get("/",(req, res)=>{
  res.send("Hello from server.");
});

app.listen(port)
console.log('App is running on port ' + port)