import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./matchOverview.css";

function Mymatch({axiosJWT}) {
    const [match, setMatch] = useState([]);
    const navigate = useNavigate();


    const getMymatches = async () => {
        try {
            await axiosJWT.get(`http://localhost:${process.env.REACT_APP_PORT || 5000}/match/get/all`, {
                headers: {
                    'Authorization': sessionStorage.getItem('accessToken')
                }
            }).then((response) => {
                switch (response.status) {
                    case 200:
                        setMatch(response.data);
                        break;
                    default:
                        alert("Something went wrong");
                        break;
                }
            });
        } catch (error) {
            console.error(error.message);
        }
    }

    useEffect(() => {
        getMymatches();
    }, []);

    return (
        <div>
            <h1 className='overview-title'>My Matches</h1>
            {match.map((match) => (
                <div className='match-form' key={match.id}>
                    <div>
                        <div className='item-div'>
                            <p className='item-title'>Teams:</p>
                            <a className='match-link'>{match.team_1} vs {match.team_2}</a>
                        </div>
                        <div className='item-div'>
                            <p className='item-title'>Date:</p>
                            <p className='match-date'>{match.date}</p>
                        </div>
                        <div className='item-div'>
                            <p className='item-title'>Location:</p>
                            <p className='match-location'>{match.location}</p>
                        </div>
                        <div className='item-div'>
                            <p className='item-title'>Field:</p>
                            <p className='match-field'>{match.field}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Mymatch;