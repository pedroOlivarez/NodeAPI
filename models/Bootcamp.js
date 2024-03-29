const mongoose = require('mongoose');
const slugify = require('slugify');
const geoCoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: [true, 'Please add a name'],
         unique: true,
         trim: true,
         maxlength: [50, 'Name cannot be more than 50 characters.'],
      },
      slug: String,
      description: {
         type: String,
         required: [true, 'Please add a description.'],
         maxlength: [5000, 'Description cannot be more than 50 characters.'],
      },
      website: {
         type: String,
         match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS.',
         ],
      },
      phone: {
         type: String,
         maxlength: [20, 'Phone number can not be longer than 20 characters.'],
      },
      email: {
         type: String,
         match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email.'
         ],
      },
      address: {
         type: String,
         required: [true, 'Please add an address.'],
      },
      location: {
         type: {
            type: String,
            enum: ['Point'],
            // required: true
         },
         coordinates: {
            //Array of numbers
            type: [Number],
            // required: true,
            index: '2dsphere',
         },
         formattedAddress: String,
         streetNumber: String,
         street: String,
         city: String,
         state: String,
         zipcode: String,
         country: String,
      },
      careers: {
         //Array of strings
         type: [String],
         required: true,
         enum: ['Web Development', 'Mobile Development', 'UI/UX', 'Data Science', 'Business', 'Other'],
      },
      averageRating: {
         type: Number,
         min: [1, 'Rating must be at least 1.'],
         max: [10, 'Rating can not be more than 10.'],
      },
      averageCost: Number,
      photo: {
         type: String,
         default: 'no-photo.jpg',
      },
      housing: {
         type: Boolean,
         default: false,
      },
      jobAssistance: {
         type: Boolean,
         default: false,
      },
      jobGuarantee: {
         type: Boolean,
         default: false,
      },
      acceptGi: {
         type: Boolean,
         default: false,
      },
      createdAt: {
         type: Date,
         default: Date.now,
      },
      user: {
         type: mongoose.Schema.ObjectId,
         ref: 'User',
         required: true,
      },
   },
   {
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
   }
);

BootcampSchema.pre('save', function (next) {
   this.slug = slugify(this.name, { lower: true });
   next();
});

BootcampSchema.pre('save', async function (next) {
   const _location = await geoCoder.geocode(this.address);
   this.location = {
      type: 'Point',
      coordinates: [_location[0].longitude, _location[0].latitude],
      formattedAddress: _location[0].formattedAddress,
      streetNumber: _location[0].streetNumber,
      street: _location[0].streetName,
      city: _location[0].city,
      state: _location[0].administrativeLevels.level1short,
      zipcode: _location[0].zipcode,
      country: _location[0].country,
   };

   this.address = undefined;
   next();
});

BootcampSchema.pre('remove', async function (next) {
   console.log(`Courses tied to bootcamp ${this.id} being removed`);
   await this.model('Course')
      .deleteMany({ bootcamp: this._id });
   next();
});

BootcampSchema.virtual('courses', {
   ref: 'Course',
   localField: '_id',
   foreignField: 'bootcamp',
   justOne: false,
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);
