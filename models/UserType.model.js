const mongoose = require('mongoose')

const UserTypeSchema = new mongoose.Schema({
    user_type: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
    type: Date,
    default: Date.now
    }
})

const UserType = mongoose.model('UserType', UserTypeSchema)

module.exports = UserType