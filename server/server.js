const buffer = require("buffer");

// Node 25 SlowBuffer fix
if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const crypto = require("crypto");

const connectDB = require("./database");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "https://air-invoice-client.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(passport.initialize());

// Models and passport config
require("./models/User");
require("./services/passport");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const templateRoutes = require("./routes/templateRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const ocrRoutes = require("./routes/ocrRoutes");

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/api/user", userRoutes);
app.use("/template", templateRoutes);
app.use("/invoice", invoiceRoutes);
app.use("/ocr", ocrRoutes);

app.get("/", (req, res) => {
  res.send("Air Invoice backend is running locally");
});

app.post("/generate-signature", (req, res) => {
  try {
    const { timestamp } = req.body;

    if (!timestamp) {
      return res.status(400).json({ error: "Timestamp is required" });
    }

    if (!process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({
        error: "CLOUDINARY_API_SECRET is missing in .env file",
      });
    }

    const signature = crypto
      .createHash("sha1")
      .update(`timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
      .digest("hex");

    res.json({ signature });
  } catch (error) {
    console.error("Signature error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
