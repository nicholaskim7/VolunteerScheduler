import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './Theme.css';

//changed to add password hashing
function CreateUser() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const navigate = useNavigate();

    function handleSubmit(event) {
        event.preventDefault();
        axios.post('http://localhost:8081/create', {name, email, password})
        .then(res => {
            setMessage(res.data.message);
            if (res.data.message === "User created successfully...") {
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            }
        })
        .catch(err => {
            console.log(err);
            setMessage(err.response?.data?.Error || 'Error creating user');
        });
    }

  return (
    <div className='d-flex vh-100 bg-green justify-content-center align-items-center'>
        <div className='w-50 custom-box rounded p-3'>
            <form onSubmit={handleSubmit}>
                <h2>Add User</h2>
                <div className='mb-2'>
                    <label htmlFor="">Name</label>
                    <input type="text" placeholder='Enter Name' className='form-control custom-box'
                    onChange={e => setName(e.target.value)}
                    />
                </div>
                <div className='mb-2'>
                    <label htmlFor="">Email</label>
                    <input type="email" placeholder='Enter Email' className='form-control custom-box'
                    onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div className='mb-2'>
                    <label htmlFor="">Password</label>
                    <input type="text" placeholder='Enter Password' className='form-control custom-box'
                    onChange={e => setPassword(e.target.value)}
                    />
                </div>
                <button className='btn btn-success'>Submit</button>
            </form>
            {message && <div className="mt-3 alert alert-info">{message}</div>}
        </div>
    </div>
  )
};

export default CreateUser