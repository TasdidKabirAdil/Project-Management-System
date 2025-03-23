const mongoose = require('mongoose')

const TeamSchema = new mongoose.Schema({
    teamName: { type: String, unique: true, required: true },
    description: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    customField: String
})

const Team = mongoose.model('Team', TeamSchema)

module.exports = Team;