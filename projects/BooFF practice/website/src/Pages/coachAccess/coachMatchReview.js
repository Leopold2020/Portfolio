import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./coachMatchReview.css";

function MatchReview({axiosJWT}) {
    const [match, setMatch] = useState({
        date: '',
        location: '',
        field: '',
        teams: ''
    });
    const [referees, setReferees] = useState([]);
    const [coach, setCoach] = useState([]);
    const matchId = useParams();

    async function getMatch() {
        try {
        const res = await axiosJWT.get(
            `http://localhost:${process.env.REACT_APP_PORT || 5000}/match/get/single/${matchId.matchId}`, {
                headers: {
                    authorization: `${sessionStorage.getItem("accessToken")}`
                },
            }
        )
        setMatch(res.data[0]);
        } catch (error) {
            console.log(error.message);
        }
    };

    async function getAssignment() {
        try {
            await axiosJWT.get(`http://localhost:${process.env.REACT_APP_PORT || 5000}/assignment/get/match/${matchId.matchId}`, {
                headers: {
                    authorization: `${sessionStorage.getItem("accessToken")}`
                }
            }).then((res) => {
                setReferees(res.data.refereeList);
                setCoach(res.data.coachList);
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    async function handleReferee(assignmentId, state) {
        try {
            await axiosJWT.post(`http://localhost:${process.env.REACT_APP_PORT || 5000}/assignment/onsite`, {
                assignmentId: assignmentId,
                newState: !state
            }, {
                headers: {
                    authorization: `${sessionStorage.getItem("accessToken")}`
                }
            }).then((res) => {
                getAssignment();
                console.log(res.data);
            })
        } catch (error) {
            console.log(error.message);
        }
    }

    useEffect(() => {
        getMatch();
        getAssignment();
    }, []);

    
    return (
        <div>
            <h1>Match Review</h1>
            <div className="match-form">
                <div className="match-form_2">
                    <a className="match-link_2">{match.teams}</a>
                    <p className="match-date_2">{match.date}</p>
                    <p className="match-location_2">{match.location}</p>
                    <p className="match-field_2">{match.field}</p>
                </div>
            </div>

            <h2>Referees</h2>
            <table className="coachTable">
                <tbody>
                    <tr>
                        <td>First Name</td>
                        <td>Last Name</td>
                        <td>Onsite</td>
                    </tr>
                    {referees.map((referee) => (
                        <tr key={referee.accountid}>
                            <td>{referee.firstname}</td>
                            <td>{referee.lastname}</td>
                            {referee.account_on_site ? (
                                <td>yes</td>
                            ) : (
                                <td>No</td>
                            )}
                            <td>
                                <button onClick={() => handleReferee(referee.assignmentid, referee.account_on_site)}>Onsite</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Coaches</h2>
            <table className="coachTable">
                <tbody>
                    <tr>
                        <td>First Name</td>
                        <td>Last Name</td>
                    </tr>
                    {coach.map((coach) => (
                        <tr key={coach.accountid}>
                            <td>{coach.firstname}</td>
                            <td>{coach.lastname}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
};

export default MatchReview;