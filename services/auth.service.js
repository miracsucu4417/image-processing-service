import bcrypt from "bcrypt";
import pool from "../db/index.js";

const SALT_ROUNDS = 10;

export const registerUser = async (username, password) => {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at", [
        username,
        hashedPassword,
    ]);

    return result.rows[0];
};

export const findUserByUsername = async (username) => {
    const result = await pool.query("SELECT id, username, password FROM users WHERE username = $1", [username]);

    return result.rows[0];
};
