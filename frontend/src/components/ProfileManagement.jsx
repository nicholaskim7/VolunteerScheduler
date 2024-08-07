import React,{ useState, useEffect } from 'react';
import { Multiselect } from 'multiselect-react-dropdown'
import Datepicker, { DateObject } from 'react-multi-date-picker';
import {Input} from 'react-multi-date-picker';
import axios from 'axios';
import './Management.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {FaCalendarAlt} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

function StateDropdown({ value, onChange }) {
    const options = [
        { label: "AL", value: "Alabama" },
        { label: "AK", value: "Alaska" },
        { label: "AZ", value: "Arizona" },
        { label: "AR", value: "Arkansas" },
        { label: "CA", value: "California" },
        { label: "CO", value: "Colorado" },
        { label: "CT", value: "Connecticut" },
        { label: "DE", value: "Delaware" },
        { label: "FL", value: "Florida" },
        { label: "GA", value: "Georgia" },
        { label: "HI", value: "Hawaii" },
        { label: "ID", value: "Idaho" },
        { label: "IL", value: "Illinois" },
        { label: "IN", value: "Indiana" },
        { label: "IA", value: "Iowa" },
        { label: "KS", value: "Kansas" },
        { label: "KY", value: "Kentucky" },
        { label: "LA", value: "Louisiana" },
        { label: "ME", value: "Maine" },
        { label: "MD", value: "Maryland" },
        { label: "MA", value: "Massachusetts" },
        { label: "MI", value: "Michigan" },
        { label: "MN", value: "Minnesota" },
        { label: "MS", value: "Mississippi" },
        { label: "MO", value: "Missouri" },
        { label: "MT", value: "Montana" },
        { label: "NE", value: "Nebraska" },
        { label: "NV", value: "Nevada" },
        { label: "NH", value: "New Hampshire" },
        { label: "NJ", value: "New Jersey" },
        { label: "NM", value: "New Mexico" },
        { label: "NY", value: "New York" },
        { label: "NC", value: "North Carolina" },
        { label: "ND", value: "North Dakota" },
        { label: "OH", value: "Ohio" },
        { label: "OK", value: "Oklahoma" },
        { label: "OR", value: "Oregon" },
        { label: "PA", value: "Pennsylvania" },
        { label: "RI", value: "Rhode Island" },
        { label: "SC", value: "South Carolina" },
        { label: "SD", value: "South Dakota" },
        { label: "TN", value: "Tennessee" },
        { label: "TX", value: "Texas" },
        { label: "UT", value: "Utah" },
        { label: "VT", value: "Vermont" },
        { label: "VA", value: "Virginia" },
        { label: "WA", value: "Washington" },
        { label: "WV", value: "West Virginia" },
        { label: "WI", value: "Wisconsin" },
        { label: "WY", value: "Wyoming" }
    ];
    return (
        <div className="form-group">
            <div className="w-50 p-3">
                <h6>Select a State</h6>
                <select className="form-select" value={value} onChange={onChange}>
                    {options.map(option => (
                        <option key={option.label} value={option.key}>{option.label}</option>
                    ))}
                </select>
                <p>{value}</p>
            </div>
        </div>
    );
}

function SkillsDropDown({ selectedSkills, setSelectedSkills }){
    const options = [
        {skill: "Organization", key: 1},
        {skill: "Teamwork", key: 2},
        {skill: "Leadership", key: 3},
        {skill: "Attention to Detail", key: 4},
        {skill: "Adaptability", key: 5},
        {skill: "Motivated", key: 6}
        
    ];
    return (
        <div style={{width:"80%", display: "flex"}}>
            <div className="form-group">
                <h6>Select Skills</h6>
                <Multiselect options={options} displayValue="skill" selectedValues={selectedSkills} onSelect={setSelectedSkills} onRemove={setSelectedSkills}/>
            </div>
        </div>
    );
}

function CustomInput({ value, openCalendar }) {
    const displayValue = Array.isArray(value) ? value.map((date) => date.format("YYYY-MM-DD")).join(', ') : '';
    return(
        <div className="input-group">
            <input type="text" className="form-control" value={displayValue} onClick={openCalendar} readOnly/>
            <div className="input-group-append">
                <span className="input-group-text" onClick={openCalendar}>
                    <FaCalendarAlt/>
                </span>
            </div>
        </div>
    );
}

function DatePicker({ selectedDates, setSelectedDates }){
    return (
        <div className="App">
            <label>
                <Datepicker 
                    value={selectedDates} 
                    onChange={setSelectedDates} 
                    multiple 
                    render={<CustomInput />}
                    className="blue"
                />
            </label>
            <div className="selected-dates mt-3">
                <h6>Selected Dates:</h6>
                <ul>
                    {selectedDates.map((date, index) => (
                        <li key={index}>{date.format("YYYY-MM-DD")}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function Management() {
    const [name, setName] = useState('');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [skills, setSkills] = useState([]);
    const [preferences, setPreferences] = useState('');
    const [availability, setAvailability] = useState([]);
    const [message, setMessage] = useState('');
    const {id} = useParams();
    const navigate = useNavigate();

    
    const handleSubmit = (event) => {
        event.preventDefault();
        if (zipcode.length < 5) {  {/*handle valid zipcode*/}
            setMessage('Zipcode must be at least 5 characters');
            return;
        }
        const userProfile = {
            name,
            address1,
            address2,
            city,
            state,
            zipcode,
            skills,
            preferences,
            availability: availability.map(date => date.format("YYYY-MM-DD"))
        };

        axios.put(`http://localhost:8081/profile-management/${id}`, userProfile)
            .then(response => {
                setMessage(response.data.message);
                setTimeout(() => {
                    navigate(`/loggedin/${id}`);
                }, 2000);
            })
            .catch(error => {
                setMessage('Error updating profile management');
            });
    };

    return (
      <div className="profile-management">
        <h2>Profile Management</h2>
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
              <label>Full name:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required maxLength="50" /> {/*50 characters, required*/}
          </div>
  
          <div className="form-group">
              <label>Address 1:</label>
              <input type="text" value={address1} onChange={(e) => setAddress1(e.target.value)} required maxLength="100" /> {/*100 characters, required*/}
          </div>

          <div className="form-group">
              <label>Address 2:</label>
              <input type="text" value={address2} onChange={(e) => setAddress2(e.target.value)} maxLength="100" /> {/*100 characters, optional*/}
          </div>

          <div className="form-group">
              <label>City:</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required maxLength="100" /> {/*100 characters, required*/}
          </div>


          <div className="form-group">
              <label>State:</label>
              <StateDropdown value={state} onChange={(e) => setState(e.target.value)} />  {/*Drop Down, selection required*/}
          </div>

          <div className="form-group">
              <label>Zipcode:</label>
              <input type="text" value={zipcode} onChange={(e) => setZipcode(e.target.value)} required maxLength="9" /> {/*9 characters, at least 5-character code required*/}
          </div>

          <div className="form-group">
              <label>Soft Skills:</label>
              <SkillsDropDown selectedSkills={skills} setSelectedSkills={setSkills} />  {/*Drop Down, selection required*/}
          </div>

          <div className="form-group">
            <label>Preferences:</label>
            <textarea value={preferences} onChange={(e) => setPreferences(e.target.value)}></textarea> {/*Text area, optional*/}
          </div>

          <div className="form-group">
            <label>Availability:</label>
            <h6>Select dates</h6>
            <DatePicker selectedDates={availability} setSelectedDates={setAvailability} />  {/*Date picker, multiple dates allowed, required*/}
          </div>

          <button type="submit">Update Profile</button>
          {message && <div className="mt-3 alert alert-info">{message}</div>}
        </form>
      </div>
    );
  }
  
  export default Management;