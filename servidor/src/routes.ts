import express from 'express';
import PontosDeColetaController from './controllers/pontosDeColetaController';
import CategoriasController from './controllers/categoriasController';
import multer from 'multer';
import multerCfg from '../src/config/multer'

const routes = express.Router();
const upload = multer(multerCfg);
const pontosDeColetaController = new PontosDeColetaController();
const categoriasController = new CategoriasController();

routes.get('/categorias', categoriasController.index);

routes.post('/pontos', upload.single('image'), pontosDeColetaController.create);
routes.get('/pontos', pontosDeColetaController.index);
routes.get('/pontos/:id', pontosDeColetaController.show);

export default routes;