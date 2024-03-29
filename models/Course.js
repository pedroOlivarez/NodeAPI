const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
   title: {
      type: String,
      trim: true,
      required: [true, 'Please add a course title.'],
   },
   description:  {
      type: String,
      required: [true, 'Please add a description.'],
   },
   weeks: {
      type: String,
      required: [true, 'Please add number of weeks.'],
   },
   tuition: {
      type: Number,
      required: [true, 'Please add tuition cost.'],
   },
   minimumSkill: {
      type: String,
      required: [true, 'Please add a minimum skill.'],
      enum: ['beginner', 'intermediate', 'advanced'],
   },
   scholarshipAvailable: {
      type: Boolean,
      default: false,
   },
   createdAt: {
      type: Date,
      default: Date.now(),
   },
   bootcamp: {
      type: mongoose.Schema.ObjectId,
      ref: 'Bootcamp',
      required: true,
   },
   user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
   },
});

CourseSchema.statics.getAverageCost = async function(bootcampId) {
   const obj = await this.aggregate([
      {
         $match: { bootcamp: bootcampId },
      },
      {
         $group: {
            _id: '$bootcamp',
            getAverageCost: { $avg: '$tuition'},
         }
      }
   ]);

   const averageCost = Math.trunc(obj[0].getAverageCost);

   try {
      await this.model('Bootcamp')
         .findByIdAndUpdate(bootcampId, { averageCost });
   } catch(err) {
      console.error(err);
   }
};


// These pass through the function defined below:
CourseSchema.post('save', getAverageCost);
CourseSchema.pre('remove', getAverageCost);

function getAverageCost() {
   // And this calls the function defined in CourseSchema.statics.getAverageCost
   this.constructor.getAverageCost(this.bootcamp);
}

module.exports = mongoose.model('Course', CourseSchema);