import express from 'express'
import authRouter from './routes/auth.routes.js'
import cookieparser from 'cookie-parser'

const app = express();

app.use(express.json())
app.use(cookieparser())

app.use('/api/auth',authRouter);

export default app;
