import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import user_icon from "../Assets/person.png";
import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";

function CreateAccount({axiosJWT}) {
  const navigate = useNavigate();

  const [action, setAction] = useState("Create Account");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");

  const handleSubmit = async (event) => {
    try {
      event.preventDefault();
      if (name === "" || email === "" || password === "") {
        alert("Please fill in all fields");
        return;
      } else if (role === "") {
        role = "employee"
      }
      await axiosJWT.post(`http://localhost:${process.env.REACT_APP_PORT || 5000}/account/create`, {
        username: name,
        email: email,
        password: password,
        role: role
      }, {
        headers: {
          authorization: `Bearer ${sessionStorage.getItem("accessToken")}`
        }
      }).then((res) => {
        switch (res.status) {
          case 200:
            alert("Account created");
            break;
          case undefined:
            alert("You need to login first");
            break;
          default:
            alert("Something went wrong");
            break;
        }
      });
    } catch (error) {
      console.log(error);
      alert("User Creation Failed");
    }
  };

  const roleHandler = (event) => {
    setRole(event.target.value);
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

        <div className="div-status">
          <select className="role" name="role" onChange={roleHandler}>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {action === "Sign Up" ? (
          <div className="submit" onClick={handleSubmit}>
            Sign Up
          </div>
        ) : (
          <div
            className={action === "Sign up" ? "submit gray" : "submit"}
            onClick={() => {
              setAction("Sign Up");
            }}
          >
            Sign Up
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAccount;
