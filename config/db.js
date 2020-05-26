const mongoose = require('mongoose');
const TIMEOUT = 10000;

const connectWithTimeout = ms => {
   const ourPromise = new Promise(async (resolve, reject) => {
      try {
         setTimeout(
            () =>  reject(new Error(`Connecting took longer than ${ms}ms`)),
            ms
         );
         const options = {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
         };
         const result = await mongoose.connect(process.env.MONG_URI, options);
         resolve(result);
      } catch (err) {
         reject(err);
      }
   });
   return ourPromise;
};

async function connectDB() {
   const conn = await connectWithTimeout(TIMEOUT);
   console.log(`MongoDB Connected: ${conn.connection.host}`.magenta.underline.bold);
};

module.exports = connectDB;
