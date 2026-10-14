import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import "./refereeMatches.css";

function RefereeMatches({axiosJWT}) {
    const [allAssignments, setAllAssignments] = useState([]);
    const [comingAssignments, setComingAssignments] = useState([]);
    const navigate = useNavigate();

    const getAllAssignments = async () => {
        try {
            axiosJWT.get(
                `http://localhost:${process.env.REACT_APP_PORT || 5000}/assignment/get/account/all`, {
                    headers: {
                        authorization: `${sessionStorage.getItem("accessToken")}`
                    },
                }
            ).then((res) => {
                setAllAssignments(res.data);
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    function getComingAssignments() {
        try {
            axiosJWT.get(
                `http://localhost:${process.env.REACT_APP_PORT || 5000}/assignment/get/account/coming`, {
                    headers: {
                        authorization: `${sessionStorage.getItem("accessToken")}`
                    },
                }
            ).then((res) => {
                setComingAssignments(res.data);
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    useEffect(() => {
        getAllAssignments();
        getComingAssignments();
    }, []);


    return (
        <div>
            <h1 className="personal-assign-title">Personal Assignment</h1>

            <h2 className="assignment-title">Coming Assignments</h2>
            <table className="refereeTable">
                <tbody>
                    <tr>
                        <td>Match</td>
                        <td>Field</td>
                        <td>Date</td>
                        <td>Time</td>
                        <td>Teams</td>
                    </tr>
                    {comingAssignments === null ? 
                     <tr>
                        <td>N/A</td>
                        <td>N/A</td>
                        <td>N/A</td>
                        <td>N/A</td>
                        <td>N/A</td>
                     </tr>
                     :
                    comingAssignments.map((comingAssignment) => (
                        <tr key={comingAssignment.id} className="refereeInstance" onClick={() => navigate(`/referee/matchreview/${comingAssignment.match_id}`)}>
                            <td>{comingAssignment.location}</td>
                            <td>{comingAssignment.field}</td>
                            <td>{comingAssignment.date}</td>
                            <td>{comingAssignment.time}</td>
                            <td>{comingAssignment.teams}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2 className="assignment-title">All Assignments</h2>
            <table className="refereeTable">
                <tbody>
                    <tr>
                        <td>Match</td>
                        <td>Field</td>
                        <td>Date</td>
                        <td>Time</td>
                        <td>Teams</td>
                    </tr>
                    {allAssignments === null ? 
                     <tr>
                        <td>N/A</td>
                        <td>N/A</td>
                        <td>N/A</td>
                        <td>N/A</td>
                        <td>N/A</td>
                     </tr>
                     :
                    allAssignments.map((assignment) => (
                        <tr key={assignment.id} className="refereeInstance" onClick={() => navigate(`/referee/matchreview/${assignment.match_id}`)}>
                            <td>{assignment.location}</td>
                            <td>{assignment.field}</td>
                            <td>{assignment.date}</td>
                            <td>{assignment.time}</td>
                            <td>{assignment.team_1} - {assignment.team_2}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default RefereeMatches;