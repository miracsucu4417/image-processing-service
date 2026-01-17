import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { streamToBuffer } from "../utils/streamToBuffer.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/aws.js";
import { randomUUID } from "crypto";
import sharp from "sharp";

export const uploadImage = async (buffer, mimetype, userId) => {
    const fileExtension = mimetype.split("/")[1];
    const key = `images/${userId}/${randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
    });

    await s3.send(command);

    return {
        key,
        bucket: process.env.AWS_S3_BUCKET,
    };
};

export const getPresignedImageUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
    });

    const url = await getSignedUrl(s3, command, {
        expiresIn: 300, // saniye → 5 dakika
    });

    return url;
};

export const getImageBuffer = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
    });

    const { Body, ContentType } = await s3.send(command);

    const buffer = await streamToBuffer(Body);

    return {
        buffer,
        contentType: ContentType,
    };
};

export const transformImage = async (buffer, transformations) => {
    let image = sharp(buffer);
    transformations.format = transformations.format ?? "jpeg";

    // 1️⃣ Resize
    if (transformations.resize) {
        const { width, height, fit = "cover" } = transformations.resize;

        image = image.resize(width, height, { fit });
    }

    // 2️⃣ Crop
    if (transformations.crop) {
        const { width, height, x, y } = transformations.crop;

        image = image.extract({
            width: Number(width),
            height: Number(height),
            left: Number(x),
            top: Number(y),
        });
    }

    // 3️⃣ Rotate
    if (transformations.rotate) {
        image = image.rotate(transformations.rotate);
    }

    // 4️⃣ Flip / Flop
    if (transformations.flip) {
        image = image.flip();
    }

    if (transformations.flop) {
        image = image.flop();
    }

    // 5️⃣ Filters
    if (transformations.filters?.grayscale) {
        image = image.grayscale();
    }

    if (transformations.filters?.sepia) {
        image = image.sepia();
    }

    if (transformations.filters?.blur) {
        image = image.blur(transformations.filters.blur);
    }

    // 6️⃣ Format
    if (transformations.format) {
        image = image.toFormat(transformations.format);
    }

    // 7️⃣ Final output
    const outputBuffer = await image.toBuffer();

    return {
        transformedBuffer: outputBuffer,
        mimetype: `image/${transformations.format}`,
    };
};
