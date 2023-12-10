const mongoose = require('mongoose');
const User = require('./User');
const slugify = require('slugify');


const flowerSchema = new mongoose.Schema({
   name: {
       type: String,
       required: [ true, 'Flower must have a name' ],
       min: 3,
       max: 20,
       unique: true
   },
   slug: {
       type: String
   },
   price: {
     type: String,
     required: [true, 'Please provide price for a flower'],
     minlength: 2,
     maxlength: 30
   },
   varieties: [{
       species: {
               type: String,
               required: [ true, `Flower's type must have a name` ],
               min: 3,
               max: 40

       },
       countries: {
               type: [String],
               required: [true, 'Assign at least one country where the type of the flower is grown']
           },
       seasons: [String],
       price: {
           type: Number,
           min: 0.3,
           max: 15
       }
   }],
   originCountry: {
       type: "String"
   },
   harvestSeasons: {
    type: [String]
   },
    harvestDates: [
        Date
    ],
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            description: String
        }
    ],
    buyers: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        }
    ],
    reviews: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Review'
        }
    ],
    avgRating: {
       type: Number,
       min: 1,
       max: 10,
       set: val => Math.round(val * 10 ) / 10
    },
    nRatings: {
        type: Number
    },
    vLocations: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        description: String
    },
    createdAt: {
       type: Date,
        default: Date.now
    }

}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

flowerSchema.virtual('curPrice').get(function() {
    return this.varieties[0].price;
});

flowerSchema.index({
    price: 1
})

flowerSchema.index({ vLocations: "2dsphere" });


flowerSchema.pre('save', function(next) {
   if(this.slug) return next();

   this.slug = slugify(this.name, {lower: true});

   next()
});


flowerSchema.virtual('all-revs', {
    ref: 'Reviews',
    foreignField: 'flower',
    localField: '_id'
})

flowerSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'buyers'
    })

    next()
});


const Flower = mongoose.model('Flower', flowerSchema);

module.exports = Flower;






// EMBEDDING USERS INTO FLOWERS
// flowerSchema.pre('save', async function(next) {
//
//     const buyersPromises = this.buyers.map(async id => await User.findById(id));
//
//     this.buyers = await Promise.all(buyersPromises);
//
//     next();
// });