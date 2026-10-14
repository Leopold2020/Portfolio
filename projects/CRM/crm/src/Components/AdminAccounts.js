import { useState, useEffect } from "react";
import "./AdminAccounts.css";

function AdminAccounts({axiosJWT}) {
  const [accounts, setAccounts] = useState([]);

  const getAccounts = async () => {
    const res = await axiosJWT.get(`http://localhost:${process.env.REACT_APP_PORT || 5000}/account/all`, {
      headers: {
        authorization: `Bearer ${sessionStorage.getItem("accessToken")}`
      },
    });
    return await res.data;
  };

  const handleDelete = async (id) => {
    const res = await axiosJWT.post(`http://localhost:${process.env.REACT_APP_PORT || 5000}/account/delete`, {
      id: id,
    }, {
      headers: {
        authorization: `Bearer ${sessionStorage.getItem("accessToken")}`
      }
    });

    if (res.status === 200) {
      alert("Account deleted");
      setAccounts(accounts.filter((account) => account.id !== id));
    } else {
      alert("Something went wrong");
    }
  };

  useEffect(() => {
    getAccounts().then((res) => {
      setAccounts(res);
    });
  }, []);
  return (
    <div className="admn-acc-ul">
      {accounts.map((account) => (
        <li className="account-content" key={account.id}>
          <div>{account.username}</div>
          <div>{account.email}</div>
          <div>{account.role}</div>
          <div className="acc-button">
            <button className="account-edit">
              <a
                className="edit-text"
                href={`account/edit/${account.username}`}
              >
                Edit
              </a>
            </button>
            <button
              className="acc-del"
              onClick={() => {
                handleDelete(account.id);
              }}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </div>
  );
}

export default AdminAccounts;
