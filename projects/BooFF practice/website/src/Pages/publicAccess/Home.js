import { useState, useEffect } from 'react';
import axios from 'axios';
import LightMatches from '../../Components/home/LightMatches';

function Home() {
    const [selected, setSelected] = useState('matches');
    const [content, setContent] = useState([]);

    async function getNewMatches() {
        axios.get(
            `http://localhost:${process.env.REACT_APP_PORT || 5000}/match/get/today/after`, {
                headers: {
                    "content-type": "application/json"
                },
            }
        ).then((response) => {
            setContent(response.data);
        });
    }

    useEffect(() => {
        getNewMatches();
    }, []);

    return (
        <div>
            {/* <button value="matches" onClick={}>match</button> */}
            {/* <div className="overview-container"> */}
            <LightMatches matches={content}/>
            {/* </div> */}
        </div>
    );
}

export default Home;


