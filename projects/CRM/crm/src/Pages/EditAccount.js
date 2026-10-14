import { useParams, useNavigate } from "react-router-dom";
import "./CreateItem.css";
import { useEffect, useState } from "react";

function EditAccount() {
  const navigate = useNavigate();
  const [account, setAccount] = useState({});
  const accountName = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const id = account.id;
    const username = data.get("account");
    const password = data.get("password");
    const role = data.get("role");
    const email = data.get("email");
    console.log(id, username, password, email, role);
    await fetch(
      `http://localhost:${process.env.REACT_APP_PORT || 5000}/account/update`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, username, password, email, role }),
      }
    ).then((res) => {
      switch (res.status) {
        case 200:
          alert("Account updated");
          navigate("/admin");
          break;
        case undefined:
          alert("You need to login first");
          break;
        default:
          alert("Something went wrong");
          break;
      }
    });
  };

  const getAccount = async () => {
    const res = await fetch(
      `http://localhost:${process.env.REACT_APP_PORT || 5000}/account/use/${
        accountName.account
      }`,
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return await res.json();
  };

  useEffect(() => {
    getAccount().then((res) => {
      setAccount(res);
    });
  }, []);

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <label className="create-titles">
        Account Name:
        <input
          className="create-company"
          type="text"
          name="account"
          defaultValue={account.username}
        />
      </label>
      <label className="create-titles">
        Password:
        <input
          className="create-company"
          type="text"
          name="password"
          defaultValue={account.password}
        />
      </label>
      <label className="create-titles">
        Email:
        <input
          className="create-company"
          type="text"
          name="email"
          defaultValue={account.email}
        />
      </label>
      <label className="create-titles">
        Status:
        <select
          className="create-status"
          name="role"
          defaultValue={account.role}
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <input className="submit-button" type="submit" value="Submit" />
    </form>
  );
}

export default EditAccount;
