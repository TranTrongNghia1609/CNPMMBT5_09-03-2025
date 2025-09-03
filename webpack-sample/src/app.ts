import express from 'express';
import userRoutes from './routes/user.routes';
import path from 'path';
import cors from 'cors';
import connectDB from './config/db.config';
const app = express();
const port = process.env.PORT || 3000;
connectDB();
app.use(cors({
    origin: 'http://localhost:5173', // FE chạy ở port này
    credentials: true
}));

app.use(express.json());
app.use('/v1/api', userRoutes);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});