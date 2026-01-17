import express from "express";
import authRouter from "./auth.routes.js";
import imageRouter from "./image.routes.js";

const router = express.Router();

router.use("/auth", authRouter);

router.use(imageRouter);

export default router;
