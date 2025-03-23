const dotenv = require('dotenv')

dotenv.config()

const env = process.env.NODE_ENV || 'development'

const config = {
    development: {
        db: process.env.MONGO_URI || 'mongodb://localhost:27017/project-management-db'
    }
}

module.exports = config[env]