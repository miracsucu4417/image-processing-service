import express from "express";
import { jwtCheck } from "../middlewares/auth.middleware.js";
import {
    uploadImageController,
    getPresignedImageUrlController,
    getImagesController,
    transformImageController,
} from "../controllers/image.controller.js";
import { getImagesValidator, transformImageValidator } from "../middlewares/validate.middleware.js";
import { upload, authorizationCheck, transformLimitCheck } from "../middlewares/image.middleware.js";

const imageRouter = express.Router();

imageRouter.post("/images", jwtCheck, upload.single("image"), uploadImageController);

imageRouter.get("/images/:id", jwtCheck, getPresignedImageUrlController);

imageRouter.get("/images", jwtCheck, getImagesValidator, getImagesController);

imageRouter.post(
    "/images/:id/transform",
    jwtCheck,
    authorizationCheck,
    transformLimitCheck,
    transformImageValidator,
    transformImageController,
);

export default imageRouter;
