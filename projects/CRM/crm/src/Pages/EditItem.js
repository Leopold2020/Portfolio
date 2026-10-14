import { useParams } from "react-router-dom";
import "./CreateItem.css";
import { useEffect, useState } from "react";

function EditItem({axiosJWT}) {
  const [company, setCompany] = useState({});
  const companyName = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const id = company.id;
    const name = data.get("company");
    const date = data.get("date");
    const toCall = new Date(date).toISOString().slice(0, 10);
    const status = data.get("status");
    const information = data.get("details");
    const email = data.get("email");
    const phone = data.get("phone");
    await axiosJWT.post(`http://localhost:${process.env.REACT_APP_PORT || 5000}/company/update`, {
      id: id,
      name: name,
      toCall: toCall,
      status: status,
      information: information,
      email: email,
      phone: phone,
    }, {
      headers: {
        authorization: `Bearer ${sessionStorage.getItem("accessToken")}`
      },
    }).then((res) => {
      switch (res.status) {
        case 200:
          alert("Company updated");
          break;
        // case 401:
        //   alert("Unauthorized");
        //   break;
        // case 403:
        //   alert("Forbidden");
        //   break;
        case undefined:
          alert("You need to login first");
          break;
        default:
          alert("Something went wrong");
          break;
      }
    });
  };

  const getCompany = async () => {
    await axiosJWT.get(
      `http://localhost:${process.env.REACT_APP_PORT || 5000}/company/use/${companyName.company}`,
      {
        headers: {
          authorization: `Bearer ${sessionStorage.getItem("accessToken")}`
        },
      }
    ).then((res) => {
      switch (res.status) {
        case 200:
          setCompany(res.data);
          break;
        case 401:
          alert("Unauthorized");
          break;
        case 403:
          alert("Forbidden");
          break;
        case undefined:
          alert("You need to login first");
          break;
        default:
          alert("Something went wrong");
          break;
      }
    })
  };

  useEffect(() => {
    getCompany();
  }, []);

  return (
    <>
      <button className="back-but">
        <a className="back-but-text" href={`/home`}>Go back</a>
      </button>
      {company !== undefined ? (
      <form className="create-form" onSubmit={handleSubmit}>
        <label className="create-titles">
          Company Name:
          <input
            className="create-company"
            type="text"
            name="company"
            defaultValue={company.name}
          />
        </label>
        <label className="create-titles">
          New Date:
          <input
            className="create-date"
            type="date"
            name="date"
            defaultValue={company.toCall}
          />
          Old Date: {company.tocall}
        </label>
        <label className="create-titles">
          Status:
          <select
            className="create-status"
            name="status"
            defaultValue={company.status}
          >
            <option value="yellow">Yellow</option>
            <option value="green">Green</option>
            <option value="red">Red</option>
          </select>
        </label>
        <label className="create-titles">
          Contact:
          <input
            className="contact"
            type="number"
            name="phone"
            defaultValue={company.phone}
          />
          <input
            className="contact"
            type="text"
            name="email"
            defaultValue={company.email}
          />
        </label>
        <label className="detail-title">
          Details:
          <textarea
            className="create-details"
            name="details"
            defaultValue={company.information}
          />
        </label>
        <input className="submit-button" type="submit" value="Submit" />
      </form>
      ) : <a className="detail-title">You need to login</a> }
    </>
  );
}

export default EditItem;
