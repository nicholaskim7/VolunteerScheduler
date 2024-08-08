import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VolunteerHistory.css';
import './Theme.css';

const VolunteerHistory = ({ userId }) => {
  const [volunteerEntries, setVolunteerEntries] = useState([]);

  useEffect(() => {
    const fetchVolunteerHistory = async () => {
      try {
        const response = await axios.get('http://localhost:8081/volunteerHistory', {
          params: { user_id: userId }
        });
        setVolunteerEntries(response.data);
      } catch (error) {
        console.error('Error fetching volunteer history:', error);
      }
    };

    fetchVolunteerHistory();
  }, [userId]);

  const formatSkills = (skills) => {
    try {
      const parsedSkills = JSON.parse(skills);
      return parsedSkills.map(skill => skill.skill).join(', ');
    } catch (e) {
      return skills;
    }
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  return (
    <div className="volunteer-history bg-green">
      <h2>Volunteer History</h2>
      <table className="volunteer-table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Event Description</th>
            <th>Location</th>
            <th>Skills</th>
            <th>Urgency</th>
            <th>Participation</th>
            <th>Event Date</th>
          </tr>
        </thead>
        <tbody>
          {volunteerEntries.map(entry => (
            <tr key={entry.id}>
              <td>{entry.event_name}</td>
              <td>{entry.description}</td>
              <td>{entry.location}</td>
              <td>{formatSkills(entry.required_skills)}</td>
              <td>{entry.urgency}</td>
              <td>{entry.participation}</td>
              <td>{formatDate(entry.event_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VolunteerHistory;