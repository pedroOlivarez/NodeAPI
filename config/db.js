const mongoose = require("mongoose");
const TIMEOUT = 10000;

const connectWithTimeout = ms => {
   const ourPromise = new Promise(async (resolve, reject) => {
      try {
         setTimeout(() => {
            reject(new Error(`Connecting took longer than ${ms}ms`));
         }, ms);
         const result = await mongoose.connect(process.env.MONG_URI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
         });
         resolve(result);
      } catch (err) {
         reject(err);
      }
   });
   return ourPromise;
};

const connectDB = async () => {
   const conn = await connectWithTimeout(TIMEOUT);
   console.log(`MongoDB Connected: ${conn.connection.host}`.magenta.underline.bold);
};

module.exports = connectDB;
