import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './overview.css';
import MatchSearch from '../../Components/matchSearch';
import SelectOptions from '../../Components/overview/SelectOptions';
import Matches from '../../Components/overview/Matches';
import Referees from '../../Components/overview/Referees';
import Coaches from '../../Components/overview/Coaches';
import Admins from '../../Components/overview/Admins';

function Overview({axiosJWT}) {
  const [picker, setPicker] = useState([]);
  const [selected, setSelected] = useState('')
  // const navigate = useNavigate();

  /*
  * Fetch all matches from the server
  * 
  * @throws {error} - if the request is unsuccessful
  */
  async function getMatches() {
    try {
      const response = await axiosJWT.get(`http://localhost:${process.env.REACT_APP_PORT || 5000}/match/get/all`, {
        headers: {
          'Authorization': sessionStorage.getItem('accessToken')
        }
      });
      setPicker(response.data);
    } catch (error) {
      console.error(error.message);
    }
  };

  async function getAccounts(accountType) {
    try {
      axiosJWT.get(`http://localhost:${process.env.REACT_APP_PORT || 5000}/account/${accountType}/get/all`, {
        headers: {
          'Authorization': sessionStorage.getItem('accessToken')
        }
      }).then((response) => {
        setPicker(response.data);
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  async function getPicker(picked) {
    try {
      setPicker([])
      setSelected(picked)
      switch (picked) {
        case 'matches':
          getMatches();
          break;
        case 'referees':
          getAccounts('referee');
          break;
        case 'coaches':
          getAccounts('coach');
          break;
        case 'admins':
          getAccounts('admin');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  async function handleSelect(e) {
    try {
      e.preventDefault();
      getPicker(e.target.value);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    getPicker('matches');
  }, []);

  return (
    <div className="overview-container">
        <SelectOptions handleSelect={handleSelect} selected={selected}/>
        {selected === 'matches' ? (
          <Matches matches={picker}/>
        ):selected === 'referees' ? (
          <Referees referees={picker}/>
        ):selected === 'coaches' ? (
          <Coaches coaches={picker}/>
        ):selected === 'admins' ? (
          <Admins admins={picker}/>
        ):null}
    </div>
  );
};

export default Overview;