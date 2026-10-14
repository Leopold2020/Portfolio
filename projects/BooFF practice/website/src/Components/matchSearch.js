import { useState } from 'react';

function MatchSearch(props) {
    const [searchMatch, setSearchMatch] = useState({
        teams: '',
        location: '',
        field: '',
        year: '',
        month: '',
        day: ''
    });

    function handleMatchSearch(e) {
        setSearchMatch({ ...searchMatch, [e.target.name]: e.target.value });
    }

    async function handleFilter() {
        try {
            props.axiosJWT.post(`http://localhost:${process.env.REACT_APP_PORT || 5000}/match/filter`, {
                teams: searchMatch.teams,
                location: searchMatch.location,
                field: searchMatch.field,
                date: `${searchMatch.year}-${searchMatch.month}-${searchMatch.day}`
                }, {
                    headers: {
                        'Authorization': sessionStorage.getItem('accessToken')
                    }
                }
            ).then((response) => {
                switch (response.status) {
                    case 200:
                        console.log(response.data);
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

    return (
        <div>
            <form>
                <label>Teams</label> 
                <input name='teams' onChange={(e) => {handleMatchSearch(e)}}/>
                <label>location</label>
                <input name='location' onChange={(e) => {handleMatchSearch(e)}}/>
                <label>Field</label>
                <input name='field' onChange={(e) => {handleMatchSearch(e)}}/><br></br>
                <label>year</label>
                <input name='year' onChange={(e) => {handleMatchSearch(e)}}/>
                <label>month</label>
                <input name='month' onChange={(e) => {handleMatchSearch(e)}}/>
                <label>day</label>
                <input name='day' onChange={(e) => {handleMatchSearch(e)}}/>
                <button onClick={handleFilter}>Search</button>
            </form>
            {searchMatch.teams} <br/>
            {searchMatch.location} <br/>
            {searchMatch.field} <br/>
            {searchMatch.year}-{searchMatch.month}-{searchMatch.day}
        </div>
    );
}

export default MatchSearch;