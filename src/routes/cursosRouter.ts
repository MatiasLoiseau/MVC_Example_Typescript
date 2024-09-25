import express from 'express';
import { insertar, modificar, eliminar, validar, consultarUno, consultarTodos } from '../controllers/cursoController';

const router = express.Router();

router.get('/listarCursos', consultarTodos);

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
        res.render('modificarCurso', {
            curso,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});

router.put('/:id', modificar);

router.delete('/:id', eliminar);

export default router;
