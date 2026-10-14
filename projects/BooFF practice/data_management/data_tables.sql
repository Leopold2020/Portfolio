CREATE DATABASE booff_data;

\c booff_data;

CREATE TABLE members(
    id SERIAL PRIMARY KEY,
    "Fornamn" VARCHAR,
    "Efternamn" VARCHAR,
    "For- och efternamn" VARCHAR,
    "Personnummer" VARCHAR,
    "Kon (W/M)" VARCHAR,
    "Adress" VARCHAR,
    "Postnummer" VARCHAR,
    "Postort" VARCHAR,
    "Mobiltelefon" VARCHAR,
    "E-post" VARCHAR,
    "Grupper" VARCHAR,
    "Slutade i grupper" VARCHAR,
    "Roller" VARCHAR
);

CREATE TABLE education(
    id SERIAL PRIMARY KEY,
    "Fornamn" TEXT,
    "Efternamn" TEXT,
    "Roll" TEXT,
    "Utbildning" TEXT,
    "Utbildning2" TEXT,
    "Start" DATE,
    "Slut" DATE
);

CREATE TABLE education_array(
    id SERIAL PRIMARY KEY,
    "Fornamn" TEXT,
    "Efternamn" TEXT,
    "Roll" TEXT,
    "Utbildning" JSONB
);

-- INSERT INTO 
-- education_array("Fornamn", "Efternamn", "Roll", "Utbildning") 
-- VALUES('Test1', 'Test1', 'someone', '[
--         {
--             "utbildning":"test", 
--             "start":"once upon a time", 
--             "slut":"idk"
--         },
--         {
--             "utbildning":"test2", 
--             "start":"once upon a time", 
--             "slut":"idk"
--         }
--     ]'
-- );

INSERT INTO 
education_array("Fornamn", "Efternamn", "Roll", "Utbildning") 
VALUES('Test1', 'Test1', 'someone', '{
        "test1":{ 
            "start":"once upon a time", 
            "slut":"idk"
        },
        "test2":{ 
            "start":"once upon a time", 
            "slut":"idk"
        },
        "test3":{
            "start":"once upon a time", 
            "slut":"idk"
        }
    }'
);

CREATE TABLE test (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    lastname VARCHAR
);

CREATE TABLE test2 (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    list JSONB
);

INSERT INTO test(name, lastname) VALUES('testname1', 'testlastname1');
INSERT INTO test(name, lastname) VALUES('testname2', 'testlastname2');

INSERT INTO test2 (SELECT * FROM test);

UPDATE education_array
SET "Utbildning" = "Utbildning" || '[{"utbildning":"test3", "start":"once upon a time", "slut":"idk"}]'
WHERE id = 1;

UPDATE education_array SET "Utbildning" = "Utbildning"::jsonb - '{"test3"}'::text[] WHERE id = 1;

UPDATE education_array
set "Utbildning" = "Utbildning" - 3;

SELECT ("Utbildning") - 1 as test FROM education_array;

CREATE TABLE test (
    "test" VARCHAR,
    "test2" VARCHAR
);

SELECT * FROM members LIMIT 10;

MERGE 

SELECT * FROM education WHERE "Fornamn" = 'Anna' AND "Efternamn" = 'Werin';
SELECT "Roller" FROM members WHERE "Fornamn" = 'Anna' AND "Efternamn" = 'Werin';