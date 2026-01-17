import { uploadImage, getPresignedImageUrl, getImageBuffer, transformImage } from "../services/image.service.js";
import pool from "../db/index.js";

export const uploadImageController = async (req, res) => {
    try {
        const file = req.file;
        const userId = req.user.id;

        if (!file) {
            return res.status(400).json({ message: "Image file is required" });
        }

        const { key, bucket } = await uploadImage(file.buffer, file.mimetype, userId);

        const result = await pool.query(
            "INSERT INTO images (mime_type, size, object_key, user_id) VALUES ($1, $2, $3, $4) RETURNING id, created_at, updated_at",
            [file.mimetype, file.size, key, userId],
        );

        return res.status(201).json({
            message: "Image uploaded successfully",
            image: {
                id: result.rows[0].id,
                size: file.size,
                mime_type: file.mimetype,
                created_at: result.rows[0].created_at,
                updated_at: result.rows[0].updated_at,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Image upload failed" });
    }
};

export const getPresignedImageUrlController = async (req, res) => {
    try {
        const imageId = req.params.id;
        const userId = req.user.id;

        const result = await pool.query("SELECT * FROM images WHERE id = $1", [imageId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Image not found" });
        }

        if (result.rows[0].user_id !== userId) {
            return res.status(403).json({ message: "You are not authorized to access this image" });
        }

        const pressignedURL = await getPresignedImageUrl(result.rows[0].object_key);

        return res.status(200).json({
            message: "Image URL retrieved successfully",
            url: pressignedURL,
            image: {
                id: result.rows[0].id,
                size: result.rows[0].size,
                mime_type: result.rows[0].mime_type,
                created_at: result.rows[0].created_at,
                updated_at: result.rows[0].updated_at,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getImagesController = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 10, 100);
        const offset = (page - 1) * limit;

        const result = await pool.query(
            "SELECT id, mime_type, size, created_at, updated_at FROM images WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
            [req.user.id, limit, offset],
        );

        const countResult = await pool.query("SELECT COUNT(*) FROM images WHERE user_id = $1", [req.user.id]);

        return res.status(200).json({
            message: "Images retrieved successfully",
            page: page,
            limit: limit,
            total: Number(countResult.rows[0].count),
            images: result.rows,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const transformImageController = async (req, res) => {
    try {
        const imageDB = req.imageDB;
        console.log("Object Key:", imageDB.object_key);
        const transformations = req.body?.transformations;

        if (!transformations) {
            return res.status(400).json({ message: "Transformations are required" });
        }

        if (Object.keys(transformations).length === 0) {
            return res.status(400).json({ message: "No transformations provided" });
        }

        const { buffer } = await getImageBuffer(imageDB.object_key);

        const { transformedBuffer, mimetype } = await transformImage(buffer, transformations);

        const { key } = await uploadImage(transformedBuffer, mimetype, imageDB.user_id);

        const result = await pool.query(
            "INSERT INTO images (mime_type, size, object_key, user_id) VALUES ($1, $2, $3, $4) RETURNING id, created_at, updated_at",
            [mimetype, transformedBuffer.length, key, imageDB.user_id],
        );

        console.log("Key:", key);

        const pressignedURL = await getPresignedImageUrl(key);

        return res.status(201).json({
            message: "Image transformed successfully",
            url: pressignedURL,
            image: {
                id: result.rows[0].id,
                size: transformedBuffer.length,
                mime_type: mimetype,
                created_at: result.rows[0].created_at,
                updated_at: result.rows[0].updated_at,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
