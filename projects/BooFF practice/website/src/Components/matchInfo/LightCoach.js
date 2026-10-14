import "./LightC&R.css"

function LightCoach({coaches}) {
    return (
        <div>
            { coaches.length !== 0 ? (
                <table className="assignmentTable">
                    <tbody>
                        <tr>
                            <td>Firstname:</td>
                            <td>Lastname:</td>
                            <td>Email:</td>
                            <td>Phone:</td>
                        </tr>
                        {coaches.map((coach) => (
                            <tr key={coach.id}>
                                <td>{coach.firstname}</td>
                                <td>{coach.lastname}</td>
                                <td>{coach.email}</td>
                                <td>{coach.phone}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : 
                <p className="assignmentTable">Failed to find any coaches assigned to this match</p>
            }
        </div>
    );
}
  
export default LightCoach;