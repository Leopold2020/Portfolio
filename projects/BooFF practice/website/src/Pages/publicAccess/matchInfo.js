import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import './matchInfo.css';
import LightReferee from "../../Components/matchInfo/LightReferee";
import LightCoach from "../../Components/matchInfo/LightCoach";

function MatchInfo() {
    const [match, setMatch] = useState({
        date: '',
        location: '',
        field: '',
        teams: ''
    });
    const [referee, setReferee] = useState([]);
    const [coach, setCoach] = useState([]);
    const matchId = useParams();


    async function getMatch() {
        try {
            axios.get(
                `http://localhost:${process.env.REACT_APP_PORT || 5000}/match/get/single/${matchId.matchId}`, {
                    headers: {
                        "content-type": "application/json"
                    },
                }
            ).then((response) => {
                setMatch(response.data[0]);
            });
        } catch (error) {
            console.log(error.message);
        }
    }

    async function getAssignment() {
        try{
            axios.get(
                `http://localhost:${process.env.REACT_APP_PORT || 5000}/assignment/get/match/${matchId.matchId}`, {
                    headers: {
                        "content-type": "application/json"
                    },
                }
            ).then((response) => {
                setReferee(response.data.refereeList);
                setCoach(response.data.coachList);
            });
        } catch (error) {
            console.log(error.message);
        }
    }

    useEffect(() => {
        getMatch()
        getAssignment()
    }, []);

    return (
        <div>
            <h1>MatchInfo</h1>
            <p>Match ID: {matchId.matchId}</p>
            <div>
                <p>Teams: {match.teams}</p>
                <p>Date: {match.date}  Time: {match.time}</p>
                <p>Location: {match.location}</p>
                <p>Field: {match.field}</p>
            </div>

            <div>
                <LightReferee referees={referee}/>
                <LightCoach coaches={coach}/>
            </div>
        </div>
    )
}

export default MatchInfo;