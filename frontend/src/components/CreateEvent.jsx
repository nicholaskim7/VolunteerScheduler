import axios from 'axios';
import { Multiselect } from 'multiselect-react-dropdown';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './Theme.css'

// Added to frontend GitHub

function RequiredSkillsDropDown({ selectedSkills, setSelectedSkills }){
    const options = [
        {skill: "Organization", key: 1},
        {skill: "Teamwork", key: 2},
        {skill: "Leadership", key: 3},
        {skill: "Attention to Detail", key: 4},
        {skill: "Adaptability", key: 5},
        {skill: "Motivated", key: 6}
        
    ];
    return (
        <div className="form-group">
            <Multiselect options={options} displayValue="skill" selectedValues={selectedSkills} onSelect={setSelectedSkills} onRemove={setSelectedSkills}/>
        </div>
    );
}

function UrgencyDropDown({ selectedUrgency, setSelectedUrgency }) {
    const options = [
        {label: "Critical", key: 1},
        {label: "High", key: 2},
        {label: "Medium", key: 3},
        {label: "Low", key: 4}
    ];

    return (
        <div className="form-group">
            <select className='form-select custom-box' value={selectedUrgency} onChange={setSelectedUrgency}>
                {options.map(option => (
                    <option key={option.label} value={option.label}>{option.label}</option>
                ))}
            </select>
        </div>
    );
}

function CreateEvent() {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [location, setLocation] = useState('')
    const [requiredSkills, setRequiredSkills] = useState([])
    const [urgency, setUrgency] = useState(0)
    const [date, setDate] = useState(new Date());
    const navigate = useNavigate();

    function handleSubmit(event) {
        event.preventDefault();

        axios.post('http://localhost:8081/events/create', {name, description, location, requiredSkills, urgency, date})
        .then(res => {
            console.log(res);
            navigate('/events');
        }).catch(err => console.log(err));
    }

  return (
    <div className='d-flex vh-100 bg-green justify-content-center align-items-center'>
        <div className='w-50 custom-box rounded p-3'>
            <form onSubmit={handleSubmit}>
                <h2>Add Event</h2>
                <div className='mb-2'>
                    <label htmlFor="">Name</label>
                    <input type="text" placeholder = 'Enter name' className='form-control custom-box'
                    onChange={e => setName(e.target.value)}
                    />
                </div>
                <div className='mb-2'>
                    <label htmlFor="">Description</label>
                    <input type="description" placeholder='Enter description' className='form-control custom-box'
                    onChange={e => setDescription(e.target.value)}
                    />
                </div>
                <div className='mb-2'>
                    <label htmlFor="">Location</label>
                    <input type="Location" placeholder='Enter Location' className='form-control custom-box'
                    onChange={e => setLocation(e.target.value)}
                    />
                </div>
                <div className='mb-2'>
                    <label htmlFor="">Required Skills</label>
                    <RequiredSkillsDropDown selectedSkills={requiredSkills} setSelectedSkills={setRequiredSkills}/>
                </div>
                <div className='mb-2'>
                    <label htmlFor="">Urgency</label>
                    <UrgencyDropDown selectedSkills={urgency} setSelectedUrgency={(e) => setUrgency(e.target.value)}/>
                </div>
                <div className='mb-2'>
                    <label htmlFor="">Date</label>
                    <input type="Date" placeholder='Enter Date' className='form-control custom-box'
                    onChange={e => setDate(e.target.value)}
                    />
                </div>
                <button className='btn btn-success'>Submit</button>
            </form>
        </div>
    </div>
)
}

export default CreateEvent