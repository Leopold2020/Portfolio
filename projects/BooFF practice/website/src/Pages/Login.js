import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";
import booff_logo from "../Assets/booff_logo.png";


function Login({roleChange}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  /*
  * Function to handle the login of the user
  * 
  * @param event - the event that triggered the function
  * @param {string} email - the email of the user
  * @param {string} password - the password of the user
  * @return - the user is logged in and redirected to the create page
  * @throws - if the login failed, it is intentionaly 
  * vague to not give away too much information
  */
  const handleSignin = async (event) => {
    try {
      event.preventDefault();
      const login = await fetch(
        `http://localhost:${process.env.REACT_APP_PORT || 5000}/account/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );
      console.log(login);

      await login.json().then((response) => {
          if 
            (response.status == 200) {
            sessionStorage.setItem("firstname", response.firstname);
            sessionStorage.setItem("lastname", response.lastname);
            sessionStorage.setItem("role", response.role);
            sessionStorage.setItem("accessToken", response.accessToken);
            roleChange(response.role);
            switch (response.role) {
              case "admin":
                navigate("/overview");
                break;
              case "referee":
                navigate("/");
                break;
              case "coach":
                navigate("/");
                break;
              default:
                navigate("/");
            }
          } else {
            alert("Login Failed");
          }
      });
    } catch (error) {
      console.log(error);
      alert("Login Failed");
    }
  };

  const handleEmailChange = (event) => {
    event.preventDefault();
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    event.preventDefault();
    setPassword(event.target.value);
  };

  return (
    <div>
      <img className="booff-logga" src={booff_logo} alt=""/>
      <div className="container">
        <div className="header">
          <div className="text">Login</div>
          <div className="underline"></div>
        </div>
        <div className="inputs">
          <div className="input">
            <img src={email_icon} alt="" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
            />
          </div>
          <div className="input">
            <img src={password_icon} alt="" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              />
          </div>
        </div>
          <div className="submit-container">
              <button type="submit" className="submit" onClick={handleSignin}>
                Login
              </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
