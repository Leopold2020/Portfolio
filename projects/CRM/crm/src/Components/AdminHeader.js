import { Link } from "react-router-dom";    
import './Header.css'

function Header () {
    return(
        <>
        <ul className="links">
            <li><Link to="">Login</Link></li>
            <li><Link to="home">Home</Link></li>
            <li><Link to="company/all">Company list</Link></li>
            <li><Link to="create-item">Create item</Link></li>
            <li><Link to="create-account">Create Account</Link></li>
            <li><Link to="admin">Admin</Link></li>
        </ul>
        </>
    )
}

export default Header;