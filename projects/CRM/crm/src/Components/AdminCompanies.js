import { useEffect, useState } from "react";
import Item from "../Components/Item";
import "./AdminAccounts.css";

function AdminCompanies({axiosJWT}) {
  const [company, setCompany] = useState([]);

  const getCompanies = async () => {
    const response = await axiosJWT.get(`http://localhost:${process.env.REACT_APP_PORT || 5000}/company/all`, {
      headers: {
        authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      }
    });

    const res = await response
    if (res.status === 401) {
      alert("Unauthorized");
      return [];
    }
    if (res.status === 403) {
      alert("Forbidden");
      return [];
    }
    if (res === undefined) {
      alert("You need to login first");
      return [];
    } else {
      return res.data;
    }
  };

  const handleDelete = async (id) => {
    const res = await axiosJWT.post(`http://localhost:${process.env.REACT_APP_PORT || 5000}/company/delete`, {
      id: id
    }, {
      headers: {
        authorization: `Bearer ${sessionStorage.getItem("accessToken")}`
      }
    });
    if (res.status === 200) {
      setCompany(company.filter((comp) => comp.id !== id));
      alert("Company deleted");
    } else {
      alert("Something went wrong");
    }
  };

  useEffect(() => {
    getCompanies().then((res) => {
      setCompany(res);
    });
  }, []);

  return (
    <div className="company-div">
      {company !== undefined ? (
        company.map((comp) => (
          <li className="company-text" key={comp.id}>
            <Item data={comp} />
            <div className="acc-button">
              <button className="account-edit">
                <a className="edit-text" href={`/company/edit/${comp.name}`}>
                  Edit
                </a>
              </button>
              <button
                className="acc-del"
                onClick={() => {
                  handleDelete(comp.id);
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))
      ) : (
        <div>Nothing to show</div>
      )}
    </div>
  );
}

export default AdminCompanies;
