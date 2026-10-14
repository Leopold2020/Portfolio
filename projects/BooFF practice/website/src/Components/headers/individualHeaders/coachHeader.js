import { useState } from "react";
import { Link } from "react-router-dom";    
import './header.css'

function CoachHeader () {
  const [active, setActive] = useState("home");

  function handleClick(value) {
    setActive(value);
  };

  return(
      <>
      <ul className="links">
          {/* <li><Link to="">Home</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/coach/homepage">Coach homepage</Link></li>
          <li><Link to="/coach/matches">Personal assignments test</Link></li>
          <li><Link to="/personalassignment">Personal assignments</Link></li> */}
          {
            active === "home" ?
              <li className='active'><Link>Home</Link></li>
            :
              <li onClick={()=>handleClick("home")}><Link to="">Home</Link></li>
          }
          {
            active === "login" ?
              <li className='active'><Link>Login</Link></li>
            :
              <li onClick={()=>handleClick("login")}><Link to="/login">Login</Link></li>
          }
          {
            active === "coach homepage" ?
              <li className='active'><Link>Coach homepage</Link></li>
            :
              <li onClick={()=>handleClick("coach homepage")}><Link to="/coach/homepage">Coach homepage</Link></li>
          }
          {
            active === "personal assignments" ?
              <li className='active'><Link>Personal assignments</Link></li>
            :
              <li onClick={()=>handleClick("personal assignments")}><Link to="/coach/matches">Personal assignments</Link></li>
          }
      </ul>
      </>
  )
}

export default CoachHeader;