const pool = require("../database/db");

const addAssignment = async (match_id, account_id, account_role) => {
    try {
        return await pool.query(
            // `INSERT INTO assignment (match_id, account_id, account_role) VALUES ('${match_id}', '${account_id}', '${account_role}')`
            `SELECT * FROM insertAssignment(
                '${match_id}',
                '${account_id}',
                '${account_role}'
            )`
        ).then((response) => {
            if (!response.rowCount == 0) {
                return {message: "Assignment added successfully"}
            } else {
                return {message: "Assingment not added"}
            }
        })
    } catch (err) {
        console.error(err.message);
    }
};

const confirmChange = async (id, state) => {
    try {
        return await pool.query(
            `SELECT * FROM assignementConfirmChange('${id}', '${state}')`
        ).then((response) => {
            if (!response.rowCount == 0) {
                return {message: "Assignment confirmed successfully"}
            } else {
                return {message: "Assingment not confirmed"}
            }
        })
    } catch (error) {
        console.error(error)
    }
};

const noticeChange = async (id, state) => {
    try {
        return await pool.query(
            `SELECT * FROM assignementNoticeChange('${id}', '${state}')`
        ).then((response) => {
            if (!response.rowCount == 0) {
                return {message: "Assignment noticed successfully"}
            } else {
                return {message: "Assingment not noticed"}
            }
        })
    } catch (error) {
        console.error(error)
    }
};

const onSiteChange = async (id, state) => {
    try {
        return await pool.query(
            `SELECT * FROM assignementOnSiteChange('${id}', '${state}')`
        ).then((response) => {
            if (!response.rowCount == 0) {
                return {message: "Assignment onsite status changed successfully"}
            } else {
                return {message: "Assingment onsite status not changed"}
            }
        })
    } catch (error) {
        console.error(error)
    }
};

const removeAssignment = async (id) => {
    try {
        return await pool.query(
            `DELETE FROM assignment WHERE id = '${id}'`
        ).then((response) => {
            if (!response.rowCount == 0) {
                return {message: "Assignment removed successfully"}
            } else {
                return {message: "Assignment not removed"}
            }
        })
    } catch (err) {
        console.error(err.message);
    }
};

const getAssignment = async (account_id) => {
    try {
        const referee = await pool.query(
            `SELECT * FROM assignment WHERE account_id = '${account_id}'`
        );
        return referee.rows;
    } catch (err) {
        console.error(err.message);
    }
};

const getMatchAssignment = async (match_id) => {
    try {
        return pool.query(
            `SELECT account.id AS accountId, assignment.id AS assignmentId, account.firstname, account.lastname, account.email, account.phone, account.assigned_role, assignment.account_on_site, assignment.account_confirm
            FROM (assignment
            INNER JOIN account ON assignment.account_id = account.id)
            WHERE assignment.match_id = ${match_id} AND account.assigned_role = 'referee';`
        ).then( async (refereeList) => {
            return pool.query(
                `SELECT account.id AS accountId, assignment.id AS assignmentId, account.firstname, account.lastname, account.email, account.phone, account.assigned_role, assignment.account_confirm
                FROM (assignment
                INNER JOIN account ON assignment.account_id = account.id)
                WHERE assignment.match_id = ${match_id} AND account.assigned_role = 'coach';`
            ).then((coachList) => {
                return {refereeList: refereeList.rows, coachList: coachList.rows}
            })
        })
    } catch (err) {
        console.error(err.message);
    }
};

const getAllAccountsAssignment = async (account_id) => {
    try {
        return await pool.query(
            `SELECT assignment.id, assignment.match_id, match.date, match.location, match.field, account.assigned_role, match.teams
            FROM (assignment
                INNER JOIN account ON assignment.account_id = account.id
                INNER JOIN match ON assignment.match_id = match.id)
                WHERE assignment.account_id = '${account_id}' ORDER BY match.date DESC`
        ).then((response) => {
            if (!response.rowCount == 0) {
                const tzoffset = new Date().getTimezoneOffset() * 60000;
                for (let i = 0; i < response.rows.length; i++) {
                    response.rows[i].date = new Date(
                        response.rows[i].date - tzoffset
                    ).toISOString().slice(0, -1)
                    var fullDate = response.rows[i].date.split("T");
                    response.rows[i].date = fullDate[0]
                    response.rows[i].time = fullDate[1].slice(0, 5)
                }
                return response.rows
            } else {
                return null
            }
        });
    } catch (err) {
        console.error(err.message);
    }
};

const getComingAccountsAssignment = async (account_id) => {
    try {
        return await pool.query(
            `SELECT assignment.id, assignment.match_id, match.date, match.location, match.field, account.assigned_role, match.teams
            FROM (assignment
                INNER JOIN account ON assignment.account_id = account.id
                INNER JOIN match ON assignment.match_id = match.id)
                WHERE assignment.account_id = '${account_id}' AND match.date >= CURRENT_DATE ORDER BY match.date DESC`
        ).then((response) => {
            if (!response.rowCount == 0) {
                const tzoffset = new Date().getTimezoneOffset() * 60000;
                for (let i = 0; i < response.rows.length; i++) {
                    response.rows[i].date = new Date(
                        response.rows[i].date - tzoffset
                    ).toISOString().slice(0, -1)
                    var fullDate = response.rows[i].date.split("T");
                    response.rows[i].date = fullDate[0]
                    response.rows[i].time = fullDate[1].slice(0, 5)
                }
                return response.rows
            } else {
                return null
            }
        });
    } catch (err) {
        console.error(err.message);
    }
};

const onsiteAssignment = async (matchId, refereeId, newState) => {
    try {
        return await pool.query(
            `UPDATE assignment SET account_on_site = '${newState}' WHERE match_id = '${matchId}' AND account_id = '${refereeId}'`
        ).then((response) => {
            if (!response.rowCount == 0) {
                return {message: "Onsite status updated"}
            } else {
                return {message: "Onsite status not updated"}
            }
        })
    } catch (err) {
        console.error(err.message);
        return {message: "Error"}
    }
};


const testMacthes = [
    [
        {
            id: 1,
            date: "2021-06-01",
            location: "test1",
            field: "A"
        },
        {
            id: 2,
            date: "2021-06-01",
            location: "test1",
            field: "A"
        },
        {
            id: 3,
            date: "2021-06-01",
            location: "test2",
            field: "B"
        }
    ], 
    [
        {
            id: 4,
            date: "2021-06-02",
            location: "test1",
            field: "A"
        },
        {
            id: 5,
            date: "2021-06-02",
            location: "test1",
            field: "A"
        },
        {
            id: 6,
            date: "2021-06-02",
            location: "test2",
            field: "B"
        }
    ]
]

const testReferees = [
    {
        id: 1,
        firstname: "Test1",
        lastname: "Test1"
    }
]

const testAssign = async () => {
    try {
        let assignments = []
        for (i = 0; i < testMacthes.length; i++) {
            for (j = 0; j < testMacthes[i].length; j++) {
                console.log(testMacthes[i][j])

            }
        }
    } catch (error) {
        console.log(error)
    }
}

// testAssign()

const autoAssignReferee = async (matches, referees) => {
    try {

        for (let i = 0; i < matches.length; i++) {
            for (let j = 0; j < referees.length; j++) {
                
            }
        }
    } catch (err) {
        console.error(err.message);
        return {message: "Error"}
    }
};

module.exports = {
    addAssignment,
    confirmChange,
    noticeChange,
    onSiteChange,
    removeAssignment,
    getAssignment,
    getMatchAssignment,
    getAllAccountsAssignment,
    getComingAccountsAssignment,
    onsiteAssignment
}