import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
const s3Client = new S3Client();

export async function getFromS3(bucket: string, key: string): Promise<Uint8Array> {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(command);
    if(!response.Body) {
        throw new Error("Found s3 file but it had no body");
    }
    return response.Body.transformToByteArray();
}

export async function putToS3(bucket: string, key: string, body: Uint8Array): Promise<void> {
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, Body: body });
    await s3Client.send(command);
}