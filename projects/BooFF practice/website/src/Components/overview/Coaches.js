import { CSVLink } from 'react-csv';

function Coaches({coaches}) {
  return (
    <div className='column'>
            {/* <h1>Coaches</h1> */}
            {coaches !== null ? (
            <div>
            <CSVLink data={coaches} filename={"coaches.csv"} className="btn btn-primary" separator=';'>Download all Coaches to excel</CSVLink>
                <table className='table'>
                    <tbody>
                        <tr>
                            <td>Firstname:</td>
                            <td>Lastname:</td>
                            <td>Email:</td>
                            <td>Phone:</td>
                            <td>Bank number:</td>
                            <td>Bank clearing:</td>
                        </tr>
                        {coaches.map((coach) => (
                            <tr key={coach.id} className="card">
                                <td>{coach.firstname}</td>
                                <td>{coach.lastname}</td>
                                <td>{coach.email}</td>
                                <td>{coach.phone}</td>
                                <td>{coach.bank_number || "N/A"}</td>
                                <td>{coach.bank_clering || "N/A"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            ) :  
                <h3>No coaches found</h3>
            }
    </div>
  );
}

export default Coaches;