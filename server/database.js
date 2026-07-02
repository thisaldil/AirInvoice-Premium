const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongoose) => {
      if (process.env.NODE_ENV !== 'deployment') {
        console.log("Database connected");
      }
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;