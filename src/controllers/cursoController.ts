import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';
import { Curso } from '../models/CursoModel';
import { AppDataSource } from '../db/conexion';
import { Profesor } from '../models/ProfesorModel';
import { Estudiante } from '../models/EstudianteModel';

export const validar = () => [
    check('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    check('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),
    check('profesor_id')
        .notEmpty().withMessage('El ID del profesor es obligatorio')
        .isNumeric().withMessage('El ID del profesor debe ser numérico'),
    (req: Request, res: Response, next: NextFunction) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.render('crearCursos', {
                pagina: 'Crear Curso',
                errores: errores.array()
            });
        }
        next();
    }
];

export const consultarTodos = async (req: Request, res: Response) => {
    try {
        const cursoRepository = AppDataSource.getRepository(Curso);
        const cursos = await cursoRepository.find({ relations: ['profesor', 'estudiantes'] });
        res.render('listarCursos', {
            pagina: 'Lista de Cursos',
            cursos
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};

export const consultarUno = async (req: Request, res: Response): Promise<Curso | null> => {
    const { id } = req.params;
    const idNumber = Number(id);
    if (isNaN(idNumber)) {
        throw new Error('ID inválido, debe ser un número');
    }
    try {
        const cursoRepository = AppDataSource.getRepository(Curso);
        const curso = await cursoRepository.findOne({ where: { id: idNumber }, relations: ['profesor', 'estudiantes'] });

        if (curso) {
            return curso;
        } else {
            return null;
        }
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw err;
        } else {
            throw new Error('Error desconocido');
        }
    }
};

export const insertar = async (req: Request, res: Response): Promise<void> => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.render('crearCursos', {
            pagina: 'Crear Curso',
            errores: errores.array()
        });
    }
    const { nombre, descripcion, profesor_id } = req.body;

    try {
        await AppDataSource.transaction(async (transactionalEntityManager) => {
            const cursoRepository = transactionalEntityManager.getRepository(Curso);
            const profesorRepository = transactionalEntityManager.getRepository(Profesor);

            const profesor = await profesorRepository.findOne({ where: { id: Number(profesor_id) } });

            if (!profesor) {
                throw new Error('El profesor no existe.');
            }

            const nuevoCurso = cursoRepository.create({ nombre, descripcion, profesor });
            await cursoRepository.save(nuevoCurso);
        });

        const cursos = await AppDataSource.getRepository(Curso).find({ relations: ['profesor'] });
        res.render('listarCursos', {
            pagina: 'Lista de Cursos',
            cursos
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
};

export const modificar = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, descripcion, profesor_id } = req.body;
    try {
        const cursoRepository = AppDataSource.getRepository(Curso);
        const profesorRepository = AppDataSource.getRepository(Profesor);

        const curso = await cursoRepository.findOne({ where: { id: parseInt(id) } });
        if (!curso) {
            return res.status(404).send('Curso no encontrado');
        }

        const profesor = await profesorRepository.findOne({ where: { id: Number(profesor_id) } });
        if (!profesor) {
            throw new Error('El profesor no existe.');
        }

        cursoRepository.merge(curso, { nombre, descripcion, profesor });
        await cursoRepository.save(curso);
        return res.redirect('/cursos/listarCursos');
    } catch (error) {
        console.error('Error al modificar el curso:', error);
        return res.status(500).send('Error del servidor');
    }
};

export const eliminar = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await AppDataSource.transaction(async transactionalEntityManager => {
            const cursoRepository = transactionalEntityManager.getRepository(Curso);

            const curso = await cursoRepository.findOne({ where: { id: Number(id) }, relations: ['estudiantes'] });
            if (!curso) {
                throw new Error('Curso no encontrado');
            }

            if (curso.estudiantes && curso.estudiantes.length > 0) {
                throw new Error('El curso tiene estudiantes inscritos, no se puede eliminar');
            }

            const deleteResult = await cursoRepository.delete(id);

            if (deleteResult.affected === 1) {
                return res.json({ mensaje: 'Curso eliminado' });
            } else {
                throw new Error('Curso no encontrado');
            }
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(400).json({ mensaje: err.message });
        } else {
            res.status(400).json({ mensaje: 'Error' });
        }
    }
};
