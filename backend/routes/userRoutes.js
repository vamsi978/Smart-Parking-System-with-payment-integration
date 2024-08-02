import express from 'express';
import {
  getExhibitForUser,
  getRelatedExhibits,
  generatePreSignedUrl
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/exhibit/:id').get(getExhibitForUser);
router.get('/related-exhibits/:id', getRelatedExhibits);
router.post("/generate-presigned-url",generatePreSignedUrl);
export default router;