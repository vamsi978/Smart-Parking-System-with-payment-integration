import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser';
import {notFound, errorHandler} from './middleware/errorMiddleware.js'
import cookieParser from 'cookie-parser';
import multer from 'multer'; 
import path from 'path';
//Routes
import authRoutes from './routes/authRoutes.js'
import exhibitRoutes from './routes/exhibitRoutes.js'
import userRoutes from './routes/userRoutes.js'
import cors from 'cors';

var upload = multer()
dotenv.config()
const port = process.env.PORT 
console.log("PORT" + port)
console.log(port);
const app = express();

app.use(cors({ origin : '*'}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/exhibits', exhibitRoutes);
app.use('/api/user', userRoutes);

if (process.env.NODE_ENV === 'production') {
    console.log('prodution');
    const __dirname = path.resolve();
    //app.use('/uploads', express.static('/var/data/uploads'));
    app.use(express.static(path.join(__dirname, '/frontend/build')));
  
    app.get('*', (req, res) =>
      res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
    );
  } else {
    const __dirname = path.resolve();
    //app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
    app.get('/', (req, res) => {
      res.send('API is running....');
    });
  }


app.use(notFound)
app.use(errorHandler)


app.listen(port, () => console.log('running on port'  + port))