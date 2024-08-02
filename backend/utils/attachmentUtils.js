import asyncHandler from '../middleware/asyncHandler.js';
import {iventoryDBConnection as db} from '../config/db.js'
import AWS from 'aws-sdk';
import { 
  getPresignedUrl, 
  deleteObjectFromS3
} from '../utils/uploadFile.js'; // Import utility function
import s3 from '../config/s3_config.js'
import dotenv from 'dotenv';
dotenv.config();

// from db
const getAttachmentsUtils = async(exhibit_id) => {
    try {
        const query = "SELECT * FROM attachments WHERE exhibit_id=?";
        const [results, fields] = await db.promise().query(query, [exhibit_id]);
        //console.log(results);
        if (results && results.length > 0) {
          return {data : results, message:"Successfully fetched"}
        } else {
          return  {"message" : "Exhibit doesn't exist"} ;
        }
      } catch (err) {
        return { message: err.message };
      }
}

const deleteAttachmentsUtils = async(fileName, folderName) => {
  try {
    const query = "DELETE FROM attachments WHERE file_name=? AND file_location=?";
    const [results, fields] = await db.promise().query(query, [fileName, folderName]);

    if (results && results.affectedRows > 0) {
      return ({ message : "Successfully deleted", folderName, fileName });
    } else {
      return ({ message: "Resource doesn;t exist" });
    }
  } catch (err) {
    return ({ message: err.message });
  }
}

const deleteMultipleAttachmentsUtils = async (filesToBeDeleted) => {
  try {
    const deletedAttachments = [];

    for (const fileData of filesToBeDeleted) {
      const fileName = fileData.fileName;
      const folderName = fileData.folderName;

      const query = "DELETE FROM attachments WHERE file_name=? AND file_location=?";
      const [results, fields] = await db.promise().query(query, [fileName, folderName]);

      if (results && results.affectedRows > 0) {
        deletedAttachments.push({ message: "Successfully deleted", folderName, fileName });
      } else {
        deletedAttachments.push({ message: "Resource doesn't exist", folderName, fileName });
      }
    }

    return deletedAttachments;
  } catch (err) {
    return { message: err.message };
  }
};

const insertIntoAttachmentsUtils = async() =>{

}

// from s3
const getPresignedUrlsUtils = async(objectKeys) => {
  try {
      const bucketName = process.env.S3_BUCKET; 
      if (!Array.isArray(objectKeys)) {
        return res.status(400).json({ error: 'Invalid input. objectKeys should be an array.' });
      }
  
      const urls = await Promise.all(objectKeys.map(async (objectKey) => {
        const { folderName, fileName } = objectKey
        const path = `${folderName}/${fileName}`;
        try {
          
          //console.log(path);
          const url = await getPresignedUrl(s3, bucketName, path);
          // console.log(url,'hii')
          return { folderName, fileName, url };
        } catch (error) {
          console.error(`Error generating presigned URL for ${path}`, error.message);
          return { folderName, fileName, error: error.message };
        }
      }));
  
      return ( urls );
    } catch (error) {
      console.error(error);
      return { error: error.message };
    }
};


const addRelatedExhibitsUtils = async (exhibitId, relatedExhibitsInfo) => {
  const insertedRelationshipIds = [];
 
  try {
    if (!Array.isArray(relatedExhibitsInfo)) {
      return { error: 'Invalid input. relatedExhibitsInfo should be an array.' };
    }

    for (const relatedExhibitInfo of relatedExhibitsInfo) {
      const { related_exhibit_id, related_exhibit_title } = relatedExhibitInfo;

      // Check if the relationship already exists
      const checkExistenceQuery =
        'SELECT * FROM related_exhibits WHERE exhibit_id = ? AND related_exhibit_id = ?';

      const [existenceResults, existenceFields] = await db.promise().query(checkExistenceQuery, [
        exhibitId,
        related_exhibit_id,
      ]);

      if (existenceResults && existenceResults.length === 0) {
        // Insert a new relationship if it doesn't already exist
        const insertRelationshipQuery =
        'INSERT INTO related_exhibits (exhibit_id, related_exhibit_id, related_exhibit_title) VALUES (?, ?, ?)';

        const [insertResult] = await db.promise().query(insertRelationshipQuery, [
          exhibitId,
         related_exhibit_id, 
         related_exhibit_title
        ]);

        insertedRelationshipIds.push(insertResult.insertId);
      }
    }
    // console.log(insertedRelationshipIds);
   return {
      message: 'Related exhibits added successfully',
      insertedIds: insertedRelationshipIds,
    };
  } catch (error) {
    return { message: error.message };
  }
};

const deleteRelatedExhibitsUtils = async (exhibitId, relatedExhibitsInfo) => {
  const deletedRelationshipIds = [];
  try {
    if (!Array.isArray(relatedExhibitsInfo)) {
      return { error: 'Invalid input. relatedExhibitsInfo should be an array' };
    }

    for (const relatedExhibitInfo of relatedExhibitsInfo) {
      const { related_exhibit_id, related_exhibit_title } = relatedExhibitInfo;
      const checkExistenceQuery =
        'SELECT * FROM related_exhibits WHERE exhibit_id = ? AND related_exhibit_id = ?';

      const [existenceResults, existenceFields] = await db.promise().query(checkExistenceQuery, [
        exhibitId,
        related_exhibit_id,
      ]);

      if (existenceResults && existenceResults.length > 0) {
        // Delete the relationship if it exists
        const deleteRelationshipQuery =
        'DELETE FROM related_exhibits WHERE exhibit_id = ? AND related_exhibit_id = ?'


        await db.promise().query(deleteRelationshipQuery, [exhibitId, related_exhibit_id]);

        deletedRelationshipIds.push(related_exhibit_id);
      }
    }

    return{
      message: 'Related exhibits deleted successfully',
      deletedIds: deletedRelationshipIds,
    };
  } catch (error) {
    return{ message: error.message };
  }
};


export {
    getAttachmentsUtils, 
    deleteAttachmentsUtils,
    getPresignedUrlsUtils, 
    addRelatedExhibitsUtils, 
    deleteRelatedExhibitsUtils, 
    deleteMultipleAttachmentsUtils
}