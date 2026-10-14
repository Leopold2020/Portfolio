import "./LightC&R.css"

function LightReferee({referees}) {
    return (
        <div>
            { referees.length !== 0 ? (
                <table className="assignmentTable">
                    <tbody>
                        <tr>
                            <td>Firstname:</td>
                            <td>Lastname:</td>
                            <td>Email:</td>
                            <td>Phone:</td>
                        </tr>

                        {referees.map((referee) => (
                            <tr key={referee.id}>
                                <td>{referee.firstname}</td>
                                <td>{referee.lastname}</td>
                                <td>{referee.email}</td>
                                <td>{referee.phone}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : 
                <p className="assignmentTable">Failed to find any referees assigned to this match</p>
            }
        </div>
    );
}

export default LightReferee;