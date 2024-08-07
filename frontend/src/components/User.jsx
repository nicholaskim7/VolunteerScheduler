import react, { useEffect, useState } from 'react'
import React from 'react'
import axios from 'axios';
import { Link } from 'react-router-dom';

function User() {
    const [user, setUser] = useState([])
    useEffect(() => {
        axios.get('http://localhost:8081/')
        .then(res => setUser(res.data))
        .catch(err => console.log(err));

    }, [])



    const handleDelete = async (id) => {
        try {
            await axios.delete('http://localhost:8081/user/'+id)
            window.location.reload()
        }catch(err) {
            console.log(err);
        }
    }

  return (
    <div className='d-flex vh-100 bg-success justify-content-center align-items-center'>
        <div className='w-50 bg-white rounded p-3'>
            <h4>Temporary to see new users being added</h4>
            <Link to="/create" className='btn btn-success'>New User</Link>
            <table className='table'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                    user.map((data, i) => (
                        <tr>
                            <td>{data.full_name}</td>
                            <td>{data.username}</td>
                            <td>
                                <button className='btn btn-danger ms-2' onClick={e => handleDelete(data.user_id)}>Delete</button>
                            </td>
                        </tr>
                    ))
                    }
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default User