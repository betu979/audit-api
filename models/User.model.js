const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
        type: String,
        required: true,
        validate: {
        validator: function(v) {
            return /\d{12}/.test(v);
        },
        message: 'Invalid phone number. Please enter a 12-digit phone number.'
        }
    },
    user_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserType'
    },
    active: {
        type: Boolean,
        default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });
  
  const User = mongoose.model('User', userSchema);
  
  module.exports = User;