import { Request, Response, NextFunction } from 'express';
import { check, validationResult } from 'express-validator';
import { CursoEstudiante } from '../models/CursoEstudianteModel';
import { AppDataSource } from '../db/conexion';
import { Curso } from '../models/CursoModel';
import { Estudiante } from '../models/EstudianteModel';

export const validar = () => [
    check('curso_id')
        .notEmpty().withMessage('El ID del curso es obligatorio')
        .isNumeric().withMessage('El ID del curso debe ser numérico'),
    check('estudiante_id')
        .notEmpty().withMessage('El ID del estudiante es obligatorio')
        .isNumeric().withMessage('El ID del estudiante debe ser numérico'),
    check('nota')
        .optional()
        .isNumeric().withMessage('La nota debe ser numérica'),
    async (req: Request, res: Response, next: NextFunction) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            // Obtener estudiantes y cursos para volver a renderizar el formulario
            try {
                const estudianteRepository = AppDataSource.getRepository(Estudiante);
                const cursoRepository = AppDataSource.getRepository(Curso);

                const [estudiantes, cursos] = await Promise.all([
                    estudianteRepository.find(),
                    cursoRepository.find()
                ]);

                return res.status(400).render('inscribirEstudiante', {
                    pagina: 'Inscribir Estudiante en Curso',
                    errores: errores.array(),
                    estudiantes,
                    cursos
                });
            } catch (error) {
                console.error('Error al obtener estudiantes y cursos:', error);
                return res.status(500).send('Error del servidor');
            }
        }
        next();
    }
];

export const inscribirEstudiante = async (req: Request, res: Response) => {
    console.log('Datos recibidos de inscribirEstudiante:', req.body);
    const { curso_id, estudiante_id, nota } = req.body;

    try {
        const cursoRepository = AppDataSource.getRepository(Curso);
        const estudianteRepository = AppDataSource.getRepository(Estudiante);
        const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);

        const curso = await cursoRepository.findOne({ where: { id: Number(curso_id) } });
        if (!curso) {
            throw new Error('Curso no encontrado');
        }

        const estudiante = await estudianteRepository.findOne({ where: { id: Number(estudiante_id) } });
        if (!estudiante) {
            throw new Error('Estudiante no encontrado');
        }

        // Verificar si la inscripción ya existe
        const inscripcionExistente = await cursoEstudianteRepository.findOne({ where: { curso_id: Number(curso_id), estudiante_id: Number(estudiante_id) } });
        if (inscripcionExistente) {
            throw new Error('El estudiante ya está inscrito en el curso');
        }

        const nuevaInscripcion = cursoEstudianteRepository.create({
            curso_id: Number(curso_id),
            estudiante_id: Number(estudiante_id),
            nota: nota || 0
        });

        await cursoEstudianteRepository.save(nuevaInscripcion);

        // Redirigir a la lista de inscripciones
        res.redirect('/cursoEstudiante/listarInscripciones');
    } catch (error) {
        console.error('Error al inscribir estudiante en el curso:', error);

        // Obtener nuevamente los estudiantes y cursos para renderizar el formulario con los datos y el error
        const estudiantes = await AppDataSource.getRepository(Estudiante).find();
        const cursos = await AppDataSource.getRepository(Curso).find();

        res.render('inscribirEstudiante', {
            pagina: 'Inscribir Estudiante en Curso',
            errores: [{ msg: (error as Error).message }],
            estudiantes,
            cursos
        });
    }
};


export const actualizarNota = async (req: Request, res: Response) => {
    const { curso_id, estudiante_id } = req.params;
    const { nota } = req.body;

    if (nota === undefined) {
        return res.status(400).json({ mensaje: 'La nota es obligatoria' });
    }

    try {
        const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);

        const inscripcion = await cursoEstudianteRepository.findOne({ where: { curso_id: Number(curso_id), estudiante_id: Number(estudiante_id) } });
        if (!inscripcion) {
            return res.status(404).json({ mensaje: 'Inscripción no encontrada' });
        }

        inscripcion.nota = nota;
        await cursoEstudianteRepository.save(inscripcion);

        res.json({ mensaje: 'Nota actualizada' });
    } catch (error) {
        console.error('Error al actualizar nota:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
};

export const listarInscripciones = async (req: Request, res: Response) => {
    try {
        const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);
        const inscripciones = await cursoEstudianteRepository.find({
            relations: ['curso', 'estudiante']
        });

        res.render('listarCursoEstudiante', {
            pagina: 'Lista de Inscripciones',
            inscripciones
        });
    } catch (error) {
        console.error('Error al listar inscripciones:', error);
        res.status(500).send('Error del servidor');
    }
};

export const obtenerEstudiantesPorCurso = async (req: Request, res: Response) => {
    const { curso_id } = req.params;

    try {
        const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);

        const estudiantesEnCurso = await cursoEstudianteRepository.find({
            where: { curso_id: Number(curso_id) },
            relations: ['estudiante']
        });

        res.json(estudiantesEnCurso);
    } catch (error) {
        console.error('Error al obtener estudiantes en el curso:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
};

export const obtenerCursosPorEstudiante = async (req: Request, res: Response) => {
    const { estudiante_id } = req.params;

    try {
        const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);

        const cursosDelEstudiante = await cursoEstudianteRepository.find({
            where: { estudiante_id: Number(estudiante_id) },
            relations: ['curso']
        });

        res.json(cursosDelEstudiante);
    } catch (error) {
        console.error('Error al obtener cursos del estudiante:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
};

export const eliminarInscripcion = async (req: Request, res: Response) => {
    const { curso_id, estudiante_id } = req.params;

    try {
        const cursoEstudianteRepository = AppDataSource.getRepository(CursoEstudiante);

        const inscripcion = await cursoEstudianteRepository.findOne({ where: { curso_id: Number(curso_id), estudiante_id: Number(estudiante_id) } });
        if (!inscripcion) {
            return res.status(404).json({ mensaje: 'Inscripción no encontrada' });
        }

        await cursoEstudianteRepository.delete({ curso_id: Number(curso_id), estudiante_id: Number(estudiante_id) });

        res.json({ mensaje: 'Inscripción eliminada' });
    } catch (error) {
        console.error('Error al eliminar inscripción:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
};
