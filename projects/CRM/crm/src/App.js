import React, { useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import axios from 'axios';
import "./App.css";
import "./Pages/Login.js";
import "./Pages/Home.js";
import Login from "./Pages/Login.js";
import Home from "./Pages/Home.js";
import Header from "./Components/Header.js";
import AdminHeader from "./Components/AdminHeader.js";
import CreateItem from "./Pages/CreateItem.js";
import EditItem from "./Pages/EditItem.js";
import Admin from "./Pages/Admin.js";
import CreateAccount from "./Pages/CreateAccount.js";
import Footer from "./Components/Footer.js";
import EditAccount from "./Pages/EditAccount.js";
import ItemDetails from "./Pages/ItemDetails.js";
import CompanyView from "./Pages/CompanyView";
const helmetContext = {};

function App() {
  const [user, setUser] = React.useState();

  const axiosJWT = axios.create();
  axiosJWT.interceptors.request.use(async (config) => {
    refreshToken()
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  async function refreshToken() {
    try {
        await axios.post(`http://localhost:${process.env.REACT_APP_PORT || 5000}/account/refresh`, { 
          accessToken: sessionStorage.getItem("accessToken")
        }).then((response) => {
          console.log(response)
          switch (response.status) {
            case 200:
              sessionStorage.setItem("accessToken", response.data.accessToken);
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
      alert("You need to login")
      console.log(error);
    }
  }

  function changeUser(input) {
    setUser(input);
  }

  useEffect(() => {
    setUser(sessionStorage.getItem("role"));
  }, []);

  return (
    <HelmetProvider context={helmetContext}>
      <BrowserRouter>
        <div className="page">
          {user === "employee" ? (
            <Header />
          ) : user === "admin" ? (
            <AdminHeader />
          ) : null}
          <Routes>
            <Route index element={<Login changeUser={changeUser} axiosJWT={axiosJWT} />} />
            <Route path="login" element={<Login changeUser={changeUser} axiosJWT={axiosJWT} />} />
            <Route path="home" element={<Home axiosJWT={axiosJWT} />} />
            <Route path="company/all" element={<CompanyView axiosJWT={axiosJWT} />} />
            <Route path="company/details/:company" element={<ItemDetails axiosJWT={axiosJWT} />} />
            <Route path="company/edit/:company" element={<EditItem axiosJWT={axiosJWT} />} />
            <Route path="account/edit/:account" element={<EditAccount axiosJWT={axiosJWT} />} />
            <Route path="admin" element={<Admin axiosJWT={axiosJWT} />} />
            <Route path="create-item" element={<CreateItem axiosJWT={axiosJWT} />} />
            <Route path="create-account" element={<CreateAccount axiosJWT={axiosJWT} />} />
            <Route path="*" element={<h2>404 Not Found</h2>} />
          </Routes>
        </div>
        <Footer />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
