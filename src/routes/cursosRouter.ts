import express from 'express';
import { insertar, modificar, eliminar, validar, consultarUno, consultarTodos } from '../controllers/cursoController';
import { Profesor } from '../models/ProfesorModel';
import { AppDataSource } from '../db/conexion';

const router = express.Router();

router.get('/listarCursos', consultarTodos);

// Insertar
router.get('/crearCursos', (req, res) => {
    res.render('crearCursos', {
        pagina: 'Crear Curso',
    });
});
router.post('/', validar(), insertar);

router.get('/modificarCurso/:id', async (req, res) => {
    try {
        const curso = await consultarUno(req, res); 
        if (!curso) {
            return res.status(404).send('Curso no encontrado');
        }
        const profesorRepository = AppDataSource.getRepository(Profesor);
        const profesores = await profesorRepository.find();

        res.render('modificarCurso', {
            pagina: 'Modificar Curso',
            curso,
            profesores
        });
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});

router.put('/:id', modificar); 

// Eliminar
router.delete('/:id', eliminar);

export default router;
