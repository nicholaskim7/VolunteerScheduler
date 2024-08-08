import  React, {useEffect, useState } from 'react'
import axios  from 'axios'
import { Link } from 'react-router-dom'
import './Theme.css';

function Event() {
    const [event, setEvent] = useState([])

    useEffect(() => {
        axios.get('http://localhost:8081/events')
        .then(res => setEvent(res.data))
        .catch(err => console.log(err));
    }, [])

    const handleDelete = async (event_id) => {
        try {
            await axios.delete('http://localhost:8081/events/'+event_id)
            window.location.reload()
        }catch(err) {
            console.log(err);
        }
    }

    const parseJson = (text) => {
        try {
            return JSON.parse(text);
        } catch (e) {
            return [];
        }
    };

    const formatSkills = (skillsText) => {
        const skills = parseJson(skillsText);
        return skills.length > 0 ? skills.map(skill => skill.skill).join(', ') : 'No skills specified';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        let month = '' + (date.getMonth() + 1);
        let day = '' + date.getDate();
        const year = date.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [month, day, year].join('/');
    };

    return (
        <div data-testid = "todo-1" className='d-flex vh-100 bg-green justify-content-center align-items-center'>
            <div className='custom-box rounded p-3'>
                <Link to='/events/create' className='btn btn-success' style={{ marginRight: '10px' }}>Create Event</Link>
                <Link to='/volunteer-event-home' className='btn btn-success'>Match with Volunteer</Link>
                <table className='volunteer-table custom-box'>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Location</th>
                            <th>Required Skills</th>
                            <th>Urgency</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            event.map((data, i) => (
                                <tr key={i}>
                                    <td>{data.event_name}</td>
                                    <td>{data.description}</td>
                                    <td>{data.location}</td>
                                    <td>{formatSkills(data.required_skills)}</td>
                                    <td>{data.urgency}</td>
                                    <td>{formatDate(data.event_date)}</td>
                                    <td>
                                        <Link to={`update/${data.event_id}`} className='btn btn-primary'>Update</Link>
                                        <button className='btn btn-danger ms-2' onClick={e => handleDelete(data.event_id)}>Delete</button>
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

export default Event