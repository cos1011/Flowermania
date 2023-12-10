const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [ true, 'Please provide your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        validate: [
            validator.isEmail,
            'Incorrect email'
        ],
        lowercase: true
    },
    password: {
        type: String,
        minlength: 5,
        maxlength: 45,
        required: [true, 'Please provide password'],
        select: false
    },
    passwordConfirm: {
        type: String,
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: 'Passwords do not match'
        },
        minlength: 5,
        maxlength: 45
    },
    membership: {
        type: String,
        enum: {
            values: ['regular', 'lili', 'poppy', 'iris'],
            message: 'Either: regular, bronze, silver or premium values for membership are allowed'
        },
        default: 'regular'
    },
    expenditure: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        enum: {
            values: ['user'],
            message: 'Only users are allowed to sign up'
        },
        default: 'user'
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: {
        type:String
    },
    passwordResetExpires: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})


userSchema.pre(/^find/, async function(next) {

    this.find({active: {$ne: false}});

    next()
})

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;

    next();

});

userSchema.pre('save', async function(next) {
   if(!this.isModified('password')) return next()


   this.password = await bcrypt.hash(this.password, 12)

    this.passwordConfirm = undefined;

   next();
});

userSchema.methods.correctPassword = async function(enteredPassword, password) {

    return await bcrypt.compare(enteredPassword, password);

}

userSchema.methods.ifPasswordChanged = async function(JWTTimeStamp) {
    
    if(this.passwordChangedAt) {
        const changedTimeStamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
            );
        return changedTimeStamp > JWTTimeStamp
    }

    return false;
}

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    
    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;