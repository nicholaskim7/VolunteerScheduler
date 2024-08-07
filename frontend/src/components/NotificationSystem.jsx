import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotificationSystem.css';
import Notification from './Notification';

const NotificationSystem = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        console.log('Fetching notifications for userId:', userId);
        
        if (!userId) {
          throw new Error('User ID is not provided');
        }
  
        const response = await axios.get('http://localhost:8081/notifications', {
          params: { userId }
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error.response?.data || error.message);
        setError(`Failed to load notifications: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
      }
    };
  
    fetchNotifications();
  }, [userId]);

  const dismissNotification = async (notificationId) => {
    try {
      const response = await axios.delete(`http://localhost:8081/notifications/${notificationId}`, {
        params: { userId }
      });
      if (response.status === 204) {
        setNotifications(notifications.filter(notification => notification.notification_id !== notificationId));
      } else {
        setError('Failed to dismiss notification');
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
      setError('Failed to dismiss notification');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="notification-system">
      <h2>Notifications</h2>
      <ul>
        {notifications.length === 0 ? (
          <li>No notifications</li>
        ) : (
          notifications.map(notification => (
            <li key={notification.notification_id}>
              <Notification
                message={notification.message}
                onClose={() => dismissNotification(notification.notification_id)}
              />
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default NotificationSystem;