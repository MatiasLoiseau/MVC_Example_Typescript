import express from 'express';
import { insertar, modificar, eliminar, validar, consultarUno, consultarTodos } from '../controllers/profesoresController';

const router = express.Router();

// Listar todos los profesores
router.get('/listarProfesores', consultarTodos);

// Mostrar formulario para crear profesor
router.get('/crearProfesores', (req, res) => {
    res.render('crearProfesores', {
        pagina: 'Crear Profesor',
    });
});

// Insertar un nuevo profesor con validaciones
router.post('/', validar(), insertar);

// Mostrar formulario para modificar profesor
router.get('/modificarProfesor/:id', async (req, res) => {
    try {
        const profesor = await consultarUno(req, res); 
        if (!profesor) {
            return res.status(404).send('Profesor no encontrado');
        }
        res.render('modificarProfesor', {
            profesor, 
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});

// Modificar un profesor
router.put('/:id', modificar);

// Eliminar un profesor
router.delete('/:id', eliminar);

export default router;
