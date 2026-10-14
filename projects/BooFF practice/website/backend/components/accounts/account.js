const pool = require("../../database/db");

const login = async (email, password) => {
    try {
        const user = await pool.query(
        // `SELECT * FROM account WHERE email = '${email}' AND password = '${password}'`
        `SELECT * FROM login('${email}', '${password}')`
        );
        if (user.rows.length === 0) {
            return 401
        } else {
            return user.rows[0];
        }
    } catch (err) {
        console.error(err.message);
    }
};

const register = async (firstname, lastname, password, email, phone, role, bank_number, bank_clering) => {
    try {
        return await pool.query(
            `SELECT * FROM insertaccount(
                '${firstname}', 
                '${lastname}', 
                '${password}', 
                '${email}', 
                '${phone}', 
                '${role}',
                '${bank_number||null}',
                '${bank_clering||null}'
            )`
            // `INSERT INTO account 
            //     (firstname, lastname, password, email, phone, assigned_role) 
            //     VALUES ('${firstname}', '${lastname}', '${password}', '${email}', '${phone}', '${role}')`
        ).then((response) => {
            console.log(response)
            // if (response.)
            if (!response.rowCount == 0) {
                return {message: "User added successfully"}
            } else {
                return {message: "User not added"}
            }
        })
    } catch (err) {
        console.log(err)
        return {message: "User not added"}
    }
}

const getAccount = async (id) => {
    try {
        return await pool.query(
            `SELECT firstname, lastname, phone, email, assigned_role, confirm FROM account WHERE id = '${id}'`
        ).then((response) => {
            if (!response.rowCount == 0) {
                return response.rows
            } else {
                return {message: "User not found"}
            }
        });
    } catch (err) {
        console.error(err.message);
    }
};

const updateAccount = async (id, firstname, lastname, phone, email) => {
    try {
        return await pool.query(
            `SELECT * FROM updateAccount(
                '${id}',
                '${firstname}',
                '${lastname}',
                '${phone}',
                '${email}'
            )`
        ).then((response) => {
            if (!response.rowCount == 0) {
                return {message: "User updated successfully"}
            } else {
                return {message: "User not updated"}
            }
        })
    } catch (err) {
        console.error(err.message);
    }
};

const updatePassword = async (id, oldPassword, newPassword) => {
    try {

        return await pool.query(
            `SELECT * FROM updatePassword(
                '${id}',
                '${oldPassword}',
                '${newPassword}'
            )`
        ).then((response) => {
            if (!response.rowCount == 0) {
                return {message: "Password updated successfully"}
            } else {
                return {message: "Password not updated"}
            }
        })
    } catch (err) {
        console.error(err.message);
        return {message: "Password not updated"}
    }
};

const confirmAccount = async (id, confirm) => {
    try {
        return await pool.query(
            `SELECT * FROM confirmAccount(
                '${id}',
                '${confirm}'
            )`
        ).then((response) => {
            if (!response.rowCount == 0) {
                return {message: "Account confirmed successfully"}
            } else {
                return {message: "Account not confirmed"}
            }
        })
    } catch (err) {
        console.error(err.message);
    }
};

const deleteAccount = async (id) => {
    try {
        return await pool.query(
            `SELECT * FROM deleteAccount('${id}')`
        ).then((response) => {
            if (!response.rowCount == 0) {
                return {message: "Account deleted successfully"}
            } else {
                return {message: "Account not deleted"}
            }
        })
    } catch (err) {
        console.error(err.message);
    }
};

module.exports = {
    login,
    register,
    getAccount,
    updateAccount,
    updatePassword,
    confirmAccount,
    deleteAccount
}