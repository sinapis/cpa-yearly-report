import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'CPA Yearly Report API is running.' });
});

app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
