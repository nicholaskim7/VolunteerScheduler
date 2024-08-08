import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import NotificationSystem from './NotificationSystem';
import VolunteerHistory from './VolunteerHistory';
import './Theme.css';

function UserLoggedin() {
  const [auth, setAuth] = useState(false);
  const { id } = useParams();
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const [messages, setMessages] = useState('');
  axios.defaults.withCredentials = true;

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8081/user/${id}`)
        .then(res => {
          if (res.data.Status === "Success") {
            setUser(res.data.user);
            setAuth(true);
          } else {
            setAuth(false);
            setMessages(res.data.message);
          }
        })
        .catch(err => console.log(err));
    }
  }, [id]);

  const handleLogout = () => {
    axios.get(`http://localhost:8081/user/${id}/logout`)
      .then(() => {
        location.reload(true);
      })
      .catch(err => console.log(err));
    navigate('/');
  };

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

  const formatAvailability = (availabilityText) => {
    const availability = parseJson(availabilityText);
    return availability.length > 0 ? availability.join(', ') : 'No availability specified';
  };

  return (
    <div>
      {
        auth ? 
          <div className='d-flex flex-column align-items-center bg-green'>
            <h3>You are Authorized --- {id}</h3>
            <div className='mt-4'>
              <div className="dropdown" style={{ position: 'absolute', top: '9px', right: '30px' }}>
                <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                  Menu
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <li><Link to={`/loggedin/updatelogin/${id}`} className='dropdown-item'>Update Login</Link></li>
                  <li><Link to={`/loggedin/updateprofile/${id}`} className='dropdown-item'>Update Profile</Link></li>
                  <li><Link to={`/loggedin/profile-management/${id}`} className='dropdown-item'>Update Volunteer Info</Link></li>
                  <li><button onClick={handleLogout} className='dropdown-item'>Logout</button></li>
                </ul>
              </div>
            </div>
            <div className='mt-4 custom-box w-50 rounded p-3'>
              <h2>@{user.username}</h2>
              {user.profile_picture && <img src={`http://localhost:8081${user.profile_picture}`} alt="Profile" width="150" height="140" className='mb-3' style={{ borderRadius: '50%' }} />}
              <div className='mb-2'>
                <strong>Name:</strong> {user.full_name}
              </div>
              <div className='mb-2'>
                <strong>Address1:</strong> {user.address1}
              </div>
              <div className='mb-2'>
                <strong>Address2:</strong> {user.address2}
              </div>
              <div className='mb-2'>
                <strong>City:</strong> {user.city}
              </div>
              <div className='mb-2'>
                <strong>State:</strong> {user.state}
              </div>
              <div className='mb-2'>
                <strong>Zipcode:</strong> {user.zipcode}
              </div>
              <div className='mb-2'>
                <strong>Skills:</strong> {formatSkills(user.skills)}
              </div>
              <div className='mb-2'>
                <strong>Preferences:</strong> {user.preferences}
              </div>
              <div className='mb-2'>
                <strong>Availability:</strong> {formatAvailability(user.availability)}
              </div>
            </div>
            <div className='mt-4'>
              {id && <NotificationSystem userId={id} />} {/* Render NotificationSystem only when id is available */}
            </div>
            <div className='mt-4'>
              {/* Render the VolunteerHistory component with userId prop */}
              <VolunteerHistory userId={id} />
            </div>
          </div>
        : 
        <div>
          <h3>{messages}</h3>
          <h3>Login Now</h3>
          <Link to="/" className='btn-primary'>Login</Link>
        </div>
      }
    </div>
  );
}

export default UserLoggedin;