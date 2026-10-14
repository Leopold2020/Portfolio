import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import "./ItemDetails.css";

function ItemDetails({axiosJWT}) {
  const companyName = useParams().company;
  const [company, setCompany] = useState("");

  const getCompany = async () => {
    const res = await axiosJWT.get(
      `http://localhost:${process.env.REACT_APP_PORT || 5000}/company/use/${companyName}`,
      {
        headers: {
          authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.data;
    setCompany(data);
  };

  useEffect(() => {
    getCompany();
  }, []);
  return (
    <div>
      <button className="back-but">
        <a className="back-but-text" href={`/home`}>Go back</a>
      </button>

      {company.tocall !== undefined ? (
      <div className="details-div">
      <p className="details-title">Company Details</p>
      <p className="details-comp-name">{company.name}</p>
      <p>{company.tocall.split("T")[0]}</p>
      <p>Status: {company.status}</p>
        <p>Company Phone Number: {company.phone}</p>
        <p>Company Email: {company.email}</p>
        <div className="info-div">
          <p>{company.information}</p>
        </div>
      </div>
      ) : null }
    </div>
  );
}

export default ItemDetails;
