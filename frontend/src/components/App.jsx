import React from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from "./Navibar";
import NotificationSystem from './NotificationSystem';

function App() {
  const { id } = useParams(); // Extract userId from route params

  return (
    <div>
      <NavBar/>
    </div>
  );
}

export default App;