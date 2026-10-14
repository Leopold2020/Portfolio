


function ViewAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [referees, setReferees] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [selectedReferee, setSelectedReferee] = useState('');

    const getAssignments = async () => {
        try {
            const response = await axios.get("http://localhost:5000/assignment/get", {
                headers: {
                    'Authorization': sessionStorage.getItem('accessToken')
                }
            });
            console.log("Assignments", response.data);
            setAssignments(response.data);
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <div>
            <h1>View Assignments</h1>
            {assignments.map((assignment) => (
                <div key={assignment.id}>
                    <p>Match: {assignment.match_id}</p>
                    <p>Referee: {assignment.referee_id}</p>
                </div>
            ))}¨

        </div>
    )
}

export default ViewAssignments;
