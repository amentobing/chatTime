import { Router } from "express";
import { searchUsers } from "../controllers/usrController.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/search/:username", verifyToken, searchUsers);

export default router;
