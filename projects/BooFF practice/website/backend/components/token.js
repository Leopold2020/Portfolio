const jwt = require('jsonwebtoken');

async function getToken(user) {
    return jwt.sign({id: user.id, role: user.assigned_role || user.role}, 
        process.env.ACCESS_TOKEN_SECRET, 
        {expiresIn: "5h"})
}

const verifyToken = (req, res, next) => {
    const authHead = req.headers.authorization
    if (authHead){
        const token = authHead
        // .split(" ")[1]
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403)
            } else {
                req.user = user
                next()
            }
        })

    } else {
        res.sendStatus(401)
    }
}

// Testing, NOT WORKING CURRENTLY
const verifyTokenTest = (req, res, next) => {
    const authHead = req.headers.authorization
    if (authHead){
        const token = authHead
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403)
            } else {
                if (allowance.includes(user.assigned_role || user.role)){
                    req.user = user
                    next()
                } else {
                    return res.sendStatus(403)
                }
            }
        })
    } else {
        res.sendStatus(401)
    }
};

async function refreshToken(oldToken) {
    if (oldToken){
        return jwt.verify(oldToken, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
            if (err) {
                return 403
            } else {
                const newToken = await getToken(user)
                return {accessToken: newToken, role: user.assigned_role || user.role}
            }
        })
    } else {
        return 401
    }
}

module.exports = {
    getToken,
    verifyToken,
    verifyTokenTest,
    refreshToken
};