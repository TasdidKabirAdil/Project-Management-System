const mongoose = require('mongoose')

const ProjectSchema = new mongoose.Schema({
    projectName: { type: String, unique: true, required: true },
    description: String,
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    status: { type: String, enum: ['In Progress', 'Pending', 'Completed'] }
})

const Project = mongoose.model('Project', ProjectSchema)

module.exports = Project;