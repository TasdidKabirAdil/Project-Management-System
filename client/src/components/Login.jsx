import React, { useState } from "react";
import { gql, useMutation } from '@apollo/client'
import { useLocation, useNavigate } from "react-router-dom";
import styles from './Login.module.css'

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
    const location = useLocation()
    const message = location.state?.message;

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
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <h2 className={styles.loginTitle}>Login</h2>
            
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className={styles.inputField}
              />
              
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
              />
              
              {error && <p className={styles.errorMessage}>{error}</p>}
              
              {message && (
                <div className={styles.authMessage}>
                  {message}
                </div>
              )}
              
              <button type="submit" className={styles.submitButton}>
                Login
              </button>
            </form>
          </div>
        </div>
      );
}

export default Login;