CREATE DATABASE booff;

\c booff;

CREATE TYPE role AS ENUM('referee', 'coach', 'admin');
CREATE TYPE assignment_role AS ENUM('referee', 'coach');

CREATE TABLE account(
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    confirm BOOLEAN NOT NULL DEFAULT FALSE,
    phone VARCHAR(100) UNIQUE,
    assigned_role role NOT NULL DEFAULT 'referee',
    bank_clering VARCHAR(100),
    bank_number VARCHAR(100)
);

CREATE TABLE match(
    id SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    field VARCHAR(255),
    teams VARCHAR(255) NOT NULL
);

CREATE TABLE assignment(
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    account_role assignment_role NOT NULL DEFAULT 'referee',
    FOREIGN KEY(match_id) REFERENCES match(id),
    FOREIGN KEY(account_id) REFERENCES account(id),
    account_confirm BOOLEAN NOT NULL DEFAULT FALSE,
    account_notice BOOLEAN NOT NULL DEFAULT FALSE,
    account_on_site BOOLEAN NOT NULL DEFAULT TRUE,
    account_paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_amount NUMERIC(100) DEFAULT 0
);

INSERT INTO account(firstname, lastname, password, email, phone, assigned_role, bank_clering, bank_number) VALUES('admin', 'administrator', 'admin', 'admin@secret', '1234', 'admin', '1234', '1234');
