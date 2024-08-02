import dotenv from 'dotenv';
dotenv.config();
import AWS from 'aws-sdk';


const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION,
    signatureVersion: 'v4'
});


export default s3;