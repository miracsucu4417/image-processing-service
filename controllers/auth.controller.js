import { registerUser } from "../services/auth.service.js";

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
