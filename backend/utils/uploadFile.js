import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
dotenv.config();
import s3 from '../config/s3_config.js'

//check if object exists
const objectExists = async (bucket, Key) => {
  try {
    await s3.headObject({
      Bucket: bucket,
      Key: Key,
    }).promise(); 
    return true; 
  } catch (err) {
    console.log("HERE");
    console.log(err); // KEY MISSING IN PARAMS
    // throw err; // Rethrow other errors
  }
};

const deleteObjectFromS3 = async (bucket, key) => {
  try {
    const params = {
      Bucket: bucket,
      Key: key,
    };
  
    const response = await s3.deleteObject(params).promise();
    return { message: `Object deleted: ${key}` };
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      return { message: `Object not found: ${key}` };
    } else {
      throw error;
    }
  }
};


const deleteObjectsFromS3 = async (objectKeys) => {
  try {
    console.log(objectKeys);
    if (!Array.isArray(objectKeys)) {
      return { error: 'Invalid input. objectKeys should be an array.' };
    }

    const bucket = process.env.S3_BUCKET;
    const deletedObjects = [];

   
    await Promise.all(objectKeys.map(async (objectKey) => {
      const { folderName, fileName } = objectKey;
      const key = fileName && fileName.length > 0 ? `${folderName}/${fileName}` : folderName;
      //console.log(key);

      try {
        const deleteResponse = await deleteObjectFromS3(bucket, key);
        deletedObjects.push(deleteResponse);
      } catch (error) {
        if (error.code === 'NoSuchKey') { // wont work will show deletion as successful even if key doesnt exist
          console.log(`Object not found: ${key}`);
          deletedObjects.push({ message: `Object not found: ${key}` });
        } else {
          //console.error(`Error deleting object: ${key}`, error.message);
          deletedObjects.push({ error: `Error deleting object: ${key}`, message: error.message });
        }
      }
    }));

    return { message: 'All objects deleted successfully', deletedObjects };
  } catch (error) {
    return { message: error.message };
  }
};

//no direct API to delete a folder 
async function deleteFolder(bucketName, folderName) {
  try {
    const params = {
      Bucket: bucketName,
      Prefix: folderName,
    };

    const objects = await s3.listObjectsV2(params).promise();

    if (objects.Contents.length === 0) {
      console.log('No objects found in the folder.');
      return;
    }

    const deleteParams = {
      Bucket: bucketName,
      Delete: { Objects: [] },
    };

    objects.Contents.forEach((object) => {
      deleteParams.Delete.Objects.push({ Key: object.Key });
    });

    await s3.deleteObjects(deleteParams).promise();
    console.log('Folder deleted.');
  } catch (error) {
    console.error('Error deleting folder:', error);
  }
}

// Add object to s3
let folderName = 'default-folder'
const bucketName = process.env.S3_BUCKET; 

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: (req, file, cb) => {
      folderName = req.params?.exhibit_id? `exhibit_${req.params.exhibit_id}` : 'default-folder';
      //  console.log("FOLDERNAME" + folderName);
      cb(null, bucketName);
    },
    metadata: function (req, file, cb) {
      cb(null, { folderName: folderName, fieldName: file.fieldname });
    },
    key: async function (req, file, cb) {
      try {
        const folderExists = await objectExists(bucketName, folderName)
        if (!folderExists) {
          console.log('folder doesnt exist');

          await s3.putObject({ 
            Bucket: bucketName, 
            Key: `${folderName}/` 
          })
          .promise();
        }

        // Set the key with folder name and file name
        const fileName = `${folderName}_${Date.now().toString()}${getFileTypeExtension(file.mimetype)}`;
        const key = `${folderName}/${fileName}`;
        cb(null, key);
      } catch (err) {
        cb(err.message);
      }
    },
  }),
});

//Helper function to get file type extension
const getFileTypeExtension = (mimeType) => {
  switch (mimeType) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'video/mp4':
      return '.mp4';
    // Add more cases as needed
    default:
      return '';
  }
};

//fetch presignedl url 
const getPresignedUrl = async (s3, bucket, key) => { // key - entire path 
  try {
    const params = {
      Bucket: bucket,
      Key: key,
      Expires: 60*60, // URL expiration time in seconds
    };

    // Check if the key exists
    const folderExists = await objectExists(bucket, key);
    
    if (!folderExists) {
      throw new Error('Folder doesnt exist');
    }

    const url = await s3.getSignedUrlPromise('getObject', params);

    if (!url) { // url will always be generated regardless
      throw new Error('Failed to generate presigned URL');
    }

    return url;
  } catch (error) {
    console.error(error);
    throw error;
  }
};


export{
  upload,
  getPresignedUrl, 
  deleteObjectFromS3, 
  deleteObjectsFromS3
}