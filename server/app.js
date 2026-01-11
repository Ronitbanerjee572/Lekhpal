require('dotenv').config();   
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
var cors = require('cors')
const routes = require("./Routes/user")
const app = express()

// CORS configuration - allow frontend domains
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL // Add your Netlify URL as environment variable
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}))
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