import express from "express";
import { registerValidator } from "../middlewares/validate.middleware.js";
import { register } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/register", registerValidator, register);

export default authRouter;
