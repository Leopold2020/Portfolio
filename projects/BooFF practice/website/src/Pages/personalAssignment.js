import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PersonalAssignment({axiosJWT}) {
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
            <h1>Personal Assignment</h1>
            <div>
                <h2>All Assignments</h2>
                {allAssignments === null ? <p>No assignments</p> : 
                allAssignments.map((assignment) => (
                    <div key={assignment.id} onClick={() => navigate(`/match/info/${assignment.match_id}`)}>
                        <p>Match: {assignment.location}</p>
                        <p>Field: {assignment.field}</p>
                        <p>Date: {assignment.date}</p>
                        <p>Time: {assignment.time}</p>
                        <p>Teams: {assignment.team_1} - {assignment.team_2}</p>
                    </div>
                ))}
            </div>

            <div>
                <h2>Coming Assignments</h2>
                {comingAssignments === null ? <p>No assignments</p> : 
                comingAssignments.map((assignment) => (                    <div key={assignment.id} onClick={() => navigate(`/match/info/${assignment.match_id}`)}>
                        <p>Match: {assignment.location}</p>
                        <p>Field: {assignment.field}</p>
                        <p>Date: {assignment.date}</p>
                        <p>Time: {assignment.time}</p>
                        <p>Teams: {assignment.team_1} - {assignment.team_2}</p>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default PersonalAssignment;