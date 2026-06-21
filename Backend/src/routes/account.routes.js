import { Router } from "express";
import {authMiddleware} from "../middleware/auth.middleware.js"
import * as accountController from "../controllers/account.controller.js"

const accountRouter = Router();


/**
 * - POST api/accounts 
 * - Create a new Account 
 * - Procted Route
 */

accountRouter.post("/",authMiddleware,accountController.createAccountController)
export default accountRouter