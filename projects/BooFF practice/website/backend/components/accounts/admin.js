const pool = require("../../database/db");

const getAllAdmins = async () => {
    try {
        return await pool.query(
            `SELECT id, firstname, lastname, email, phone FROM account WHERE assigned_role = 'admin'`
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
    getAllAdmins
}