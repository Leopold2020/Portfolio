import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./refereeMatches.css";

function RefereeMatchReview({axiosJWT}) {
    const [match, setMatch] = useState({
        date: '',
        location: '',
        field: '',
        teams: ''
    });
    const [assignment, setAssignment] = useState();
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
            await axiosJWT.get(`http://localhost:${process.env.REACT_APP_PORT || 5000}/assignment/`,)
        } catch (error) {
            console.log(error.message);
        }
    };

    async function getAssignments() {
        try {
            await axiosJWT.get(`http://localhost:${process.env.REACT_APP_PORT || 5000}/assignment/get/match/${matchId.matchId}`, {
                headers: {
                    authorization: `${sessionStorage.getItem("accessToken")}`
                }
            }).then((res) => {
                setReferees(res.data.refereeList);
                setCoach(res.data.coachList);
                setAssignment(res.data.refereeList.find(
                    (referee) => referee.firstname === sessionStorage.getItem("firstname") && referee.lastname === sessionStorage.getItem("lastname")
                ));
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    async function handleReferee(state) {
        try {
            console.log(state);
            await axiosJWT.post(`http://localhost:${process.env.REACT_APP_PORT || 5000}/assignment/onsite`, {
                assignmentId: assignment.assignmentid,
                newState: !state
            }, {
                headers: {
                    authorization: `${sessionStorage.getItem("accessToken")}`
                }
            }).then((res) => {
                getAssignments();
                console.log(res.data);
            })
        } catch (error) {
            console.log(error.message);
        }
    };

    function confirmAssignment(state) {
        try {
            axiosJWT.post(`http://localhost:${process.env.REACT_APP_PORT || 5000}/assignment/confirm`, {
                assignmentId: assignment.assignmentid,
                newState: !state
            }, {
                headers: {
                    authorization: `${sessionStorage.getItem("accessToken")}`
                }
            }).then((res) => {
                getAssignments();
                console.log(res.data);
            });
        } catch (error) {
            console.log(error.message);
        }
    }

    useEffect(() => {
        getMatch();
        getAssignments();
    }, []);
        
    return (
        <div>
            {/* <h1>Match Review</h1>
            <div className="match-form">
                <div className="match-form_2">
                    <a className="match-link_2">{match.team_1} vs {match.team_2}</a>
                    <p className="match-date_2">{match.date}</p>
                    <p className="match-location_2">{match.location}</p>
                    <p className="match-field_2">{match.field}</p>
                </div>
            </div> */}

            {/* {assignment ? (
                <button onClick={() => handleReferee(assignment.account_on_site)}>
                    {assignment.account_on_site ? "Onsite" : "Not Onsite"}
                </button>
            ) : (
                <p>Not Assigned</p>
            )} */}

            {assignment ? (
                <button onClick={() => confirmAssignment(assignment.account_confirm)}>
                    {assignment.account_confirm ? "Confirmed" : "Not Confirmed"}
                </button>
            ) : (
                <p>Not Assigned</p>
            )}
            

            <h2>Referees</h2>
            <table className="refereeTable">
                <tbody>
                    <tr>
                        <td>First Name</td>
                        <td>Last Name</td>
                        <td>Confirmed</td>
                    </tr>
                    {referees.map((referee) => (
                        <tr key={referee.accountid}>
                            <td>{referee.firstname}</td>
                            <td>{referee.lastname}</td>

                            {referee.account_confirm ? (
                                <td>yes</td>
                            ) : (
                                <td>No</td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            <h2>Coaches</h2>
            <table className="refereeTable">
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

export default RefereeMatchReview;