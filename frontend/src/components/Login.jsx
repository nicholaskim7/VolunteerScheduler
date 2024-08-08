import React, { useState, useContext } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './Theme.css';

//changed to implement password hashing
function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const navigate = useNavigate();
    axios.defaults.withCredentials = true;

    function handleSubmit(event) {
        event.preventDefault();
        axios.post('http://localhost:8081/login', { email, password })
        .then(res => {
            setMessage(res.data.message);
            if (res.data.message === 'Login successful...') {
                const userId = res.data.userId;
                const redirectUrl = res.data.redirectUrl;
                setTimeout(() => {
                    navigate(redirectUrl);
                }, 2000);
            }
        })
        .catch(err => {
            setMessage(err.response?.data?.message || 'An error occurred');
        });
    }

  return (
        <div className="d-flex vh-100 justify-content-center align-items-center bg-green">
            <div className="p-3 custom-box w-25 rounded p-3">
                <h2>Log in</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email">Email</label>
                        <input type="email" placeholder="Enter Email" className="form-control custom-box"
                        onChange={e => setEmail(e.target.value)}/>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password">Password</label>
                        <input type="password" placeholder="Enter Password" className="form-control custom-box"
                        onChange={e => setPassword(e.target.value)}/>
                    </div>
                    <button className="btn btn-success">Login</button>
                    <Link to="/create" className='btn btn-success ms-2'>Create Account</Link>
                </form>
                {message && <div className="mt-3 alert alert-info">{message}</div>}
            </div>
        </div>
    
  )
}

export default Login