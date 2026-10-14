import { useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';

function Matches({matches}) {

    const navigate = useNavigate();

    return (
        <div className='column'>
            {/* <MatchSearch props={{setMatches, axiosJWT}}/> */}
            {/* <h1>Matches</h1> */}
            {matches !== null ? (
            <div>
            <CSVLink data={matches} filename={"matches.csv"} className="btn btn-primary" separator=';' >Download all Matches to excel</CSVLink>
              <table className='table'>
                <tbody>
                <tr>
                  <td>Match:</td>
                  <td>Location:</td>
                  <td>Field:</td>
                  <td>Date:</td>
                  <td>Edit:</td>
                </tr>
                {matches.map((match) => (
                  <tr key={match.id} className="card">
                    <td>{match.teams}</td>
                    <td>{match.location}</td>
                    <td>{match.field}</td>
                    <td>{match.date} {match.time}</td>
                    <td className='editButtonHolder'>
                      <button
                      onClick={(e) => {navigate(`/matchedit/${match.id}`)}} 
                      className="editButton"
                      >Edit
                      </button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
            ):<h3>No matches found</h3>}
          </div>
    )
}

export default Matches;