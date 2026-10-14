import { useState } from "react";
import { Link } from "react-router-dom";    
import './header.css'

function Header () {
    const [active, setActive] = useState("home");

    function handleClick(value) {   
        setActive(value);
    };

    return(
        <>
        <ul className="links">
            {/* <li><Link to="">Home</Link></li>
            <li><Link to="/login">Login</Link></li> */}
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
        </ul>
        </>
    )
}

export default Header;