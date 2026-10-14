const pool = require("../database/db");

const getAllMatch = async () => {
    try {
        const match = await pool.query(
            `SELECT * FROM match`
        );
        const tzoffset = new Date().getTimezoneOffset() * 60000;
        for (let i = 0; i < match.rows.length; i++) {
                match.rows[i].date = new Date(
                match.rows[i].date - tzoffset
            ).toISOString().slice(0, -1)
            var fullDate = match.rows[i].date.split("T");
            match.rows[i].date = fullDate[0]
            match.rows[i].time = fullDate[1].slice(0, 5)
        }
        return match.rows;
    } catch (err) {
        console.error(err.message);
    }
};

const getSingleMatch = async (id) => {
    try {
        const match = await pool.query(
            `SELECT * FROM match WHERE id = '${id}'`
            );
            const tzoffset = new Date().getTimezoneOffset() * 60000;
            match.rows[0].date = new Date(
                match.rows[0].date - tzoffset
                ).toISOString().slice(0, -1)
                var fullDate = match.rows[0].date.split("T");
                match.rows[0].date = fullDate[0]
                match.rows[0].time = fullDate[1].slice(0, 5)
                return match.rows;
            } catch (err) {
                console.error(err.message);
            }
        };
        
const filterMatch = async (date, location, field, team_1, team_2) => {
    try {
        await pool.query(
            `SELECT * FROM match WHERE date::text LIKE '%${date}%' AND location lIKE '%${location}%' AND field LIKE '%${field}%' AND TEAM_1 LIKE '%${team_1}%' AND TEAM_2 LIKE '%${team_2}%'`
        ).then((response) => {
            return response.rows;
        });
    } catch (err) {
        console.error(err.message);
    }
};

const getTodayAfterMatch = async () => {
    try {
        const match = await pool.query(
            `SELECT * FROM match WHERE date::date >= current_date`
        );
        const tzoffset = new Date().getTimezoneOffset() * 60000;
        for (let i = 0; i < match.rows.length; i++) {
            match.rows[i].date = new Date(
                match.rows[i].date - tzoffset
            ).toISOString().slice(0, -1)
            var fullDate = match.rows[i].date.split("T");
            match.rows[i].date = fullDate[0]
            match.rows[i].time = fullDate[1].slice(0, 5)
        }
        return match.rows;
    } catch (err) {
        console.log(err.message);
    }
};

const addMatch = async (date, location, field, teams) => {
    try {
        return await pool.query(
            // `INSERT INTO match (date, location, field, TEAM_1, TEAM_2) VALUES ('${date}', '${location}', '${field}', '${team_1}', '${team_2}')`
            `SELECT * FROM insertMatch(
                '${date}', 
                '${location}', 
                '${field}', 
                '${teams}'
            )`
        ).then((response) => {
            if (!response.rowCount == 0) {
                return {message: "Match added successfully"}
            } else {
                return {message: "Match not added"}
            }
        })
    } catch (err) {
        console.error(err.message);
    }
}

const updatematch = async (id, date, location, field, teams) => {
    try {
        return await pool.query(
                // `UPDATE match SET date = '${date}', location = '${location}', field = '${field}', team_1 = '${team_1}', team_2 = '${team_2}' WHERE id = '${id}'`
                `SELECT * FROM updateMatch(
                    '${id}',
                    '${date}',
                    '${location}',
                    '${field}',
                    '${teams}'
                )`
            ).then((response) => {
                if (!response.rowCount == 0) {
                    return {message: "Match updated successfully"}
            } else {
                return {message: "Match not updated"}
            }
        })
    } catch (err) {
        console.error(err.message);
    }
}

const deleteMatch = async (id) => {
    try {
        return await pool.query(
            `DELETE FROM match WHERE id = '${id}'`
        ).then((response) => {
            if (!response.rowCount == 0) {
                return {message: "Match deleted successfully"}
            } else {
                return {message: "Match not deleted"}
            }
        })
    } catch (err) {
        console.error(err.message);
    }
}

module.exports = {
    getAllMatch,
    getSingleMatch,
    filterMatch,
    getTodayAfterMatch,
    addMatch,
    updatematch,
    deleteMatch
}
