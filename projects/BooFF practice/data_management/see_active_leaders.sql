SELECT members."Fornamn", members."Efternamn", education."Roll", education."Utbildning", education."Utbildning2"
FROM (members
INNER JOIN education ON members."Fornamn" = education."Fornamn" AND members."Efternamn" = education."Efternamn")
LIMIT 10;

SELECT m."Fornamn", m."Efternamn", m."Roller", e.education
FROM members m
JOIN (
    SELECT "Fornamn", "Efternamn", string_agg("Utbildning", ', ') AS education
    FROM education
    GROUP BY "Fornamn", "Efternamn"
) e USING ("Fornamn", "Efternamn") LIMIT 20;

INSERT INTO 
SELECT m."Fornamn", m."Efternamn", m."Roller", e.education
FROM members m
JOIN (
    SELECT "Fornamn", "Efternamn", string_agg("Utbildning", ', ') AS education
    FROM education
    GROUP BY "Fornamn", "Efternamn"
) e USING ("Fornamn", "Efternamn") LIMIT 20;

CREATE TABLE active_members (
    "Fornamn" VARCHAR,
    "Efternamn" VARCHAR,
    "Roller" VARCHAR,
    "Utbildning" VARCHAR
);

INSERT INTO active_members
SELECT m."Fornamn", m."Efternamn", m."Roller", e.education
FROM members m
JOIN (
    SELECT "Fornamn", "Efternamn", string_agg("Utbildning", ', ') AS education
    FROM education
    GROUP BY "Fornamn", "Efternamn"
) e USING ("Fornamn", "Efternamn");
