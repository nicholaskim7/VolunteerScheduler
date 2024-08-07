import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function UpdateUser() {
    const [userData, setUserData] = useState({
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`http://localhost:8081/user/${id}`)
            .then(res => {
                if (res.data.Status === "Success") {
                    setUserData({
                        email: res.data.user.email || '',
                        password: ''
                    });
                } else {
                    setMessage(res.data.message || 'Error fetching user data');
                }
            })
            .catch(err => {
                setMessage('Error fetching user data');
            });
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.put(`http://localhost:8081/update/${id}`, userData)
            .then(res => {
                setMessage(res.data.message);
                if (res.data.message === 'User updated successfully...'){
                    setTimeout(() => {
                        navigate(`/loggedin/${id}`);
                    }, 2000);
                }
            })
            .catch(err => {
                setMessage(err.response?.data?.message || 'An error occurred');
            });
    };

    return (
        <div className='d-flex vh-100 bg-primary justify-content-center align-items-center'>
            <div className='w-50 bg-white rounded p-3'>
                <form onSubmit={handleSubmit}>
                    <h2>Update User Login</h2>
                    <div className='mb-2'>
                        <label>Email</label>
                        <input type="email" name="email" className='form-control'
                            value={userData.email || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='mb-2'>
                        <label>Password</label>
                        <input type="password" name="password" className='form-control'
                            value={userData.password}
                            onChange={handleChange}
                            placeholder="Leave blank to keep current password"
                        />
                    </div>
                    <button className='btn btn-success'>Update</button>
                </form>
                {message && <div className="mt-3 alert alert-info">{message}</div>}
            </div>
        </div>
    );
}

export default UpdateUser;