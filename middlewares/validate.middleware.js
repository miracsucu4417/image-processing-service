import { body, validationResult } from "express-validator";

export const registerValidator = [
    body("username")
    .notEmpty().withMessage("Username is required")
    .isString().withMessage("Username must be a string")
    .trim()
    .isLength({max: 30}).withMessage("Username must be at most 30 characters long"),
    body("password")
    .notEmpty().withMessage("Password is required")
    .isString().withMessage("Password must be a string")
    .trim()
    .isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    }).withMessage("Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character"),
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
