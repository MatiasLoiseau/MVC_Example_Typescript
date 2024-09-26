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
const express_validator_1 = require("express-validator");
const CursoModel_1 = require("../models/CursoModel");
const conexion_1 = require("../db/conexion");
const ProfesorModel_1 = require("../models/ProfesorModel");
const validar = () => [
    (0, express_validator_1.check)('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
    (0, express_validator_1.check)('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),
    (0, express_validator_1.check)('profesor_id')
        .notEmpty().withMessage('El ID del profesor es obligatorio')
        .isNumeric().withMessage('El ID del profesor debe ser numérico'),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const errores = (0, express_validator_1.validationResult)(req);
        if (!errores.isEmpty()) {
            try {
                const profesorRepository = conexion_1.AppDataSource.getRepository(ProfesorModel_1.Profesor);
                const profesores = yield profesorRepository.find();
                return res.render('crearCursos', {
                    pagina: 'Crear Curso',
                    errores: errores.array(),
                    profesores,
                    curso: req.body // Para mantener los datos ingresados
                });
            }
            catch (err) {
                if (err instanceof Error) {
                    res.status(500).send(err.message);
                }
            }
        }
        else {
            next();
        }
    })
];
exports.validar = validar;
const consultarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cursoRepository = conexion_1.AppDataSource.getRepository(CursoModel_1.Curso);
        const cursos = yield cursoRepository.find({ relations: ['profesor', 'estudiantes'] });
        res.render('listarCursos', {
            pagina: 'Lista de Cursos',
            cursos
        });
    }
    catch (err) {
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
        throw new Error('ID inválido, debe ser un número');
    }
    try {
        const cursoRepository = conexion_1.AppDataSource.getRepository(CursoModel_1.Curso);
        const curso = yield cursoRepository.findOne({ where: { id: idNumber }, relations: ['profesor', 'estudiantes'] });
        if (curso) {
            return curso;
        }
        else {
            return null;
        }
    }
    catch (err) {
        if (err instanceof Error) {
            throw err;
        }
        else {
            throw new Error('Error desconocido');
        }
    }
});
exports.consultarUno = consultarUno;
const insertar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errores = (0, express_validator_1.validationResult)(req);
    if (!errores.isEmpty()) {
        try {
            const profesorRepository = conexion_1.AppDataSource.getRepository(ProfesorModel_1.Profesor);
            const profesores = yield profesorRepository.find();
            return res.render('crearCursos', {
                pagina: 'Crear Curso',
                errores: errores.array(),
                profesores,
                curso: req.body // Para mantener los datos ingresados
            });
        }
        catch (err) {
            if (err instanceof Error) {
                res.status(500).send(err.message);
            }
        }
    }
    const { nombre, descripcion, profesor_id } = req.body;
    try {
        // Tu código existente para insertar el curso
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const cursoRepository = transactionalEntityManager.getRepository(CursoModel_1.Curso);
            const profesorRepository = transactionalEntityManager.getRepository(ProfesorModel_1.Profesor);
            const profesor = yield profesorRepository.findOne({ where: { id: Number(profesor_id) } });
            if (!profesor) {
                throw new Error('El profesor no existe.');
            }
            const nuevoCurso = cursoRepository.create({ nombre, descripcion, profesor });
            yield cursoRepository.save(nuevoCurso);
        }));
        res.redirect('/cursos/listarCursos');
    }
    catch (err) {
        if (err instanceof Error) {
            console.error('Error al insertar el curso:', err);
            // En caso de error, renderizamos la vista con el mensaje de error
            const profesorRepository = conexion_1.AppDataSource.getRepository(ProfesorModel_1.Profesor);
            const profesores = yield profesorRepository.find();
            res.render('crearCursos', {
                pagina: 'Crear Curso',
                errores: [{ msg: err.message }],
                profesores,
                curso: req.body
            });
        }
    }
});
exports.insertar = insertar;
const modificar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { nombre, descripcion, profesor_id } = req.body;
    try {
        const cursoRepository = conexion_1.AppDataSource.getRepository(CursoModel_1.Curso);
        const profesorRepository = conexion_1.AppDataSource.getRepository(ProfesorModel_1.Profesor);
        const curso = yield cursoRepository.findOne({ where: { id: parseInt(id) } });
        if (!curso) {
            return res.status(404).send('Curso no encontrado');
        }
        const profesor = yield profesorRepository.findOne({ where: { id: Number(profesor_id) } });
        if (!profesor) {
            throw new Error('El profesor no existe.');
        }
        cursoRepository.merge(curso, { nombre, descripcion, profesor });
        yield cursoRepository.save(curso);
        return res.redirect('/cursos/listarCursos');
    }
    catch (error) {
        console.error('Error al modificar el curso:', error);
        return res.status(500).send('Error del servidor');
    }
});
exports.modificar = modificar;
const eliminar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const cursoRepository = transactionalEntityManager.getRepository(CursoModel_1.Curso);
            const curso = yield cursoRepository.findOne({ where: { id: Number(id) }, relations: ['estudiantes'] });
            if (!curso) {
                throw new Error('Curso no encontrado');
            }
            if (curso.estudiantes && curso.estudiantes.length > 0) {
                throw new Error('El curso tiene estudiantes inscritos, no se puede eliminar');
            }
            const deleteResult = yield cursoRepository.delete(id);
            if (deleteResult.affected === 1) {
                return res.json({ mensaje: 'Curso eliminado' });
            }
            else {
                throw new Error('Curso no encontrado');
            }
        }));
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ mensaje: err.message });
        }
        else {
            res.status(400).json({ mensaje: 'Error' });
        }
    }
});
exports.eliminar = eliminar;
