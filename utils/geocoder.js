const Geocoder = require("node-geocoder");

const options = {
   provider: process.env.GEOCODER_PROVIDER,
   httpAdapter: "https",
   apiKey: process.env.GEOCODER_KEY,
   formatter: null,
};

const geocoder = Geocoder(options);

module.exports = geocoder;
