
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Management from "./ProfileManagement";
import CreateUser from './CreateUser';
import User from './User';
import LoggedIn from "./UserLoggedin";
import UpdateUser from "./UpdateUser";
import Profile from "./UserProfile";

import Event from './Event';
import CreateEvent from './CreateEvent'
import UpdateEvent from './UpdateEvent';

import VolunteerEventHome from './VolunteerEventHome';
import MatchVolunteer from './MatchVolunteer';

import ReportingModule from './ReportingModule.jsx';

function Bar() {
  return (
    <Router>
      <div>
        <Navbar bg="dark" variant={"dark"} expand="lg">
          
          <Navbar.Brand>Volunteer Scheduler</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                
                <Nav.Link as={Link} to={"/"}>Login</Nav.Link>
                <Nav.Link as={Link} to={"/create"}>Register</Nav.Link>
                <Nav.Link as={Link} to={"/users"}>Users</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          
        </Navbar>
      </div>
      <div>
        <Routes>

          <Route path="/" element={<Login />} />

          <Route path="/loggedin/:id" element={<LoggedIn />} />

          <Route path='/loggedin/updatelogin/:id' element={<UpdateUser />}></Route> {/*for updateing login once user is logged in */}

          <Route path='/loggedin/updateprofile/:id' element={<Profile />}></Route>  {/*for updateing profile once user is logged in */}

          <Route path='/loggedin/profile-management/:id' element={<Management />}></Route> {/* profile management volunteer specific info */}
          
          <Route path="/create" element={<CreateUser />} />

          <Route path="/users" element={<User />} />

          <Route path='/events' element={<Event />}></Route>
          <Route path='/events/create' element={<CreateEvent />}></Route>
          <Route path='/events/update/:event_id' element={<UpdateEvent />}></Route>

          <Route path='/volunteer-event-home' element={<VolunteerEventHome />}></Route>
          <Route path='/volunteer-event-home/match/:user_id/:full_name' element={<MatchVolunteer />}></Route>
            
          <Route path='/reports' element={<ReportingModule />}></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default Bar;