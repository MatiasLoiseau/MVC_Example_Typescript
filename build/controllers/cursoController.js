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
exports.eliminar = exports.modificar = exports.insertar = exports.consultarUno = exports.consultarTodos = exports.validar = void 0;
const { check, validationResult } = require('express-validator');
const { Curso } = require('../models/CursoModel');
const { Profesor } = require('../models/ProfesorModel');
const { CursoEstudiante } = require('../models/CursoEstudianteModel');
const { AppDataSource } = require('../db/conexion');

const validar = () => [
    check('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    check('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),
    check('profesor_id')
        .notEmpty().withMessage('El ID del profesor es obligatorio')
        .isInt().withMessage('El ID del profesor debe ser un número entero'),
    (req, res, next) => {
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
exports.validar = validar;

const consultarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cursoRepository = AppDataSource.getRepository(Curso);
        const cursos = yield cursoRepository.find({ relations: ['profesor', 'estudiantes'] });
        res.render('listarCursos', {
            pagina: 'Lista de Cursos',
            cursos
        });
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.consultarTodos = consultarTodos;

const consultarUno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const idNumber = Number(id);
    if (isNaN(idNumber)) {
        res.status(400).send('ID inválido, debe ser un número');
        return;
    }
    try {
        const cursoRepository = AppDataSource.getRepository(Curso);
        const curso = yield cursoRepository.findOne({ where: { id: idNumber }, relations: ['profesor', 'estudiantes'] });
        if (curso) {
            res.render('detalleCurso', {
                pagina: 'Detalle del Curso',
                curso
            });
        } else {
            res.status(404).send('Curso no encontrado');
        }
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.consultarUno = consultarUno;

const insertar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.render('crearCursos', {
            pagina: 'Crear Curso',
            errores: errores.array()
        });
    }
    const { nombre, descripcion, profesor_id } = req.body;
    try {
        yield AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const cursoRepository = transactionalEntityManager.getRepository(Curso);
            const profesorRepository = transactionalEntityManager.getRepository(Profesor);

            // Verificar si el profesor existe
            const profesor = yield profesorRepository.findOne({ where: { id: Number(profesor_id) } });
            if (!profesor) {
                throw new Error('El profesor especificado no existe.');
            }

            // Verificar si ya existe un curso con el mismo nombre
            const existeCurso = yield cursoRepository.findOne({ where: { nombre } });
            if (existeCurso) {
                throw new Error('El curso ya existe.');
            }

            const nuevoCurso = cursoRepository.create({ nombre, descripcion, profesor });
            yield cursoRepository.save(nuevoCurso);
        }));

        const cursos = yield AppDataSource.getRepository(Curso).find({ relations: ['profesor'] });
        res.render('listarCursos', {
            pagina: 'Lista de Cursos',
            cursos
        });
    } catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.insertar = insertar;

const modificar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { nombre, descripcion, profesor_id } = req.body;
    try {
        const cursoRepository = AppDataSource.getRepository(Curso);
        const profesorRepository = AppDataSource.getRepository(Profesor);

        const curso = yield cursoRepository.findOne({ where: { id: parseInt(id) }, relations: ['profesor'] });
        if (!curso) {
            return res.status(404).send('Curso no encontrado');
        }

        // Verificar si el nuevo profesor existe
        const profesor = yield profesorRepository.findOne({ where: { id: Number(profesor_id) } });
        if (!profesor) {
            throw new Error('El profesor especificado no existe.');
        }

        cursoRepository.merge(curso, { nombre, descripcion, profesor });
        yield cursoRepository.save(curso);
        return res.redirect('/cursos/listarCursos');
    } catch (error) {
        console.error('Error al modificar el curso:', error);
        return res.status(500).send('Error del servidor');
    }
});
exports.modificar = modificar;

const eliminar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const cursoEstudianteRepository = transactionalEntityManager.getRepository(CursoEstudiante);
            const cursoRepository = transactionalEntityManager.getRepository(Curso);

            // Verificar si el curso tiene estudiantes inscritos
            const estudiantesRelacionados = yield cursoEstudianteRepository.count({ where: { curso: { id: Number(id) } } });
            if (estudiantesRelacionados > 0) {
                throw new Error('Curso con estudiantes inscritos, no se puede eliminar');
            }

            const deleteResult = yield cursoRepository.delete(id);
            if (deleteResult.affected === 1) {
                res.json({ mensaje: 'Curso eliminado' });
            } else {
                throw new Error('Curso no encontrado');
            }
        }));
    } catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ mensaje: err.message });
        } else {
            res.status(400).json({ mensaje: 'Error' });
        }
    }
});
exports.eliminar = eliminar;
