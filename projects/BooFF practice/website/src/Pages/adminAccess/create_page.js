import React, { useState } from 'react';
import booff_logo from "../../Assets/booff_logo.png";
import "./create_page.css";

function CreatePage({axiosJWT}) {
  const [account, setAccount] = useState({ 
    firstname: '',
    lastname: '',
    password: '',
    email: '', 
    phone: '', 
    role: 'referee',
    bank_clering: undefined, 
    bank_number: undefined });
  const [match, setMatch] = useState({ 
    date: '',
    location: '', 
    field: '', 
    teams: '' 
  });
  const [arrow_ref, setArrowRef] = useState('↓');
  const [arrow_match, setArrowMatch] = useState('↓');

  const [showaccountFields, setShowaccountFields] = useState(false);
  const [showMatchFields, setShowMatchFields] = useState(false);

  /*
  * Function to handle the creation of a account
  *
  * @param {string} name - the name of the account
  * @param {string} email - the email of the account
  * @param {string} phone - the phone number of the account
  * @param {string} bank_clering - the bank clearing number of the account
  * @param {string} bank_number - the bank account number of the account
  * @return - the account is added to the database
  * @throws - if the account is not added
  */
  const handleAccountSubmit = async () => {
    try {
      await axiosJWT.post(`http://localhost:${process.env.REACT_APP_PORT || 5000}/account/register`, {
        firstname: account.firstname,
        lastname: account.lastname,
        password: account.password,
        email: account.email,
        phone: account.phone,
        role: account.role,
        bank_clering: account.bank_clering,
        bank_number: account.bank_number
      }, {
        headers: { 
          'Authorization': sessionStorage.getItem('accessToken')
        }
      }).then((response) => {
        console.log(response)
        if (response.status === 200) {
          console.log('account added successfully');
        } else {
          console.log('account not added');
        }
      })
    } catch (error) {
      console.error('Error adding account:', error.message);
    }
  };

  /*
  * Function to handle the creation of a match
  *
  * @param {string} date - the date of the match, both date and time
  * @param {string} location - the location of the match
  * @param {string} field - the field of the match
  * @param {string} teams - the teams playing the match
  * @return - the match is added to the database
  * @throws - if the match is not added
  */
  const handleMatchSubmit = async () => {
    try {
      await axiosJWT.post(`http://localhost:${process.env.REACT_APP_PORT || 5000}/match/add`, {
        date: match.date.split('T')[0] + ' ' + match.date.split('T')[1],
        location: match.location,
        field: match.field,
        teams: match.teams
      }, {
        headers: {
          'Authorization': sessionStorage.getItem('accessToken')
        }
      }).then((response) => {
        console.log(response)
        if (response.status === 200) {
          console.log('Match added successfully');
          alert('Match added successfully');
          setMatch({
            date: '',
            location: '', 
            field: '', 
            teams: ''
          });
        }
      })

    } catch (error) {
      console.error('Error adding match:', error.message);
    }
  };

  const toggleaccountFields = () => {
    setShowaccountFields(!showaccountFields);
    setArrowRef(arrow_ref === '↓' ? '↑' : '↓');
  };

  const toggleMatchFields = () => {
    setShowMatchFields(!showMatchFields);
    setArrowMatch(arrow_match === '↓' ? '↑' : '↓');
  };

  return (
    <div className='create-div'>
      <img className="img" src={booff_logo} alt="account" />
      <h2 className='create-page-button' onClick={toggleaccountFields}>Create Account {arrow_ref}</h2>
      {showaccountFields && (
      <form className='create-form'>
        <label className='create-label'>
          Firstame:
          <input
            type="text"
            className='create-input'
            value={account.firstname}
            onChange={(e) => setAccount({ ...account, firstname: e.target.value })}
          />
        </label>
        <label className='create-label'>
          Lastname:
          <input
            type="text"
            className='create-input'
            value={account.lastname}
            onChange={(e) => setAccount({ ...account, lastname: e.target.value })}
          />
        </label>
        <label className='create-label'>
          Password:
          <input
            type="password"
            className='create-input'
            value={account.password}
            onChange={(e) => setAccount({ ...account, password: e.target.value })}
          />
        </label>
        <label className='create-label'>
          Email:
          <input
            type="text"
            className='create-input'
            value={account.email}
            onChange={(e) => setAccount({ ...account, email: e.target.value })}
          />
        </label>
        <label className='create-label'>
          Phone:
          <input
            type="text"
            className='create-input'
            value={account.phone}
            onChange={(e) => setAccount({ ...account, phone: e.target.value })}
          />
        </label>
        <label className='create-label'>
          Role:
          <select 
            className='create-input'
            onChange={(e) => {setAccount({ ...account, role: e.target.value })}}>
            <option value="">--Please select a role--</option>
            <option value="referee">Referee</option>
            <option value="coach">Coach</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label className='create-label'>
          Bank Clearing:
          <input
            type="text"
            className='create-input'
            value={account.bank_clering}
            onChange={(e) => setAccount({ ...account, bank_clering: e.target.value })}
          />
        </label>
        <label className='create-label'>
          Bank Number:
          <input
            type="text"
            className='create-input'
            value={account.bank_number}
            onChange={(e) => setAccount({ ...account, bank_number: e.target.value })}
          />
        </label>
        <button
          type="button"
          className='create-button'
          onClick={handleAccountSubmit}
        >
          Add account
        </button>
      </form>
      )}
      <h2 className='create-page-button' onClick={toggleMatchFields}>Create Match {arrow_match}</h2>
      {showMatchFields && (
      <form className='create-form'>
        <label className='create-label'>
          date:
          <input
            type="datetime-local"
            className='create-input'
            value={match.date}
            onChange={(e) => setMatch({ ...match, date: e.target.value })}
          />
        </label>
        <label className='create-label'>
          Location:
          <input
            type="text"
            className='create-input'
            value={match.location}
            onChange={(e) => setMatch({ ...match, location: e.target.value })}
          />
        </label>
        <label className='create-label'>
          Field:
          <input
            type="text"
            className='create-input'
            value={match.field}
            onChange={(e) => setMatch({ ...match, field: e.target.value })}
          />
        </label>
        <label className='create-label'>
          Teams:
          <input
            type="text"
            className='create-input'
            value={match.teams}
            onChange={(e) => setMatch({ ...match, teams: e.target.value })}
          />
        </label>
        {/* <label className='create-label'>
          Team 2:
          <input
            type="text"
            className='create-input'
            value={match.team2}
            onChange={(e) => setMatch({ ...match, team2: e.target.value })}
          />
        </label> */}
        <button 
          type="button"
          className='create-button'
          onClick={handleMatchSubmit}
        >
          Add Match
        </button>
      </form>
      )}
    </div>
  );
}

export default CreatePage;
