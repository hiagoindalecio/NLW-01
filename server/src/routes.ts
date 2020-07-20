import express from 'express';
import multer from 'multer'; // Lib de upload de imagem
import multerConfig from './config/multer'; // Config de upload de imagem
import { celebrate, Joi } from 'celebrate'; // Validacao de dados 

import ItemsController from './controllers/ItemsController'
import PointsController from './controllers/PointsController';

const routes = express.Router();
const upload = multer(multerConfig);
const pointsController = new PointsController();
const itemsController = new ItemsController();
routes.use(express.json())
routes.get('/items', itemsController.index);
routes.post('/points',
	upload.single('image'),
	celebrate({
		body: Joi.object().keys({
			name: Joi.string().required(),
			email: Joi.string().required().email(),
			whatsapp: Joi.string().required(),
			latitude: Joi.number().required(),
			longitude: Joi.number().required(),
			city: Joi.string().required(),
			uf: Joi.string().required().max(2),
			items: Joi.string().required()
		})
	}, {
		abortEarly: false
	}),
	pointsController.create); // adicionando imagem como parametro
routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show)

export default routes;