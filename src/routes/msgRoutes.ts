import { Router } from "express";
import { getMsg } from "../controllers/msgController.js";
import { verifyToken } from "../middleware/auth.js";

const routeMsg = Router();

routeMsg.get("/:conversationId", verifyToken, getMsg);

export default routeMsg;
