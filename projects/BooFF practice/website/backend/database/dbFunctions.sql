CREATE OR REPLACE FUNCTION login(sentEmail VARCHAR, sentPassword VARCHAR) RETURNS SETOF account AS $$
    BEGIN
        RETURN QUERY SELECT * FROM account WHERE quote_literal(email) = quote_literal(sentEmail) 
        AND quote_literal(password) = quote_literal(sentPassword) LIMIT 1;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insertAccount(
    sentFirstname VARCHAR, 
    sentLastname VARCHAR, 
    sentEmail VARCHAR, 
    sentPassword VARCHAR, 
    sentPhone VARCHAR, 
    sentRole role, 
    sentBank_clering VARCHAR, 
    sentBank_number VARCHAR
) RETURNS SETOF account AS $$
    BEGIN
        RETURN QUERY INSERT INTO account(
            firstname, 
            lastname, 
            email, 
            password, 
            phone, 
            assigned_role, 
            bank_clering, 
            bank_number
        ) VALUES(
            sentFirstname, 
            sentLastname, 
            sentEmail, 
            sentPassword, 
            sentPhone, 
            sentRole, 
            sentBank_clering, 
            sentBank_number
        ) RETURNING *;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION deleteAccount(
    sentId INTEGER
) RETURNS SETOF account AS $$
    BEGIN
        RETURN QUERY DELETE FROM account WHERE id = sentId RETURNING firstname, lastname, email, phone, assigned_role;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION updateAccount(
    sentId INTEGER,
    sentFirstname VARCHAR, 
    sentLastname VARCHAR, 
    sentEmail VARCHAR, 
    sentPhone VARCHAR
) RETURNS SETOF account AS $$
    BEGIN
        RETURN QUERY UPDATE account SET
            firstname = sentFirstname,
            lastname = sentLastname,
            email = sentEmail,
            phone = sentPhone
        WHERE id = sentId RETURNING *;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION updatePassword(
    sentId INTEGER,
    sentOldPassword VARCHAR,
    sentNewPassword VARCHAR
) RETURNS SETOF account AS $$
    BEGIN
        IF (SELECT password FROM account WHERE id = sentId) != sentOldPassword THEN
            RAISE EXCEPTION 'Old password is incorrect';
        ELSE
            RETURN QUERY UPDATE account SET
                password = sentNewPassword
            WHERE id = sentId RETURNING *;
        END IF;
    END;
$$ LANGUAGE plpgsql;

-- CREATE OR REPLACE FUNCTION updateRole(
--     sentId INTEGER,
--     sentRole role
-- ) RETURNS SETOF account AS $$
--     BEGIN
--         RETURN QUERY UPDATE account SET
--             assigned_role = sentRole
--         WHERE id = sentId RETURNING *;
--     END;
-- $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION updateBankInfo(
    sentId INTEGER,
    sentBank_clering VARCHAR,
    sentBank_number VARCHAR
) RETURNS SETOF account AS $$
    BEGIN
        RETURN QUERY UPDATE account SET
            bank_clering = sentBank_clering,
            bank_number = sentBank_number
        WHERE id = sentId RETURNING *;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insertMatch(
    sentDate TIMESTAMP, 
    sentLocation VARCHAR, 
    sentField VARCHAR, 
    sentTeams VARCHAR
) RETURNS SETOF match AS $$
    BEGIN
        RETURN QUERY INSERT INTO match(
            date, 
            location, 
            field, 
            teams
        ) VALUES(
            sentDate, 
            sentLocation, 
            sentField, 
            sentTeams
        ) RETURNING *;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION updateMatch(
    sentId INTEGER,
    sentDate TIMESTAMP,
    sentLocation VARCHAR,
    sentField VARCHAR,
    sentTeams VARCHAR
) RETURNS SETOF match AS $$
    BEGIN
        RETURN QUERY UPDATE match SET
            date = sentDate,
            location = sentLocation,
            field = sentField,
            teams = sentTeams
        WHERE id = sentId RETURNING *;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION filterMatch(
    sentDate VARCHAR,
    sentLocation VARCHAR,
    sentField VARCHAR,
    sentTeams VARCHAR
) RETURNS SETOF match AS $$
    BEGIN
        RETURN QUERY SELECT * FROM match WHERE date::text LIKE '%' || sentDate::text || '%' 
        AND location lIKE '%' || sentLocation || '%'
        AND field LIKE '%' || sentField || '%'
        AND teams LIKE  '%' || sentTeams || '%';
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insertAssignment(
    sentMatch_id INTEGER, 
    sentAccount_id INTEGER, 
    sentAccount_role assignment_role
) RETURNS SETOF assignment AS $$
    BEGIN
        RETURN QUERY INSERT INTO assignment(
            match_id, 
            account_id, 
            account_role
        ) VALUES(
            sentMatch_id, 
            sentAccount_id, 
            sentAccount_role
        ) RETURNING *;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION assignementConfirmChange(
    sentId INTEGER,
    sentStatus BOOLEAN
) RETURNS SETOF assignment AS $$
    BEGIN
        RETURN QUERY UPDATE assignment SET
            account_confirm = sentStatus
        WHERE id = sentId RETURNING *;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION assignementNoticeChange(
    sentId INTEGER,
    sentStatus BOOLEAN
) RETURNS SETOF assignment AS $$
    BEGIN
        RETURN QUERY UPDATE assignment SET
            account_notice = sentStatus
        WHERE id = sentId RETURNING *;
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION assignementOnSiteChange(
    sentId INTEGER,
    sentStatus BOOLEAN
) RETURNS SETOF assignment AS $$
    BEGIN
        RETURN QUERY UPDATE assignment SET
            account_on_site = sentStatus
        WHERE id = sentId RETURNING *;
    END;
$$ LANGUAGE plpgsql;