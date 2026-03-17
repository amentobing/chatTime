import { Router } from "express";
import { getConversation, getConversations } from "../controllers/csController.js";
import { verifyToken } from "../middleware/auth.js";
const router = Router();
router.post("/get", verifyToken, getConversation);
router.get("/getAll", verifyToken, getConversations);
export default router;
