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
  'https://lekhpal-blockchain.netlify.app',
  process.env.FRONTEND_URL
].filter(Boolean);

// Enable CORS pre-flight
app.options('*', cors());

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowedOrigins or if we're in development
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // For production, allow any subdomain of netlify.app
    if (origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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