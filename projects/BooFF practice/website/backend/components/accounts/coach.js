const pool = require("../../database/db");

const getAllCoaches = async () => {
    try {
        return await pool.query(
            `SELECT 
                id, 
                firstname, 
                lastname, 
                email, 
                phone, 
                bank_clering, 
                bank_number 
            FROM account WHERE assigned_role = 'coach'`
        ).then((response) => {
            if (!response.rowCount == 0) {
                return response.rows
            } else {
                return null
            }
        });
        // return referee.rows;
    } catch (err) {
        console.error(err.message);
    }
};

module.exports = {
    getAllCoaches
}