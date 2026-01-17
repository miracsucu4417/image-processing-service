import { query, body, validationResult } from "express-validator";

export const registerValidator = [
    body("username")
        .notEmpty()
        .withMessage("Username is required")
        .isString()
        .withMessage("Username must be a string")
        .trim()
        .isLength({ max: 30 })
        .withMessage("Username must be at most 30 characters long"),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isString()
        .withMessage("Password must be a string")
        .trim()
        .isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage(
            "Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character",
        ),
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        next();
    },
];

export const loginValidator = [
    body("username").notEmpty().withMessage("Username is required").isString().withMessage("Username must be a string").trim(),
    body("password").notEmpty().withMessage("Password is required").isString().withMessage("Password must be a string").trim(),
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        next();
    },
];

export const getImagesValidator = [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be an integer greater than or equal to 1"),
    query("limit").optional().isInt({ min: 1 }).withMessage("Limit must be an integer greater than or equal to 1"),
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        next();
    },
];

export const transformImageValidator = [
    body("transformations.crop").custom((crop) => {
        if (!crop) return true;

        const required = ["width", "height", "x", "y"];
        const hasAll = required.every((k) => crop[k] !== undefined);

        if (!hasAll) {
            throw new Error("crop must include width, height, x and y");
        }

        return true;
    }),

    body("transformations.resize").custom((resize) => {
        if (!resize) return true;

        const required = ["width", "height"];
        const hasAll = required.every((k) => resize[k] !== undefined);

        if (!hasAll) {
            throw new Error("resize must include width and height");
        }

        return true;
    }),

    body("transformations.resize.width").optional().isInt({ min: 1 }).withMessage("resize.width must be a positive integer"),
    body("transformations.resize.height").optional().isInt({ min: 1 }).withMessage("resize.height must be a positive integer"),

    body("transformations.crop.width").optional().isInt({ min: 1 }),
    body("transformations.crop.height").optional().isInt({ min: 1 }),
    body("transformations.crop.x").optional().isInt({ min: 0 }),
    body("transformations.crop.y").optional().isInt({ min: 0 }),

    body("transformations.rotate")
        .optional()
        .isInt()
        .withMessage("rotate must be an integer")
        .isIn([0, 90, 180, 270])
        .withMessage("rotate must be 0, 90, 180, or 270"),

    body("transformations.format").optional().isIn(["jpeg", "png", "webp"]).withMessage("format must be jpeg, png or webp"),

    body("transformations.filters.grayscale").optional().isBoolean(),
    body("transformations.filters.sepia").optional().isBoolean(),
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

        next();
    },
];
