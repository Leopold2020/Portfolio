import React, { useState, useEffect} from 'react'

function AddRefAndCoach({axiosJWT, matchId}) {
    const [refereeAsignment, setRefereeAssignment] = useState([]);
    const [coachAssignment, setCoachAssignment] = useState([]);
    const [referees, setReferees] = useState(null);
    const [coaches, setCoaches] = useState(null);
    const [selectedReferee, setSelectedReferee] = useState();
    const [selectedCoach, setSelectedCoach] = useState();
    const [refereeTitle, setRefereeTitle] = useState("Add referee: ");
    const [coachTitle, setCoachTitle] = useState("Add coach: ");

    async function getAssignments() {
        try {
            axiosJWT.get(
                `http://localhost:${process.env.REACT_APP_PORT || 5000}/assignment/get/match/${matchId}`,
                {
                    headers: { 
                        'Authorization': sessionStorage.getItem('accessToken')
                    }
                }
            ).then((res) => {
                if (res.status === 200) {
                    setRefereeAssignment(res.data.refereeList);
                    setCoachAssignment(res.data.coachList);
                } else {
                    alert("Something went wrong");
                }      
            })
        } catch (error) {
            console.error(error.message);
        }
    }
    
    async function addReferee() {
        try {
            axiosJWT.post(
                `http://localhost:${process.env.REACT_APP_PORT || 5000}/assignment/add`,
                {
                    match_id: matchId,
                    account_id: selectedReferee,
                    role: "referee"
                },
                {
                    headers: { 
                        'Authorization': sessionStorage.getItem('accessToken')
                    }
                }
            ).then((res) => {
                if (res.status === 200) {
                    alert("Referee added");
                    getAssignments();
                } else {
                    alert("Something went wrong");
                }      
            })
        } catch (error) {
            console.error(error.message);
        }
    }
    
    async function addCoach() {
        try {
            axiosJWT.post(
                `http://localhost:${process.env.REACT_APP_PORT || 5000}/assignment/add`,
                {
                    match_id: matchId,
                    account_id: selectedCoach,
                    role: "coach"
                },
                {
                    headers: { 
                        'Authorization': sessionStorage.getItem('accessToken')
                    }
                }
            ).then((res) => {
                if (res.status === 200) {
                    alert("Coach added");
                    getAssignments();
                } else {
                    alert("Something went wrong");
                }      
            })
        } catch (error) {
            console.error(error.message);
        }
    }
    
    async function getReferees() {
        try {
            axiosJWT.get(
                `http://localhost:${process.env.REACT_APP_PORT || 5000}/account/referee/get/all`,
                {
                    headers: { 
                        'Authorization': sessionStorage.getItem('accessToken')
                    }
                }
            ).then((res) => {
                if (res.status === 200) {
                    if (res.data === null) {
                        setRefereeTitle("No referees available");
                    } else {
                        setReferees(res.data);
                    }
                } else {
                    console.log("Something went wrong with getting referees.")
                }      
            })
        } catch (error) {
            console.error(error.message);
        }
    }
    
    async function getCoaches() {
        try {
            axiosJWT.get(
                `http://localhost:${process.env.REACT_APP_PORT || 5000}/account/coach/get/all`,
                {
                    headers: { 
                        'Authorization': sessionStorage.getItem('accessToken')
                    }
                }
            ).then((res) => {
                if (res.status === 200) {
                    if (res.data === null) {
                        setCoachTitle("No coaches available");
                    } else {
                        setCoaches(res.data);
                    }
                } else {
                    console.log("Something went wrong with getting coaches.");
                }      
            })
        } catch (error) {
            console.log(error.message);
        }
    }

    useEffect(() => {
        getReferees();
        getCoaches();
        getAssignments();
    }, []);

    return (
        <div>
        
            <div className="ref_coach">
                <label className="create-titles">Add referee: 
                    <select defaultValue="default" id="referee_to_add">
                        <option value="default" disabled>{refereeTitle}</option>
                        {referees !== null ? (
                            referees.map((referee) => (
                                <option key={referee.id} value={referee.id} onClick={(e) => setSelectedReferee(e.target.value)}>
                                    {referee.firstname} {referee.lastname}
                                </option>
                            ))
                        ) : 
                            null
                        }
                    </select>
                    <button type="button" onClick={(e) => {addReferee()}}>Add</button>
                </label>
            </div>
            <div>
                {refereeAsignment !== undefined ? (
                    refereeAsignment.map((referee) => (
                        <p key={referee.id}>{referee.firstname} {referee.lastname}</p>
                    ))
                ) : (
                    <p>No referees assigned</p>
                )}
            </div>


            <div className="ref_coach">
                <label className="create-titles">Add a Coach: 
                    <select name="coach" id="coach" defaultValue="default">
                        <option value="default" disabled>{coachTitle}</option>
                        {coaches !== null ? (
                                coaches.map((coach) => (
                                    <option key={coach.id} value={coach.id} onClick={(e) => setSelectedCoach(e.target.value)}>
                                        {coach.firstname} {coach.lastname}
                                    </option>
                                ))
                        ) : 
                            null
                        }
                    </select>
                    <button type="button" onClick={(e) => {addCoach()}}>Add</button>
                </label>
            </div>
            <div>
                {coachAssignment !== undefined ? (
                    coachAssignment.map((coach) => (
                        <p key={coach.id}>{coach.firstname} {coach.lastname}</p>
                    ))
                ) : (
                    <p>No coaches assigned</p>
                )}

            </div>

        </div>
    )
}

export default AddRefAndCoach