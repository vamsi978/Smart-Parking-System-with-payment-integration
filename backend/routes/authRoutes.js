import express from 'express';
const router = express.Router();
import {
  authUser,
  registerUser,
  logoutUser,
  sendPasswordLink,
  forgotPassword,
  updatePassword
} from '../controllers/authController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.get("/reset-password/:id/:token", forgotPassword);
router.post('/register', registerUser)
router.post('/login', authUser);
router.post('/logout', logoutUser);
router.post('/sendpasswordlink', sendPasswordLink);
// verify user for forgot password time

// change password

router.post("/:id/:token",updatePassword)


export default router;