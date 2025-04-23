require('dotenv').config();
const express = require('express');
const app = express();
const { connectDB } = require("./config/db.js");
const { apiRouter } = require("./routes/path.js");
const cookieParser = require('cookie-parser');
const cors = require('cors');

const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// ✅ Updated CORS options
const corsOptions = {
  origin: ['http://localhost:5173', 'https://frontendfood-one.vercel.app'],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// ✅ Middleware
app.use(cookieParser());
app.use(express.json());

// ✅ Routes
app.use("/api", apiRouter);

// ✅ 404 handler
app.all("*", (req, res) => {
  res.status(404).json({ message: "Endpoint does not exist" });
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
