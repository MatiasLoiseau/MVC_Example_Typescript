import express, { Request, Response } from "express";
import cors from 'cors';
import morgan from "morgan";
import path from "path";

import estudianteRouter from './routes/estudianteRouter';
import profesorRouter from './routes/profesorRoutes'; // Importa el router de profesores

import methodOverride from 'method-override';

const app = express();

// Habilitamos Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));

// Carpeta pública
app.use(express.static('public'));

app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    return res.render('layout', {
        pagina: 'App Universidad',
    });
});

// Rutas de estudiantes
app.use('/estudiantes', estudianteRouter);

// Rutas de profesores
app.use('/profesores', profesorRouter); // Añadido el router de profesores

export default app;
