import express from "express";
import { registerValidator, loginValidator } from "../middlewares/validate.middleware.js";
import { register, login } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/register", registerValidator, register);

authRouter.post("/login", loginValidator, login);

export default authRouter;