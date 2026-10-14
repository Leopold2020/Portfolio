const pool = require("./db_test");

function test() {
    pool.query(
        `SELECT members."Fornamn", members."Efternamn", members."Roller", members."Grupper", education."Utbildning"
        FROM (members INNER JOIN education 
        ON members."Fornamn" = education."Fornamn" AND members."Efternamn" = education."Efternamn")
        WHERE members."Grupper" LIKE '%P13:6%'`
    ).then((response) => {
        console.log(response.rows);
    });
}
// test()

function test2() {
    // `SELECT * FROM education_array`
    pool.query(
        `SELECT "Fornamn", string_agg("Utbildning", ', ') AS "Utbildning"
        FROM education
        GROUP BY "Fornamn" LIMIT 10; `
    ).then((response) => {
        let res = JSON.stringify(response.rows, null, 4); 
        console.log(res);
    });
}
// test2()

pool.query(
    `SELECT * FROM active_members`
).then((response) => {
    // pool.query(`INSERT INTO test (name, lastname) VALUES ('test2', 'åäö')`)
    console.log(response.rows);
});