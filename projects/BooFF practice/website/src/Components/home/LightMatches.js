import { useNavigate } from "react-router-dom";
import './LightMatches.css';

function LightMatches({matches}) {
  const navigate = useNavigate();
  
  return (
    <div>
        <h1>Matches</h1>
        <table className="table">
          <tbody>
            <tr>
              <td>Match:</td>
              <td>Location:</td>
              <td>Field:</td>
              <td>Date:</td>
            </tr>
            {matches.map((match) => (
            <tr className="instance" key={match.id} onClick={() => navigate(`/match/info/${match.id}`)}>
                <td>{match.teams}</td>
                <td>{match.location}</td>
                <td>{match.field}</td>
                <td>{match.date} {match.time}</td>
            </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}

export default LightMatches;