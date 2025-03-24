import React, { useState } from "react";
import { gql, useQuery, useMutation } from '@apollo/client'
import { useNavigate } from "react-router-dom";

const GET_TEAMS = gql`
    query getTeams {
        teams {
            id
            teamName
            description
            members {
                id
                username
                role
            }
            createdDate
            status
            customField
        }
    }
`

const GET_PROJECTS = gql`
    query getProjects {
        projects {
            id
            projectName
            description
            team {
                id
                teamName
            }
            startDate
            endDate
            status
        }
    }
`

const GET_USERS = gql`
    query Users {
        users {
            id
            username
        }
    }
`

const CREATE_USER = gql`
    mutation CreateUser($username: String!, $email: String!, $password: String!, $role: String!) {
    createUser(username: $username, email: $email, password: $password, role: $role) {
        id
        username
        email
        password
        role
    }
}
`

const CREATE_TEAM = gql`
    mutation CreateTeam($teamName: String!, $description: String!, $createdDate: String!, $status: String!, $members: [ID!], $customField: String) {
        createTeam(teamName: $teamName, description: $description, createdDate: $createdDate, status: $status, members: $members, customField: $customField) {
            id
            teamName
            description
            members {
                id
            }
            createdDate
            status
            customField
        }
    }
`

const ASSIGN_PROJECT = gql`
    mutation AssignTeamToProject($assignTeamToProjectId: ID!, $team: ID!) {
        assignTeamToProject(id: $assignTeamToProjectId, team: $team) {
            id
            projectName
            team {
                id
                teamName
            }
        }
    }
`

function Admin() {
    const {loading, error, data: teamsData } = useQuery(GET_TEAMS)
    const { data: projectsData } = useQuery(GET_PROJECTS)
    const { data: userData } = useQuery(GET_USERS)
    const [createUser] = useMutation(CREATE_USER)
    const [createTeam] = useMutation(CREATE_TEAM)
    const [assignProject] = useMutation(ASSIGN_PROJECT)
    const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: ''})
    const [teamForm, setTeamForm] = useState({ teamName: '', description: '', members: [], createdDate: '', status: '', customField: ''})
    const navigate = useNavigate()

    const handleUserFormChange = (e) => {
        setUserForm({ ...userForm, [e.target.name]: e.target.value })
    }

    const handleTeamFormChange = (e) => {
        const { name, value, options } = e.target;

        setTeamForm(prev => ({
            ...prev, [name]: name === 'members' 
                ? [...options].filter(opt => opt.selected).map(opt => opt.value)
                : value
        }))
    }

    const handleCreateUser = async (e) => {
        e.preventDefault()
        try {
            const { data } = await createUser({ variables: userForm })
            if(data) {
                alert('User added')
                setUserForm({ username: '', email: '', password: '', role: ''})
                navigate('/admin')
            }
        } catch (error) {
            console.error("GraphQL Error:", error);
        }
    }

    const handleCreateTeam = async (e) => {
        e.preventDefault()
        try {
            const { data } = await createTeam({ variables: teamForm})
            if(data){
                alert('Team added')
                setTeamForm({ teamName: '', description: '', members: [], createdDate: '', status: '', customField: '' })
                navigate('/admin')
            }
        } catch (error) {
            console.error('Graphql error: ', error)
        }
    }

    const handleAssignProject = (e, projectId) => {
        e.preventDefault()
        assignProject({variables: {assignTeamToProjectId: projectId, team: e.target.value}})
    }

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error.message}</p>

    return (
        <div style={{ width: '80%', margin: "auto" }}>
            <h2>CREATE USER</h2>
            <form onSubmit={handleCreateUser}>
                <input type="text" placeholder="Username" name="username" value={userForm.username} onChange={handleUserFormChange} required/>
                <input type="email" placeholder="Email" name="email" value={userForm.email} onChange={handleUserFormChange} required/>
                <input type="password" placeholder="Password" name="password" value={userForm.password} onChange={handleUserFormChange} required/>
                <label htmlFor="role">Role</label>
                <select id="role" name="role" value={userForm.role} onChange={handleUserFormChange} required>
                    <option value="" disabled>Select Role</option>
                    <option>Member</option>
                    <option>Admin</option>
                </select>
                <button type="submit">Create User</button>
            </form>

            <h2>CREATE TEAM</h2>
            <form onSubmit={handleCreateTeam}>
                <input type="text" placeholder="Team name" name="teamName" value={teamForm.teamName} onChange={handleTeamFormChange} required/>
                <input type="text" placeholder="Description" name="description" value={teamForm.description} onChange={handleTeamFormChange} required/> 
                <label htmlFor="members">Members: </label> 
                {userData ? (
                    <select id='members' name='members' value={teamForm.members} onChange={handleTeamFormChange} multiple>
                    {userData.users.map((user) => (
                        <option key={user.id} value={user.id}>{user.username}</option>
                    ))}
                    </select>
                ) : (
                    <p>Members not found</p>
                )}
                <input type="date" name="createdDate" value={teamForm.createdDate} onChange={handleTeamFormChange} required/> 
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={teamForm.status} onChange={handleTeamFormChange}>
                    <option value="" disabled>Select Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                </select>
                <input type="text" placeholder="Custom Message" name="customField" value={teamForm.customField} onChange={handleTeamFormChange} /> 
               <button type="submit">Create Team</button>
            </form>
            {teamsData ? (
                <>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Members</th>
                                <th>Date Created</th>
                                <th>Status</th>
                                <th>Custom Field</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamsData.teams.map((team) => (
                                <tr key={team.id}>
                                    <td>{team.teamName}</td>
                                    <td>{team.description}</td>
                                    <td>{team.members.map((member) => (
                                        <ol key={member.id}>
                                            <li>{member.username}</li>
                                        </ol>
                                    ))}</td>
                                    <td>{new Date(parseInt(team.createdDate)).toLocaleString()}</td>
                                    <td>{team.status}</td>
                                    <td>{team.customField}</td>
                                </tr> 
                            ))}
                        </tbody>
                    </table>
                </>
            ) : (
                <p>Teams not found</p>
            )}

            {projectsData ? (
                <>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Team</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                                <th>Assign To</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projectsData.projects.map((project) => (
                                <tr key={project.id}>
                                    <td>{project.projectName}</td>
                                    <td>{project.description}</td>
                                    <td>{project.team.teamName}</td>
                                    <td>{new Date(parseInt(project.startDate)).toLocaleString()}</td>
                                    <td>{project.endDate ? new Date(parseInt(project.endDate)).toLocaleString() : 'No Date Set'}</td>
                                    <td>{project.status}</td>
                                    <td>{teamsData ? (
                                        <select value={project.team? project.team.id : ''} onChange={(e) => handleAssignProject(e, project.id)}>
                                            <option value="" disabled>Select Team</option>
                                            {teamsData.teams.map((team) => (                                               
                                                <option key={team.id} value={team.id}>{team.teamName}</option>  
                                            ))}
                                        </select>
                                    ) : (
                                        <p>teams not found</p>
                                    )}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            ) : (
                <p>Projects not found</p>
            )}
        </div>
    )
}

export default Admin