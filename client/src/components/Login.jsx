import React, { useState } from "react";
import { gql, useMutation } from '@apollo/client'
import { useNavigate } from "react-router-dom";

const LOGIN = gql`
    mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
        token
        user {
            id
            username
            email
            role
        }
    }
}
`


function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [login] = useMutation(LOGIN)
    const navigate = useNavigate()

    // useEffect(() => {
    //     if(localStorage.getItem('token')){
    //         const userRole = localStorage.getItem('role')
    //         navigate(userRole === 'Member'? '/member' : '/admin')
    //     }
    // }, [navigate])

    const handleLogin = async(e) => {
        e.preventDefault()
        setError('')
        try {
            const { data } = await login({ variables: {username, password}})
            if(data?.login?.token){
                localStorage.setItem('token', data.login.token);
                localStorage.setItem('role', data.login.user.role);
                localStorage.setItem('id', data.login.user.id);
                
                const userRole = data.login.user.role;
                
                alert('Login Successful');
                setUsername('');
                setPassword('');

                navigate(userRole === 'Member' ? '/member' : '/admin');
            } else {
                setError('Invalid Credentials')
            }
        } catch (error) {
            setError("Login failed. Please check your username and password.");
            console.error("GraphQL Error:", error);
        }
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}/><br></br>
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/><br></br>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default Login;