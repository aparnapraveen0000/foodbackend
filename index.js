
require('dotenv').config()

const express = require('express')
const app = express()
const{connectDB}=require("./config/db.js")
const {apiRouter}=require("./routes/path.js")
var cookieParser = require('cookie-parser')
var cors = require('cors')
const port =process.env.PORT

connectDB()
var corsOptions = {
  origin: ['http://localhost:5173', 'https://frontendfood-one.vercel.app'],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}


app.use(cookieParser())
app.use(express.json())
app.use(cors(corsOptions))


app.use("/api",apiRouter)

app.all("*",(req,res,next)=>{
  res.status(404).json({message:"end point does not exist"})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})