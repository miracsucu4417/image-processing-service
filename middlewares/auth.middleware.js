import jwt from "jsonwebtoken";

export const jwtCheck = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "You are not authenticated!" });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ message: "Invalid authorization format!" });
    }

    const token = parts[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            return res.status(403).json({ message: "Token is not valid!" });
        }

        req.user = payload;
        next();
    });
};
