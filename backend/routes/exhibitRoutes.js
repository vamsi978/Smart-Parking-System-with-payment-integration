import express from "express";
import { upload, getPresignedUrl } from "../utils/uploadFile.js";
import { iventoryDBConnection as db } from "../config/db.js";
import {
  getExhibitById,
  getDeletedExhibits,
  getExhibits,
  createExhibit,
  deleteExhibits,
  undoDeleteExhibits,
  updateExhibit,
  uploadFilestoS3,
  generatePreSignedUrl,
  addRelatedExhibits,
  previewImage,
  rollbackAttachment,
  getAttachments,
  getNextAssetNumber,
  getCategoriesAndLocationTypes,
  getRelatedExhibits,
  modifiedRelatedExhibits,
  exportDataAsCSV
} from "../controllers/exhibitController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { deleteObjectsFromS3 } from "../utils/uploadFile.js";
import { 
  deleteAttachmentsUtils,
  deleteMultipleAttachmentsUtils
} from '../utils/attachmentUtils.js';

import {getMaintenanceList,
  createCategory,
  updateCategory,
  deleteCategory,
  undoDeleteCategory,
  createLocation,
  updateLocation,
  deleteLocation,
  createLocationType,
  updateLocationType,
  deleteLocationType,
  createRoom,
  updateRoom,
   deleteRoom} from "../controllers/maintenanceController.js";

const router = express.Router();
router.get("/export", exportDataAsCSV);
router.get("/next-asset-number", getNextAssetNumber);
router.get("/categories-and-location-types", getCategoriesAndLocationTypes);
router.get("/maintenance", getMaintenanceList);
router.post("/maintenance/category", createCategory);
router.put("/maintenance/category", updateCategory);
router.delete("/maintenance/category", protect, deleteCategory);
router.post("/maintenance/location", createLocation);
router.put("/maintenance/location", updateLocation);
router.delete("/maintenance/location", protect, deleteLocation);
router.post("/maintenance/location_type", createLocationType);
router.put("/maintenance/location_type", updateLocationType);
router.delete("/maintenance/location_type", protect, deleteLocationType);
router.post("/maintenance/room", createRoom);
router.put("/maintenance/room", updateRoom);
router.delete("/maintenance/room", protect, deleteRoom);
router.post("/generate-presigned-url", protect, generatePreSignedUrl);

router.post(
  "/add-modified-files/:exhibit_id",
  upload.array("newFiles", 25),
  async function (req, res, next) {
    const { exhibit_id } = req.params;
    const filesToBeDeleted = JSON.parse(req.body.filesToBeDeleted);
    console.log("DELETED FILES");
    console.log(filesToBeDeleted);
  
    const deletedFilesResponse = await deleteObjectsFromS3(filesToBeDeleted);
    const deleteAttachmentsResponse = await deleteMultipleAttachmentsUtils(filesToBeDeleted)
    for (const file of req.files) {
      const name = file.key;
      const folderName = `exhibit_${exhibit_id}`;
      const fileName = name.split("/")[1];

      try {
        const query =
          "INSERT INTO attachments (exhibit_id, file_name, file_location) VALUES (?, ?, ?)";
        const [results, fields] = await db
          .promise()
          .query(query, [exhibit_id, fileName, folderName]);

        if (results && results.affectedRows > 0) {
        } else {
          // if adding an attachment fails -> throw an error
          return res
            .status(401)
            .json({ message: "Failed to create exhibit attachment" });
        }
      } catch (err) {
        return res.status(500).json({ message: err.message });
      }
    }

    //  combined response
    res.status(201).json({
      insertedFilesResponse: "All exhibit attachments created successfully",
      deletedFilesResponse: deletedFilesResponse,
    });
  }
);
router.post('/add-modified-exhibits/:id', modifiedRelatedExhibits);
router.put("/undo-delete", protect, undoDeleteExhibits);
router.put("/:id", protect, updateExhibit);
router.get("/", protect, getExhibits);
router.get("/bin", protect, getDeletedExhibits);
router.post("/", protect, createExhibit);
router.get("/:id", protect, getExhibitById); // when ure redirected to edit product screen
router.delete("/", protect, deleteExhibits);


//upload images to s3
router.post(
  "/upload/:exhibit_id",
  protect,
  upload.array("photos", 25),
  async function (req, res, next) {
    const { exhibit_id } = req.params;
  
    for (const file of req.files) {
      const name = file.key;
      const folderName = `exhibit_${req.params.exhibit_id}`;
      const fileName = name.split("/")[1];

      try {
        const query =
          "INSERT INTO attachments (exhibit_id, file_name, file_location) VALUES (?, ?, ?)";
        const [results, fields] = await db
          .promise()
          .query(query, [exhibit_id, fileName, folderName]);

        if (results && results.affectedRows > 0) {
          console.log("Exhibit attachment created successfully");
        } else {
          return res
            .status(401)
            .json({ message: "Failed to create exhibit attachment" });
        }
      } catch (err) {
        return res.status(500).json({ message: err.message });
      }
    }

    res
      .status(201)
      .json({ message: "All exhibit attachments created successfully" });
  }
);
router.get('/related-exhibits/:id', getRelatedExhibits)
router.post("/add-related-exhibits/:id", addRelatedExhibits);
router.get("/preview-image/:id", previewImage);
router.post("/rollback-attachment", rollbackAttachment);
router.get("/get-attachments/:exhibit_id", getAttachments);

export default router;