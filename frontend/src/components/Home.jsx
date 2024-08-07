import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function Home() {
    return (
      <div className="home">
        <h1>Welcome</h1>
        <h5>To continue please login</h5>
        <Link as={Link} to={"/login"} className='btn btn-primary'>Login or Register</Link>
      </div>
    );
  }
  
  export default Home;
  