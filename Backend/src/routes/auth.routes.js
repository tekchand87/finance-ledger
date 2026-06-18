import {Router} from 'express'
import * as authController from '../controllers/auth.controller.js'

const authRouter = Router();

/**
 * - POST api/auth/register
 */
authRouter.post('/register',authController.register)

authRouter.post('/verfiy-Email',authController.emailVerify)

authRouter.post('/login',authController.login)

authRouter.get('/getme',authController.getMe)

authRouter.post('/logout',authController.logout)

authRouter.post('/logoutall',authController.logoutAll)



export default authRouter