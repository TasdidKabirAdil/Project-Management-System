const typeDefs = `#graphql
    type User {
        id: ID!
        username: String!
        email: String!
        password: String!
        role: String!
    }

    type Team {
        id: ID!
        teamName: String!
        description: String!
        members: [User]
        createdDate: String!
        status: String!
        customField: String
    }

    type Project {
        id: ID!
        projectName: String!
        description: String
        team: Team
        startDate: String!
        endDate: String
        status: String!
    }

    type Query {
        users: [User]
        teams: [Team]
        projects: [Project]
        user(id: ID!): User
        team(id: ID!): Team
        project(id: ID!): Project 
    }

    type Mutation {
        login(username: String!, password: String!): AuthPayload 

        createUser(
            username: String!
            email: String!
            password: String!
            role: String!
        ): User

        createTeam(
            teamName: String!
            description: String!
            members: [ID!] 
            createdDate: String!
            status: String!
            customField: String
        ): Team

        createProject(
            projectName: String!
            description: String
            team: ID
            startDate: String!
            endDate: String
            status: String!
        ): Project

        updateProjectStatus(id: ID!, status: String!): Project
        assignTeamToProject(id: ID!, team: ID!): Project
    }

    type AuthPayload {
        token: String
        user: User
    }
`

module.exports = typeDefs;