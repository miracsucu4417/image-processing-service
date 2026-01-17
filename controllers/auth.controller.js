import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { findUserByUsername, registerUser } from "../services/auth.service.js";

export const register = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await registerUser(username, password);

        return res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Username already exists",
            });
        }

        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await findUserByUsername(username);

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        return res.status(200).json({ message: "Login successful", user, token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
