const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: String,
    password: { type: String, unique: true, required: true },
    role: { type: String, enum: ['Member', 'Admin'] }
})

const User = mongoose.model("User", UserSchema)

module.exports = User;