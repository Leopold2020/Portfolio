import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import user_icon from "../Assets/person.png";
import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";


const Login = ({changeUser}) => {
  
  const navigate = useNavigate();

  const [action, setAction] = useState("Login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignin = async (event) => {
    try {
      event.preventDefault();
      const login = await fetch(
        `http://localhost:${process.env.REACT_APP_PORT || 5000}/login`,
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

      await login.json().then((response) => {
        console.log(response)
          if (response.status !== 401 || response.status !== 403) {
            sessionStorage.setItem("name", response.name);
            sessionStorage.setItem("role", response.role);
            sessionStorage.setItem("accessToken", response.accessToken);
            changeUser(response.role);
            navigate("/home");
          } else {
            alert("Login Failed");
          }
      });
    } catch (error) {
      console.log(error);
      alert("Login Failed");
    }
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
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
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        {action === "Login" ? (
          <div></div>
        ) : (
          <div className="input">
            <img src={user_icon} alt="" />
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={handleNameChange}
            />
          </div>
        )}
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
      {action === "Sign Up" ? (
        <div></div>
      ) : (
        <div className="forgot-password">
          Lost Password? <span>Click Here!</span>
        </div>
      )}
      <div className="submit-container">
        {action === "Login" ? (
          <div className="submit" onClick={handleSignin}>
            Login
          </div>
        ) : (
          <div
            className={action === "Sign Up" ? "submit gray" : "submit"}
            onClick={() => {
              setAction("Login");
            }}
          >
            Login
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
