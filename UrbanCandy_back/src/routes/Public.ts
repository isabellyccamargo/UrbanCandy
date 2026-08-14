// src/Routes/PublicRoutes.ts
import { Router } from 'express';
import ProductController from '../controllers/ProductController.js';
import CategoryController from '../controllers/CategoryController.js';
import UserController from '../controllers/UserController.js';
import OfferController from '../controllers/OfferController.js';
import TypeOfDeliveryController from '../controllers/TypeOfDeliveryController.js';
import privateRoutes from './Private.js';
const routes = Router();

// --- LOGIN E CADASTRO ---
routes.post('/login', UserController.login);
routes.post('/usuario/salvar', UserController.createUser);

// --- PRODUTO  ---
routes.get('/produto/listar', ProductController.findAllProduct);
routes.get('/produto/destaque', ProductController.findFeaturedProducts);
routes.get('/produto/listarPorId/:id_product', ProductController.findByIdProduct);
routes.get('/produto/categoria/:categoryName', ProductController.findByCategory);
routes.get('/oferta/listar', OfferController.findActiveOffers);
routes.get('/oferta/listarPorId/:id_offer', OfferController.findByIdOffer);
routes.get('/entrega/listar', TypeOfDeliveryController.findAll);

// --- CATEGORIA---
routes.get('/categoria/listar', CategoryController.findAllCategory);
routes.get('/categoria/listarPorId/:id_category', CategoryController.findByIdCategory);

routes.use(privateRoutes);

export default routes;
