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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cursoEstudianteController_1 = require("../controllers/cursoEstudianteController");
const EstudianteModel_1 = require("../models/EstudianteModel");
const CursoModel_1 = require("../models/CursoModel");
const conexion_1 = require("../db/conexion");
const router = express_1.default.Router();
// Listar estudiantes por curso
router.get('/listarEstudiantesPorCurso/:curso_id', cursoEstudianteController_1.obtenerEstudiantesPorCurso);
// Listar cursos por estudiante
router.get('/listarCursosPorEstudiante/:estudiante_id', cursoEstudianteController_1.obtenerCursosPorEstudiante);
router.get('/listarInscripciones', cursoEstudianteController_1.listarInscripciones);
// Renderizar formulario para inscribir estudiante en curso
router.get('/inscribirEstudiante', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const estudianteRepository = conexion_1.AppDataSource.getRepository(EstudianteModel_1.Estudiante);
        const cursoRepository = conexion_1.AppDataSource.getRepository(CursoModel_1.Curso);
        const estudiantes = yield estudianteRepository.find();
        const cursos = yield cursoRepository.find();
        res.render('inscribirEstudiante', {
            pagina: 'Inscribir Estudiante en Curso',
            estudiantes,
            cursos
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
}));
// Procesar inscripción de estudiante en curso
router.post('/inscribirEstudiante', (0, cursoEstudianteController_1.validar)(), cursoEstudianteController_1.inscribirEstudiante);
// Procesar actualización de nota
router.post('/modificarNota/:curso_id/:estudiante_id', (0, cursoEstudianteController_1.validar)(), cursoEstudianteController_1.actualizarNota);
// Procesar inscripción de estudiante en curso
router.post('/inscribirEstudiante', (0, cursoEstudianteController_1.validar)(), cursoEstudianteController_1.inscribirEstudiante);
// Renderizar formulario para actualizar nota
router.get('/modificarNota/:curso_id/:estudiante_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { curso_id, estudiante_id } = req.params;
        const cursoRepository = conexion_1.AppDataSource.getRepository(CursoModel_1.Curso);
        const estudianteRepository = conexion_1.AppDataSource.getRepository(EstudianteModel_1.Estudiante);
        const curso = yield cursoRepository.findOne({ where: { id: Number(curso_id) } });
        const estudiante = yield estudianteRepository.findOne({ where: { id: Number(estudiante_id) } });
        if (!curso || !estudiante) {
            return res.status(404).send('Curso o Estudiante no encontrado');
        }
        res.render('modificarNota', {
            pagina: 'Modificar Nota',
            curso,
            estudiante
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
}));
// Procesar actualización de nota
router.put('/modificarNota/:curso_id/:estudiante_id', (0, cursoEstudianteController_1.validar)(), cursoEstudianteController_1.actualizarNota);
// Eliminar inscripción
router.delete('/eliminarInscripcion/:curso_id/:estudiante_id', cursoEstudianteController_1.eliminarInscripcion);
exports.default = router;
