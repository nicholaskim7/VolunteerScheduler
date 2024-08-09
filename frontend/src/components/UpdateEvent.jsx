import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Multiselect } from 'multiselect-react-dropdown';
import { useNavigate, useParams } from 'react-router-dom';

function RequiredSkillsDropDown({ selectedSkills, setSelectedSkills }) {
    const options = [
        { skill: "Organization", key: 1 },
        { skill: "Teamwork", key: 2 },
        { skill: "Leadership", key: 3 },
        { skill: "Attention to Detail", key: 4 },
        { skill: "Adaptability", key: 5 },
        { skill: "Motivated", key: 6 }
    ];

    return (
        <div className="form-group custom-box">
            <Multiselect
                options={options}
                displayValue="skill"
                selectedValues={selectedSkills}
                onSelect={setSelectedSkills}
                onRemove={setSelectedSkills}
            />
        </div>
    );
}

function UrgencyDropDown({ selectedUrgency, setSelectedUrgency }) {
    const options = [
        { label: "Critical", key: 1 },
        { label: "High", key: 2 },
        { label: "Medium", key: 3 },
        { label: "Low", key: 4 }
    ];

    return (
        <div className="form-group">
            <select className='form-select custom-box' value={selectedUrgency} onChange={e => setSelectedUrgency(e.target.value)}>
                {options.map(option => (
                    <option key={option.key} value={option.label}>{option.label}</option>
                ))}
            </select>
        </div>
    );
}

function UpdateEvent() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [requiredSkills, setRequiredSkills] = useState([]);
    const [urgency, setUrgency] = useState('');
    const [date, setDate] = useState('');
    const { event_id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`http://localhost:8081/events/${event_id}`)
            .then(response => {
                const event = response.data;
                setName(event.name);
                setDescription(event.description);
                setLocation(event.location);
                setRequiredSkills(event.requiredSkills || []);
                setUrgency(event.urgency);
                setDate(new Date(event.date).toISOString().substring(0, 10));
            })
            .catch(error => console.error("There was an error fetching the event data!", error));
    }, [event_id]);

    function handleSubmit(event) {
        event.preventDefault();

        axios.put(`http://localhost:8081/events/update/${event_id}`, {
            name, description, location, requiredSkills, urgency, date
        })
            .then(res => {
                console.log(res);
                navigate('/events');
            }).catch(err => console.log(err));
    }

    return (
        <div className='d-flex vh-100 bg-green justify-content-center align-items-center'>
            <div className='w-50 custom-box rounded p-3'>
                <form onSubmit={handleSubmit}>
                    <h2>Update Event</h2>
                    <div className='mb-2'>
                        <label>Name</label>
                        <input type="text" placeholder='Enter name' className='form-control custom-box' value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className='mb-2'>
                        <label>Description</label>
                        <input type="text" placeholder='Enter description' className='form-control custom-box' value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className='mb-2'>
                        <label>Location</label>
                        <input type="text" placeholder='Enter location' className='form-control custom-box' value={location} onChange={e => setLocation(e.target.value)} />
                    </div>
                    <div className='mb-2'>
                        <label>Required Skills</label>
                        <RequiredSkillsDropDown selectedSkills={requiredSkills} setSelectedSkills={setRequiredSkills} />
                    </div>
                    <div className='mb-2'>
                        <label>Urgency</label>
                        <UrgencyDropDown selectedUrgency={urgency} setSelectedUrgency={setUrgency} />
                    </div>
                    <div className='mb-2'>
                        <label>Date</label>
                        <input type="date" placeholder='Enter date' className='form-control custom-box' value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <button className='btn btn-success'>Submit</button>
                </form>
            </div>
        </div>
    );
}

export default UpdateEvent;
