import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./matchOverview.css";

function MatchOverview({axiosJWT}) {
    const [match, setMatch] = useState([]);
    const navigate = useNavigate();

    // Function to get all matches from the database
    const getAllMatches = async () => {
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
// Compare this snippet from Case_1/src/Pages/matchOverview.js:, the function getAllMatches is called when the component is mounted
    useEffect(() => {
        getAllMatches();
    }, []);

    return (
        <div>
            <h1 className='overview-title'>Match Overview</h1>
            {match.map((match) => (
                <div className='match-form' key={match.id}>
                    <div>
                        <div className='item-div'>
                            <p className='item-title'>Teams:</p>
                            <a className='match-link' href={`/matchviewer/${match.id}`}>{match.teams}</a>
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

export default MatchOverview;