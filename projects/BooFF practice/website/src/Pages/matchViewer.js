import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./matchOverview.css";

function MatchViewer({axiosJWT}) {
    const [match, setMatch] = useState({
        date: '',
        location: '',
        field: '',
        team_1: '',
        team_2: ''
    });
    const matchId = useParams();
    // Function to get a single match from the database, using the matchId from the URL
    async function getMatch() {
        console.log(matchId.matchId)
        const res = await axiosJWT.get(
            `http://localhost:${process.env.REACT_APP_PORT || 5000}/match/get/single/${matchId.matchId}`, {
                headers: {
                    authorization: `${sessionStorage.getItem("accessToken")}`
                },
            }
        )
        return await res.data[0];
    }
    // Compare this snippet from Case_1/src/Pages/matchViewer.js:, the function getMatch is called when the component is mounted
    useEffect(() => {
        getMatch().then((res) => {
            // for(let i = 0; i < res.length; i++) {
            //     res[i].date = res[i].date.split("T")[0];
            // }
            console.log(res)
            res.date = res.date.split("T")[0];
            setMatch(res);
        });
    }, []);
    
    console.log(match)

    return (
        <div>
            <h1>Match Overview</h1>
                <div className="match-form">
                    <div className="match-form_2">
                        <a className="match-link_2">{match.team_1} vs {match.team_2}</a>
                        <p className="match-date_2">{match.date}</p>
                        <p className="match-location_2">{match.location}</p>
                        <p className="match-field_2">{match.field}</p>
                    </div>
                </div>
        </div>
    );
}

export default MatchViewer;