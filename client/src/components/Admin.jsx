import React, { useState } from "react";
import { gql, useQuery, useMutation } from '@apollo/client'
import Select from 'react-select';
import { useNavigate } from "react-router-dom";
import styles from './Admin.module.css'

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
    const navigate = useNavigate()
    const { loading, error, data: teamsData } = useQuery(GET_TEAMS)
    const { data: projectsData } = useQuery(GET_PROJECTS)
    const { data: userData } = useQuery(GET_USERS)
    const [createUser] = useMutation(CREATE_USER)
    const [createTeam] = useMutation(CREATE_TEAM)
    const [assignProject] = useMutation(ASSIGN_PROJECT)
    const options = userData?.users.map((member) => ({
        value: member.id,
        label: member.username
    }))
    const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: '' })
    const [teamForm, setTeamForm] = useState({ teamName: '', description: '', members: [], createdDate: '', status: '', customField: '' })

    const handleUserFormChange = (e) => {
        setUserForm({ ...userForm, [e.target.name]: e.target.value })
    }

    const handleTeamFormChange = (e) => {
        //checks if selectedOptions is an array
        if (e && e.hasOwnProperty('length')) {
            setTeamForm(prev => ({
                ...prev,
                members: e.map(option => option.value)
            }))
        }

        else {
            const { name, value } = e.target
            setTeamForm(prev => ({
                ...prev,
                [name]: value
            }))
        }

        // const { name, value, options } = e.target;

        // setTeamForm(prev => ({
        //     ...prev, [name]: name === 'members' 
        //         ? [...options].filter(opt => opt.selected).map(opt => opt.value)
        //         : value
        // }))
    }

    const handleCreateUser = async (e) => {
        e.preventDefault()
        try {
            const { data } = await createUser({ variables: userForm })
            if (data) {
                alert('User added')
                setUserForm({ username: '', email: '', password: '', role: '' })
                window.location.reload()
            }
        } catch (error) {
            console.error("GraphQL Error:", error);
        }
    }

    const handleCreateTeam = async (e) => {
        e.preventDefault()
        try {
            const { data } = await createTeam({ variables: teamForm })
            if (data) {
                alert('Team added')
                setTeamForm({ teamName: '', description: '', members: [], createdDate: '', status: '', customField: '' })
                window.location.reload()
            }
        } catch (error) {
            console.error('Graphql error: ', error)
        }
    }

    const handleAssignProject = (e, projectId) => {
        e.preventDefault()
        assignProject({ variables: { assignTeamToProjectId: projectId, team: e.target.value } })
    }

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error.message}</p>

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>Create User</h2>
            <form onSubmit={handleCreateUser} className={styles.formContainer}>
                <input type="text" placeholder="Username" name="username" value={userForm.username} onChange={handleUserFormChange} required className={styles.input} />
                <input type="email" placeholder="Email" name="email" value={userForm.email} onChange={handleUserFormChange} required className={styles.input} />
                <input type="password" placeholder="Password" name="password" value={userForm.password} onChange={handleUserFormChange} required className={styles.input} />
                <div className={styles.formGroup}>
                    <label htmlFor="role" className={styles.label} style={{paddingTop: '20px'}}>Role</label>
                    <select id="role" name="role" value={userForm.role} onChange={handleUserFormChange} className={styles.select} style={{width: '84.5%'}} required >
                        <option value="" disabled>Select Role</option>
                        <option>Member</option>
                        <option>Admin</option>
                    </select>
                </div>
                
                <button type="submit" className={styles.button} style={{gridColumn: "1/span 2", width: '15%', display: 'flex', justifySelf: 'center', justifyContent: 'center'}}>Create User</button>
            </form>

            <h2 className={styles.header}>Create Team</h2>
            <form onSubmit={handleCreateTeam} className={styles.formContainer}>
                <input type="text" placeholder="Team name" name="teamName" value={teamForm.teamName} onChange={handleTeamFormChange} required className={styles.input} />
                <input type="text" placeholder="Description" name="description" value={teamForm.description} onChange={handleTeamFormChange} required className={styles.input} />
                <div className={styles.formGroup}>
                <label htmlFor="members" className={styles.label}>Members: </label>
                    {userData ? (
                        <Select
                            isMulti
                            id='members'
                            name='members'
                            options={options}
                            value={options.filter(option => teamForm.members.includes(option.value))}
                            onChange={handleTeamFormChange}
                            closeMenuOnSelect={false}
                            className={styles.select} 
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    width: '28vw',
                                }),
                                option: (base, state) => ({
                                    ...base,
                                    color: state.isSelected ? 'white' : 'black', // Change text color
                                    backgroundColor: state.isSelected ? 'blue' : 'white', // Change background color
                                }),
                            }}
                            />
                    ) : (
                        <p className={styles.noData}>Members not found</p>
                    )}
                </div>
                
                <input type="date" name="createdDate" value={teamForm.createdDate} onChange={handleTeamFormChange} required className={styles.input} />
                
                <div className={styles.formGroup}>
                    <label htmlFor="status" className={styles.label} style={{paddingTop: '20px'}}>Status</label>
                    <select id="status" name="status" value={teamForm.status} onChange={handleTeamFormChange} className={styles.select} style={{width: '86.9%'}}>
                        <option value="" disabled>Select Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                </div>
                
                <input type="text" placeholder="Custom Message" name="customField" value={teamForm.customField} onChange={handleTeamFormChange} className={styles.input} />
                <button type="submit" className={styles.button} style={{gridColumn: "1/span 2", width: '15%', display: 'flex', justifySelf: 'center', justifyContent: 'center'}}>Create Team</button>
            </form>
            
            <h2 className={styles.header}>Teams</h2>

            {teamsData ? (
                <table className={styles.table}>
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
                                <td>
                                    <ol>{team.members.map(member => (
                                        <li key={member.id}>{member.username}</li>
                                    ))}</ol>
                                </td>
                                <td>{new Date(parseInt(team.createdDate)).toLocaleString()}</td>
                                <td>{team.status}</td>
                                <td>{team.customField}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className={styles.noData}>Teams not found</p>
            )}

            <br></br>
            <h2 className={styles.header}>Projects</h2>

            {projectsData ? (
                <table className={styles.table}>
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
                                <td>
                                    {teamsData ? (
                                        <select
                                            value={project.team ? project.team.id : ''}
                                            onChange={(e) => handleAssignProject(e, project.id)}
                                            className={styles.select}>
                                            <option value="" disabled>Select Team</option>
                                            {teamsData.teams.map((team) => (
                                                <option key={team.id} value={team.id}>{team.teamName}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className={styles.noData}>Teams not found</p>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className={styles.noData}>Projects not found</p>
            )}
        </div>
    );
}

export default Admin