"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarInscripcion = exports.obtenerCursosPorEstudiante = exports.obtenerEstudiantesPorCurso = exports.listarInscripciones = exports.actualizarNota = exports.inscribirEstudiante = exports.validar = void 0;
const express_validator_1 = require("express-validator");
const CursoEstudianteModel_1 = require("../models/CursoEstudianteModel");
const conexion_1 = require("../db/conexion");
const CursoModel_1 = require("../models/CursoModel");
const EstudianteModel_1 = require("../models/EstudianteModel");
const validar = () => [
    (0, express_validator_1.check)('curso_id')
        .notEmpty().withMessage('El ID del curso es obligatorio')
        .isNumeric().withMessage('El ID del curso debe ser numérico'),
    (0, express_validator_1.check)('estudiante_id')
        .notEmpty().withMessage('El ID del estudiante es obligatorio')
        .isNumeric().withMessage('El ID del estudiante debe ser numérico'),
    (0, express_validator_1.check)('nota')
        .optional()
        .isNumeric().withMessage('La nota debe ser numérica'),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const errores = (0, express_validator_1.validationResult)(req);
        if (!errores.isEmpty()) {
            // Obtener estudiantes y cursos para volver a renderizar el formulario
            try {
                const estudianteRepository = conexion_1.AppDataSource.getRepository(EstudianteModel_1.Estudiante);
                const cursoRepository = conexion_1.AppDataSource.getRepository(CursoModel_1.Curso);
                const [estudiantes, cursos] = yield Promise.all([
                    estudianteRepository.find(),
                    cursoRepository.find()
                ]);
                return res.status(400).render('inscribirEstudiante', {
                    pagina: 'Inscribir Estudiante en Curso',
                    errores: errores.array(),
                    estudiantes,
                    cursos
                });
            }
            catch (error) {
                console.error('Error al obtener estudiantes y cursos:', error);
                return res.status(500).send('Error del servidor');
            }
        }
        next();
    })
];
exports.validar = validar;
const inscribirEstudiante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Datos recibidos de inscribirEstudiante:', req.body);
    const { curso_id, estudiante_id, nota } = req.body;
    try {
        const cursoRepository = conexion_1.AppDataSource.getRepository(CursoModel_1.Curso);
        const estudianteRepository = conexion_1.AppDataSource.getRepository(EstudianteModel_1.Estudiante);
        const cursoEstudianteRepository = conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante);
        const curso = yield cursoRepository.findOne({ where: { id: Number(curso_id) } });
        if (!curso) {
            throw new Error('Curso no encontrado');
        }
        const estudiante = yield estudianteRepository.findOne({ where: { id: Number(estudiante_id) } });
        if (!estudiante) {
            throw new Error('Estudiante no encontrado');
        }
        // Verificar si la inscripción ya existe
        const inscripcionExistente = yield cursoEstudianteRepository.findOne({ where: { curso_id: Number(curso_id), estudiante_id: Number(estudiante_id) } });
        if (inscripcionExistente) {
            throw new Error('El estudiante ya está inscrito en el curso');
        }
        const nuevaInscripcion = cursoEstudianteRepository.create({
            curso_id: Number(curso_id),
            estudiante_id: Number(estudiante_id),
            nota: nota || 0
        });
        yield cursoEstudianteRepository.save(nuevaInscripcion);
        // Redirigir a la lista de inscripciones
        res.redirect('/cursoEstudiante/listarInscripciones');
    }
    catch (error) {
        console.error('Error al inscribir estudiante en el curso:', error);
        // Obtener nuevamente los estudiantes y cursos para renderizar el formulario con los datos y el error
        const estudiantes = yield conexion_1.AppDataSource.getRepository(EstudianteModel_1.Estudiante).find();
        const cursos = yield conexion_1.AppDataSource.getRepository(CursoModel_1.Curso).find();
        res.render('inscribirEstudiante', {
            pagina: 'Inscribir Estudiante en Curso',
            errores: [{ msg: error.message }],
            estudiantes,
            cursos
        });
    }
});
exports.inscribirEstudiante = inscribirEstudiante;
const actualizarNota = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { curso_id, estudiante_id } = req.params;
    const { nota } = req.body;
    if (nota === undefined) {
        return res.status(400).json({ mensaje: 'La nota es obligatoria' });
    }
    try {
        const cursoEstudianteRepository = conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante);
        const inscripcion = yield cursoEstudianteRepository.findOne({ where: { curso_id: Number(curso_id), estudiante_id: Number(estudiante_id) } });
        if (!inscripcion) {
            return res.status(404).json({ mensaje: 'Inscripción no encontrada' });
        }
        inscripcion.nota = nota;
        yield cursoEstudianteRepository.save(inscripcion);
        res.json({ mensaje: 'Nota actualizada' });
    }
    catch (error) {
        console.error('Error al actualizar nota:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
});
exports.actualizarNota = actualizarNota;
const listarInscripciones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cursoEstudianteRepository = conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante);
        const inscripciones = yield cursoEstudianteRepository.find({
            relations: ['curso', 'estudiante']
        });
        res.render('listarCursoEstudiante', {
            pagina: 'Lista de Inscripciones',
            inscripciones
        });
    }
    catch (error) {
        console.error('Error al listar inscripciones:', error);
        res.status(500).send('Error del servidor');
    }
});
exports.listarInscripciones = listarInscripciones;
const obtenerEstudiantesPorCurso = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { curso_id } = req.params;
    try {
        const cursoEstudianteRepository = conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante);
        const estudiantesEnCurso = yield cursoEstudianteRepository.find({
            where: { curso_id: Number(curso_id) },
            relations: ['estudiante']
        });
        res.json(estudiantesEnCurso);
    }
    catch (error) {
        console.error('Error al obtener estudiantes en el curso:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
});
exports.obtenerEstudiantesPorCurso = obtenerEstudiantesPorCurso;
const obtenerCursosPorEstudiante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { estudiante_id } = req.params;
    try {
        const cursoEstudianteRepository = conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante);
        const cursosDelEstudiante = yield cursoEstudianteRepository.find({
            where: { estudiante_id: Number(estudiante_id) },
            relations: ['curso']
        });
        res.json(cursosDelEstudiante);
    }
    catch (error) {
        console.error('Error al obtener cursos del estudiante:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
});
exports.obtenerCursosPorEstudiante = obtenerCursosPorEstudiante;
const eliminarInscripcion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { curso_id, estudiante_id } = req.params;
    try {
        const cursoEstudianteRepository = conexion_1.AppDataSource.getRepository(CursoEstudianteModel_1.CursoEstudiante);
        const inscripcion = yield cursoEstudianteRepository.findOne({ where: { curso_id: Number(curso_id), estudiante_id: Number(estudiante_id) } });
        if (!inscripcion) {
            return res.status(404).json({ mensaje: 'Inscripción no encontrada' });
        }
        yield cursoEstudianteRepository.delete({ curso_id: Number(curso_id), estudiante_id: Number(estudiante_id) });
        res.json({ mensaje: 'Inscripción eliminada' });
    }
    catch (error) {
        console.error('Error al eliminar inscripción:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
});
exports.eliminarInscripcion = eliminarInscripcion;
