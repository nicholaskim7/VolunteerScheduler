import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VolunteerHistory.css';

const VolunteerHistory = ({ userId }) => {
  const [volunteerEntries, setVolunteerEntries] = useState([]);

  useEffect(() => {
    const fetchVolunteerHistory = async () => {
      try {
        const response = await axios.get('http://localhost:8081/volunteerHistory', {
          params: { userId }
        });
        setVolunteerEntries(response.data);
      } catch (error) {
        console.error('Error fetching volunteer history:', error);
      }
    };

    fetchVolunteerHistory();
  }, [userId]);

  return (
    <div className="volunteer-history">
      <h2>Volunteer History</h2>
      <table className="volunteer-table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Event Description</th>
            <th>Location</th>
            <th>Skills</th>
            <th>Urgency</th>
            <th>Event Date</th>
          </tr>
        </thead>
        <tbody>
          {volunteerEntries.map(entry => (
            <tr key={entry.id}>
              <td>{entry.eventName}</td>
              <td>{entry.eventDescription}</td>
              <td>{entry.location}</td>
              <td>{entry.skills}</td>
              <td>{entry.urgency}</td>
              <td>{entry.eventDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VolunteerHistory;