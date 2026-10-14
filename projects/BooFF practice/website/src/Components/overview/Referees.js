import { CSVLink } from 'react-csv';

function Referees({referees}) {
  return (
    <div className="column">
          {/* <h1>Referees</h1> */}
          {referees !== null ? (
          <div>
          <CSVLink data={referees} filename={"referees.csv"} className="btn btn-primary" separator=';'>Download all Referees to excel</CSVLink>
            <table className='table'>
            <tbody>
              <tr>
                {/* <td>Referee ID</td> */}
                <td>Firstname:</td>
                <td>Lastname:</td>
                <td>Email:</td>
                <td>Phone:</td>
                <td>Bank number:</td>
                <td>Bank clearing:</td>
              </tr>
            { referees !== null ? ( referees.map((referee) => (
              <tr key={referee.id} className="card">
                {/* <td>{referee.id}</td> */}
                <td>{referee.firstname}</td>
                <td>{referee.lastname}</td>
                <td>{referee.email}</td>
                <td>{referee.phone}</td>
                <td>{referee.bank_number || "N/A"}</td>
                <td>{referee.bank_clering || "N/A"}</td>
              </tr>
            ))
            ):null}
            </tbody>
            </table>
          </div>
          ):<h3>No referees found</h3>}
      </div>
  );
}

export default Referees;