const User = require('../models/user')
const Team = require('../models/team')
const Project = require('../models/project')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const resolvers = {
    Query: {
        users: async () => {
            try {
                const users = await User.find()
                return users.map((user) => ({
                    id: user._id.toString(),
                    ...user.toObject()
                }))
            } catch (error) {
                console.error('Error fetching users', error)
                throw new Error('Failed to fetch users')
            }
        },

        teams: async () => {
            try {
                const teams = await Team.find().populate('members');
                return teams.map((team) => {
                    return {
                        id: team._id.toString(),
                        ...team.toObject(),
                        members: team.members
                            .map(member => ({
                                id: member._id.toString(),
                                ...member.toObject()
                            }))
                    };
                });
            } catch (error) {
                console.error('Error fetching teams', error);
                throw new Error('Failed to fetch teams');
            }
        },


        projects: async () => {
            try {
                const projects = await Project.find().populate('team')
                return projects.map((project) => ({
                    id: project._id.toString(),
                    ...project.toObject(),
                    team: {
                        id: project.team._id.toString(),
                        ...project.team.toObject()
                    } 
                }))
            } catch (error) {
                console.error('Error fetching projects', error)
                throw new Error('Failed to fetch projects')
            }
        },

        user: async (_, { id }) => {
            try {
                const user = await User.findOne({ _id: id })
                if (!user) {
                    throw new Error(`User with ${id} doesn't exist!`)
                }
                return {
                    id: user._id.toString(),
                    ...user.toObject()
                }
            } catch (error) {
                console.error(`Error fetching user with ${id}`, error)
                throw new Error('Failed to fetch user')
            }
        },

        team: async (_, { id }) => {
            try {
                const team = await Team.findOne({ _id: id }).populate('members')
                if (!team) {
                    throw new Error(`Team with ${id} doesn't exist!`)
                }
                return {
                    id: team._id.toString(),
                    ...team.toObject(),
                    members: team.members.map((member) => ({
                        id: member._id.toString(),
                        ...member.toObject()
                    }))
                }
            } catch (error) {
                console.error(`Error fetching team with ${id}`, error)
                throw new Error('Failed to fetch team')
            }
        },

        project: async (_, { id }) => {
            try {
                const project = await Project.findOne({ _id: id }).populate('team')
                if (!project) {
                    throw new Error(`Project with ${id} doesn't exist!`)
                }
                return {
                    id: project._id.toString(),
                    ...project.toObject(),
                    team: {
                        id: project.team._id.toString(),
                        ...project.team.toObject()
                    }
                }
            } catch (error) {
                console.error(`Error fetching project with ${id}`, error)
                throw new Error('Failed to fetch project')
            }
        }
    },

    Mutation: {
        login: async (_, { username, password }) => {
            try {
                const user = await User.findOne({ username })
                if (!user) {
                    throw new Error('User not found')
                }
                const match = await bcrypt.compare(password, user.password)
                if (!match) {
                    throw new Error('Invalid username or password')
                }
                const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' })
                return {
                    token,
                    user: {
                        id: user._id.toString(),
                        username: user.username,
                        email: user.email,
                        role: user.role,
                    }
                }
            } catch (error) {
                console.log('Error loggin in', error)
                throw new Error('Failed to login')
            }
        },

        createUser: async (_, { username, email, password, role }) => {
            try {
                const existingUser = await User.findOne({ username })
                if (existingUser) {
                    throw new Error("User already exists")
                }
                const hashedPassword = await bcrypt.hash(password, 10)
                const newUser = new User({ username, email, password: hashedPassword, role })
                await newUser.save()

                // Returning the correct fields
                return {
                    id: newUser._id.toString(),
                    ...newUser.toObject()
                }
            } catch (error) {
                console.error('Error creating user', error)
                throw new Error('Failed to create user')
            }
        },

        createTeam: async (_, args) => {
            try {
                const members = (args.members || []).map(id => new mongoose.Types.ObjectId(id))
                const existingTeam = await Team.findOne({ members: {$in: members} })
                if(existingTeam){
                    throw new Error(`One or more members have already been assigned to another team: ${existingTeam.teamName}`)
                }
                const team = new Team({
                    ...args,
                    members
                })
                const newTeam = await team.save()
                return {
                    id: newTeam._id.toString(),
                    ...newTeam.toObject(),
                    members: newTeam.members.map(member => ({
                        id: member.toString()
                    }))
                }
            } catch (error) {
                console.error('Error creating team', error)
                throw new Error('Failed to create team')
            }
        },

        createProject: async (_, args) => {
            try {
                const project = new Project(args)
                const newProject = await project.save()
                return {
                    id: newProject._id.toString(),
                    ...newProject.toObject()
                }
            } catch (error) {
                console.error('Error creating project', error)
                throw new Error('Failed to create project')
            }
        },

        updateProjectStatus: async (_, { id, status }) => {
            try {
                const updatedProject = await Project.findByIdAndUpdate(id, { status }, { new: true })
                if (!updatedProject) {
                    throw new Error(`Updating project of ${id} not found`)
                }
                return {
                    id: updatedProject._id.toString(),
                    ...updatedProject.toObject()
                }
            } catch (error) {
                console.error('Error updating project', error)
                throw new Error('Failed to update project')
            }
        },

        assignTeamToProject: async (_, { id, team }) => {
            try {
                const assignedTeam = await Project.findByIdAndUpdate(
                    id, 
                    { team: new mongoose.Types.ObjectId(team) }, 
                    { new: true }
                ).populate('team');
        
                if (!assignedTeam) {
                    throw new Error(`Project with ID ${id} not found`);
                }
        
                return {
                    id: assignedTeam._id.toString(),
                    ...assignedTeam.toObject(),
                    team: assignedTeam.team ? { 
                        id: assignedTeam.team._id.toString(),
                        ...assignedTeam.team.toObject() 
                    } : null
                };
            } catch (error) {
                console.error('Error assigning team to project', error);
                throw new Error('Failed to assign team to project');
            }
        }        
    }
}

module.exports = resolvers;