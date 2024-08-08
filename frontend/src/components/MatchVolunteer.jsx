import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import './Theme.css';

function UpdateEvent() {
    const [matchedEvent, setMatchedEvent] = useState(''); // We will set the matchedEvent value by using the event_id
    const [participation, setParticipation] = useState('');
    const {user_id, full_name} = useParams();
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();

        axios.put(`http://localhost:8081/volunteers/match/${user_id}`, { user_id, event_id: matchedEvent, participation })
        .then(res => {
            console.log(res);
            navigate('/volunteer-event-home');
        })
        .catch(err => console.log(err));
    };

  return (
    <div className='d-flex vh-100 bg-green justify-content-center align-items-center'>
        <div className='w-50 custom-box rounded p-3'>
            <form onSubmit={handleSubmit}>
                <h2>Match Event for {full_name}</h2>
                <div className='mb-2'>
                    <label htmlFor="">Event ID</label>
                    <input type="text" placeholder = 'Enter event ID' className='form-control custom-box'
                    onChange={e => setMatchedEvent(e.target.value)}
                    />
                </div>
                <div className='mb-2'>
                    <label htmlFor="">Participation</label>
                    <input type="text" placeholder = 'Enter event Participation' className='form-control custom-box'
                    onChange={e => setParticipation(e.target.value)}
                    />
                </div>
                <button className='btn btn-success'>Submit</button>
            </form>
        </div>
    </div>
)
}

export default UpdateEvent