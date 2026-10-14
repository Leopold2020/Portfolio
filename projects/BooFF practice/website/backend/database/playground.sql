-- This file is for testing and playing around with the sql queries and functions
-- the queries/functions in this file either precursor for some functions 
-- or failed attempts at creating functions
-- In short, DO NOT USE THIS FILE IN PRODUCTION

INSERT INTO account(username, password, email, phone, assigned_role, bank_clering, bank_number) VALUES('referee', 'referee', 'ref@test', '1234', 'referee', '1234', '1234');
INSERT INTO account(username, password, email, phone, assigned_role, bank_clering, bank_number) VALUES('referee2', 'referee2', 'ref2@test', '1234', 'referee', '1234', '1234');

INSERT INTO account(username, password, email, phone, assigned_role, bank_clering, bank_number) VALUES('coach', 'coach', 'coach@test', '1234', 'coach', '1234', '1234');

INSERT INTO match(date, location, field, TEAM_1, TEAM_2) VALUES('2024-10-13 10:00:00', 'some location', 'some field', 'team1', 'team2');

INSERT INTO assignment(match_id, account_id, account_role) VALUES(10, 15, 'coach');

SELECT * FROM match WHERE location LIKE '%some%' and date::text LIKE '%10:13%';

SELECT account.username, account.email, account.phone, account.assigned_role
FROM (assignment
INNER JOIN account ON assignment.account_id = account.id)
WHERE assignment.match_id = 1 AND assignment.account_confirm = TRUE;


SELECT * FROM assignment WHERE account_id = 2 AND match_id >= (SELECT id FROM match WHERE match_date >= CURRENT_DATE);

SELECT assignment.id, match.date, match.location, match.field, account.assigned_role, match.TEAM_1, match.TEAM_2
FROM (assignment
INNER JOIN account ON assignment.account_id = account.id
INNER JOIN match ON assignment.match_id = match.id)
WHERE assignment.account_id = 2 ORDER BY match.date DESC;

SELECT assignment.id, match.date, match.location, match.field, account.assigned_role, match.TEAM_1, match.TEAM_2
FROM (assignment
INNER JOIN account ON assignment.account_id = account.id
INNER JOIN match ON assignment.match_id = match.id)
WHERE assignment.account_id = 2 AND match.date >= CURRENT_DATE ORDER BY match.date DESC;

UPDATE assignment SET account_on_site = 'false' WHERE match_id = '3' AND account_id = '2';

EXECUTE 'SELECT * FROM account WHERE firstname = $1' USING quote_literal(admin);

EXECUTE 'SELECT * FROM account';

PREPARE get_account(text) AS 
    SELECT * FROM account WHERE firstname = $1;
EXECUTE get_account(quote_literal('admin'));

quote_literal('admin');

CREATE OR REPLACE FUNCTION testPrint() RETURNS TABLE AS $$
    DECLARE
        why TEXT;
        test jsonb;
    BEGIN
        SELECT 'admin'  INTO why;
        EXECUTE 'SELECT * FROM account WHERE firstname = ' || quote_literal(why) || '' INTO test;
        RETURN test;
    END;
$$ LANGUAGE plpgsql;

SELECT testPrint();

CREATE OR REPLACE FUNCTION test(search VARCHAR) RETURNS TABLE(id INT, firstname VARCHAR, lastname VARCHAR, email VARCHAR, phone VARCHAR, assigned_role role, bank_clering VARCHAR, bank_number VARCHAR) AS $$
BEGIN
    RETURN QUERY EXECUTE 'SELECT * FROM account WHERE firstname = ' || quote_literal(search) || '';
END;
$$ LANGUAGE plpgsql;

SELECT * FROM test('admin'::VARCHAR);

SELECT * FROM account WHERE firstname = quote_literal('admin');

CREATE OR REPLACE FUNCTION test2(search VARCHAR) RETURNS SETOF account AS $$
DECLARE
    r account%rowtype;
BEGIN
    FOR r IN SELECT * FROM account WHERE quote_literal(firstname) = quote_literal(search) LOOP
        RETURN NEXT r;
    END LOOP;
    RETURN;
END;
$$ LANGUAGE plpgsql;

SELECT * FROM test2('admin');

CREATE FUNCTION fu() RETURNS test text AS $$
BEGIN
    DROP TABLE IF EXISTS assignment;
    RETURN 'test';
END;
$$ LANGUAGE plpgsql;

SELECT fu();

CREATE TABLE test (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE
);

ALTER TABLE test DROP CONSTRAINT test_username_key;

DELETE FROM account WHERE quote_literal(firstname) = quote_literal('test')

SELECT firstname AS test FROM account;

