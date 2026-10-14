import React, { useState, useEffect } from "react";
import "./userAccount.css";

// Function to get the user account information from the database using the accessToken from the sessionStorage, and then updates the state with the user account information
function UserAccount ({axiosJWT}) {
    const [user, setUser] = useState({
        firstname: '',
        lastname: '',
        phone: '',
        email: '',
        role: '',
        accountConfirm: false
    });
    // Function to handle the change of the user account information
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    function handleChange(e) {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };
// Function to handle the change of the old password input
    function handleOldPasswordChange(e) {
        setOldPassword(e.target.value);
    };
// .. As above
    function handleNewPasswordChange(e) {
        setNewPassword(e.target.value);
    };
// Function to get the user account information from the database using the accessToken from the sessionStorage, and then updates the state with the user account information
    async function fetchUser() {
        try {
            axiosJWT.get(`http://localhost:5000/account/self`, {
                headers: {
                    'Authorization': sessionStorage.getItem('accessToken')
                }
            }).then((res) => {
                setUser({
                    firstname: res.data.firstname,
                    lastname: res.data.lastname,
                    phone: res.data.phone,
                    email: res.data.email,
                    role: res.data.assigned_role,
                    accountConfirm: res.data.accountConfirm
                });

            });
        } catch (error) {
            console.log(error);
        }
    };
// Function to update the user account information in the database using the accessToken from the sessionStorage
    async function updateAccount() {
        try {
            axiosJWT.post('http://localhost:5000/account/update', {
                firstname: user.firstname,
                lastname: user.lastname,
                phone: user.phone,
                email: user.email
            }, {
                headers: {
                    'Authorization': sessionStorage.getItem('accessToken')
                }
            }).then((res) => {
                setUser(res.data);
            })
        } catch (error) {
            console.log(error);
        }
    };
// Function to change the password in the database using the accessToken from the sessionStorage
    async function changePassword() {
        try {
            axiosJWT.post('http://localhost:5000/account/update/password', {
                oldPassword: oldPassword,
                newPassword: newPassword
            }, {
                headers: {
                    'Authorization': sessionStorage.getItem('accessToken')
                }
            }).then((res) => {
                if (res.data === 'Password not updated') {
                    alert('Password not updated');
                } else {
                    alert('Password updated successfully');
                }
            })
        } catch (error) {
            console.log(error);
        }
    };
// Function to confirm the account in the database using the accessToken from the sessionStorage
    async function confirmAccount() {
        try {
            axiosJWT.post('http://localhost:5000/account/confirm', {
                accountConfirm: user.accountConfirm
            }, {
                headers: {
                    'Authorization': sessionStorage.getItem('accessToken')
                }
            }).then((res) => {
                setUser(res.data);
            })
        } catch (error) {
            console.log(error);       
        }
    }
// Function to delete the account in the database using the accessToken from the sessionStorage
    async function deleteAccount() {
        try {
            axiosJWT.delete('http://localhost:5000/account/delete', {
                headers: {
                    'Authorization': sessionStorage.getItem('accessToken')
                }
            }).then((res) => {
                if (res.data === 'Account not deleted') {
                    alert('Account not deleted');
                } else {
                    alert('Account deleted successfully');
                };
            })
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <div>
            <h1 className="usr-acc-title">User Account</h1>
            <div>

                <div className="info-container">
                    <div className="small-container">
                    <h2 className="sub-title">Account Information</h2>
                        <table className="table-acc-info">
                            <tbody>
                            <tr>
                                
                                <th className="info-text">First Name</th> 
                                <th className="info-value">{user.firstname}</th>
                                
                            </tr>
                            <tr>
                                <th className="info-text">Last Name</th> 
                                <th className="info-value">{user.lastname}</th>
                            </tr>
                            <tr>
                                <th className="info-text">Phone</th> 
                                <th className="info-value">{user.phone}</th>
                            </tr>
                            <tr>
                                <th className="info-text">Email</th> 
                                <th className="info-value">{user.email}</th>
                            </tr>
                            <tr>
                                <th className="info-text">Role</th> 
                                <th className="info-value">{user.role}</th>
                            </tr>
                            <tr>
                                <th className="info-text">Account Confirmed</th> 
                                <th className="info-value">{user.accountConfirm ? 'Yes' : 'No'}</th>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <h2>Update Account</h2>
                <label>First Name: </label>
                <input type="text" name="firstname" value={user.firstname} onChange={handleChange}></input>
                <label>Last Name: </label>
                <input type="text" name="lastname" value={user.lastname} onChange={handleChange}></input>
                <label>Phone: </label>
                <input type="text" name="phone" value={user.phone} onChange={handleChange}></input>
                <label>Email: </label>
                <input type="text" name="email" value={user.email} onChange={handleChange}></input>
                <button onClick={updateAccount}>Update Account</button>

                <h2>Change Password</h2>
                <label>Old Password: </label>
                <input type="password" name="oldPassword" value={oldPassword} onChange={(e) => handleOldPasswordChange(e)}></input>
                <label>New Password: </label>
                <input type="password" name="newPassword" value={newPassword} onChange={(e) => handleNewPasswordChange(e)}></input>
                <button onClick={changePassword}>Change Password</button>

                {/* <h2>Confirm Account</h2>
                <label>Account Confirmed: </label>
                <input type="checkbox" name="accountConfirm" checked={user.accountConfirm} onChange={handleChange}></input>
                <button onClick={confirmAccount}>Confirm Account</button> */}


                <h2>Delete Account</h2>
                <button onClick={deleteAccount}>Delete Account</button>

            </div>
        </div>
    )
}

export default UserAccount;