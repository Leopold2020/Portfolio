import React, { useEffect, useState } from 'react';
import './chooseAssignment.css';

function AssignRefPage({axiosJWT}) {
  const [matches, setMatches] = useState([]);
  const [referees, setReferees] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState();
  const [selectedAccount, setSelectedAccount] = useState();

  const getMatches = async () => {
    try {
        await axiosJWT.get(`http://localhost:${process.env.REACT_APP_PORT || 5000}/match/get/all`, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': sessionStorage.getItem('accessToken')
        }
      }).then((res) => {
        setMatches(res.data);
      });
      // console.log("Matches", response.data);
    } catch (error) {
      console.error(error.message);
    }
  };

  async function getAssignment() {
    try {
      
    } catch (error) {
      console.error(error.message);
    }
  } 
  
  const getAccounts = async () => {
    try {
      await axiosJWT.get(`http://localhost:${process.env.REACT_APP_PORT || 5000}/account/referee/get/all`, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': sessionStorage.getItem('accessToken')
        }
      }).then((res) => {
        // console.log("Referees", res.data);
        setReferees(res.data);
      });
      
    } catch (error) {
      console.error(error.message);
    }
  };
  
  const handleAssignment = async () => {
    try {
      await axiosJWT.post(`http://localhost:${process.env.REACT_APP_PORT || 5000}/assignment/add`, {
        match_id: selectedMatch,
        account_id: selectedAccount,
        role: "s"
      }, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': sessionStorage.getItem('accessToken')
        }
      }).then((res) => {
        switch (res.status) {
          case 200:
            alert("Referee assigned successfully");
            break;
          default:
            alert("Something went wrong");
            break;
        }
      });
      // console.log(response.data);
    } catch (error) {
      console.error(error.message);
    }
  };
  
  useEffect(() => {
    getMatches();
  }, []);

  return (
    <div className="assign-referee-container">
      <h1 className='refheader'>Assign Referee to Match</h1>

      <form className="ref_form">
        <label className='reflabel'>
          Select Match:
          <select className='refselect' onChange={(e) => setSelectedMatch(e.target.value)}>
            <option value="">Select a Match</option>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>{match.team_1} vs {match.team_2} | Field: {match.field} | Location: {match.location} | Date: {match.date}</option>
            ))}
          </select>
        </label>

        <label className='reflabel'>
          Select Referee:
          <select onChange={(e) => {console.log(e.target); setSelectedAccount(e.target.value)}}>
            <option value="">Select a Referee</option>
            {referees.map((referee) => (
              <option key={referee.id} value={referee.id}>{referee.username}</option>
              ))}
          </select>
        </label>

        <button className='refbutton' onClick={handleAssignment}>Assign Referee</button>
      </form>
    </div>
  );
};

export default AssignRefPage;
