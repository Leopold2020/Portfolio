import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./matchEdit.css";
import AddRefAndCoach from "../../Components/matchEdit/addRef&coach";

function MatchEdit({axiosJWT}) {
  const [Match, setMatch] = useState({});
  const matchId = useParams();

  async function handleSubmit(e) {
    try {
      e.preventDefault();
      await axiosJWT.post(`http://localhost:${process.env.REACT_APP_PORT || 5000}/match/update`, {
        id: matchId.matchId,
        location: Match.location,
        date: Match.date,
        field: Match.field,
        teams: Match.teams
      }, {
        headers: {
          authorization: `${sessionStorage.getItem("accessToken")}`
        },
      }).then((res) => {
        if (res.status === 200) {
          alert("Match updated");
        } else {
          alert("Something went wrong");
        }
      });
    } catch (error) {
      console.error(error.message);
    } 
  };

  async function getMatch() {
    try {
      axiosJWT.get(
          `http://localhost:${process.env.REACT_APP_PORT || 5000}/match/get/single/${matchId.matchId}`,
        {
          headers: { 
              'Authorization': sessionStorage.getItem('accessToken')
          }
        }
      ).then((res) => {
          if (res.status === 200) {
            setMatch(res.data[0]);
          } else {
            alert("Something went wrong");
          }      
        }
      )
    } catch (error) {
      console.error(error.message);
    }
  };

  async function deleteMatch() {
    try {
      axiosJWT.delete(
          `http://localhost:${process.env.REACT_APP_PORT || 5000}/match/delete/${matchId.matchId}`,
        {
          headers: { 
              'Authorization': sessionStorage.getItem('accessToken')
          }
        }
      ).then((res) => {
          if (res.status === 200) {
            alert("Match deleted");
          } else {
            alert("Something went wrong");

          }      
        }
      )
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    getMatch()
  }, []);

  return (
    <>
      <button className="back-but">
        <a className="back-but-text" href={`/overview`}>Go back</a>
      </button>
      {Match !== undefined ? (
        <div>
        <button className="delete-but" onClick={deleteMatch}>
          <a className="delete-but-text">Delete match</a>
        </button>
      <form className="create-form" onSubmit={handleSubmit}>
        <label className="create-titles">
           Match location:
          <input
            className="create-match"
            type="text"
            name="Match"
            defaultValue={Match.location}
            onChange={(e) => setMatch({...Match, location: e.target.value})}
          />
        </label>
        <label className="create-titles">
          Date:
          <input
            className="create-date"
            type="date"
            name="date"
            defaultValue={Match.date}
            onChange={(e) => setMatch({...Match, date: e.target.value})}
          />
        </label>
        <label className="create-titles">
          Field:
          <input
            className="field"
            type="text"
            name="field"
            defaultValue={Match.field}
            onChange={(e) => setMatch({...Match, field: e.target.value})}
          />
        </label>
        <label className="create-titles">
          Team 1:
            <input
              className="Teams"
              type="text"
              name="Teams"
              defaultValue={Match.teams}
              onChange={(e) => setMatch({...Match, teams: e.target.value})}
            />
        </label>
            <input className="submit-button" type="submit" value="Submit" />
            <AddRefAndCoach axiosJWT={axiosJWT} matchId={matchId.matchId} />
        </form>
        </div>
      ) : <a className="detail-title">You need to login</a> }
    </>
  );
}

export default MatchEdit;