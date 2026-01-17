import multer from "multer";
import pool from "../db/index.js";

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed"));
        }
        cb(null, true);
    },
});

export const authorizationCheck = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const imageId = req.params.id;

        const result = await pool.query("SELECT * FROM images WHERE id = $1 AND user_id = $2", [imageId, userId]);

        if (result.rows.length === 0) {
            return res.status(403).json({ message: "You are not authorized to access this image" });
        }

        req.imageDB = result.rows[0];

        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
