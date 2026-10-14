CREATE DATABASE crm;

CREATE TABLE account (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL DEFAULT 'employee'
);

CREATE TABLE company (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    information VARCHAR(5000),
    status VARCHAR(255) NOT NULL,
    toCall DATE NOT NULL DEFAULT NOW()+INTERVAL '1 day'
);

DELETE FROM company WHERE id > 0;

INSERT INTO account (username, password, email, role) VALUES ('a', 'a', 'a', 'admin');

INSERT INTO company
(name, email, phone, information, status, toCall)
VALUES
('Company 1', '1@no', '111111111', 'Information 1', 'green', NOW()),
('Company 2', '2@no', '222222222', 'Information 2', 'green', NOW()),
('Company 3', '3@no', '333333333', 'Information 3', 'yellow', NOW()),
('Company 4', '4@no', '444444444', 'Information 4', 'yellow', NOW()),
('Company 5', '5@no', '555555555', 'Information 5', 'red', NOW()),
('Company 6', '6@no', '666666666', 'Information 6', 'green', NOW()+INTERVAL '1 day'),
('Company 7', '7@no', '777777777', 'Information 7', 'green', NOW()+INTERVAL '1 day'),
('Company 8', '8@no', '888888888', 'Information 8', 'yellow', NOW()+INTERVAL '1 day'),
('Company 9', '9@no', '999999999', 'Information 9', 'yellow', NOW()+INTERVAL '1 day'),
('Company 10', '10@no', '1010101010', 'Information 10', 'red', NOW()+INTERVAL '1 day');

SELECT * FROM company WHERE name LIKE '%%';