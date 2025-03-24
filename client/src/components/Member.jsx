import React, { useEffect, useState } from "react";
import { gql, useQuery, useMutation } from '@apollo/client'

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
            }
            startDate
            endDate
            status
        }
    }
`

const UPDATE_PROJECT_STATUS = gql`
    mutation UpdateProjectStatus($updateProjectStatusId: ID!, $status: String!) {
        updateProjectStatus(id: $updateProjectStatusId, status: $status) {
            id
            status
        }
    }
`

function Member() {
    const userId = localStorage.getItem('id')
    const { loading, error, data: teamData } = useQuery(GET_TEAMS)
    const { data: projectData } = useQuery(GET_PROJECTS)
    const [userTeam, setUserTeam] = useState(null)
    const [teamProjects, setTeamProjects] = useState(null)
    const [UpdateProjectStatus] = useMutation(UPDATE_PROJECT_STATUS)
    const [statuses, setStatuses] = useState({})

    useEffect(() => {
        if (teamData && teamData.teams) {
            const foundTeam = teamData.teams.find(team =>
                team.members.some(member => member.id === userId)
            )
            setUserTeam(foundTeam)
        }
    }, [teamData, userId])

    useEffect(() => {
        if (userTeam && projectData?.projects) {
            const foundProjects = projectData.projects.filter(project => project.team.id === userTeam.id)
            setTeamProjects(foundProjects)
            // if (foundProjects) {
            //     foundProjects.forEach(foundProject => {
            //         setStatus(foundProject.status)
            //     })
            // }
        }
    }, [projectData, userTeam])

    const handleStatusChange = (e, projectId) => {
        e.preventDefault(); 
        const newStatus = e.target.value
        setStatuses(prev => ({ ...prev, [projectId]: newStatus}))
        UpdateProjectStatus({ variables: { updateProjectStatusId: projectId, status: newStatus } });
    }

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error: {error.message}</p>

    return (
        <div style={{ width: '80%', margin: "auto" }}>
            <h1 style={{ display: "flex", justifyContent: "center" }}>WELCOME TO MEMBERS PAGE</h1>
            <h2>Team Details</h2>
            {userTeam ? (
                <>
                    <h3>Team name: {userTeam.teamName}</h3>
                    <p>Description: {userTeam.description}</p>
                    <p>Members</p>
                    {userTeam.members.map((member) => (
                        <ol key={member.id}>
                            <li>Name: {member.username}, Role: {member.role}</li>
                        </ol>
                    ))}
                    <p>Created Date: {new Date(parseInt(userTeam.createdDate)).toLocaleString()}</p>
                    <p>Status: {userTeam.status}</p>
                    <p>Custom Field: {userTeam.customField}</p>
                </>
            ) : (
                <p>No team found for this user.</p>
            )}
            <h2>Assigned Projects</h2>
            {teamProjects ? (
                <>
                    {teamProjects.map((teamProject) => (
                        <div key={teamProject.id}>
                            <h3>Project Name: {teamProject.projectName}</h3>
                            <p>Description: {teamProject.description}</p>
                            <p>Start Date: {new Date(parseInt(teamProject.startDate)).toLocaleString()}</p>
                            <p>End Date: {parseInt(teamProject.endDate) ? new Date(parseInt(teamProject.endDate)).toLocaleString() : "No date set"}</p>
                            <p>Project Status: {teamProject.status}</p>
                            <label htmlFor="projectStatus">Change Project Satus: &nbsp;</label>
                            <select id="projectStatus" value={statuses[teamProject.id || teamProject.status]} onChange={(e) => handleStatusChange(e, teamProject.id)}>
                                <option>Pending</option>
                                <option>In Progress</option>
                                <option>Completed</option>
                            </select>
                        </div>
                    ))}
                </>
            ) : (
                <p>No Project Found</p>
            )}
        </div>
    )
}

export default Member;