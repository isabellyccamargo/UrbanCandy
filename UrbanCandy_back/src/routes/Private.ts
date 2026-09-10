import { Router } from 'express';

import authMiddleware from '../middlewares/AuthMiddleware.js';
import { authorizePermission } from '../middlewares/AuthorizationMiddleware.js';

import ProductController from '../controllers/ProductController.js';
import CategoryController from '../controllers/CategoryController.js';
import UserController from '../controllers/UserController.js';
import PeopleController from '../controllers/PeopleController.js';
import OrderController from '../controllers/OrderController.js';
import AddressController from '../controllers/AddressController.js';
import TypeOfPaymentController from '../controllers/TypeOfPaymentController.js';
import TypeOfDeliveryController from '../controllers/TypeOfDeliveryController.js';
import { upload } from '../config/MulterConfig.js';

const privateRoutes = Router();

privateRoutes.use(authMiddleware);

// --- PRODUTO ---

privateRoutes.post(
  '/produto/salvar',
  authorizePermission('cadastrar_produto'),
  upload.single('image'),
  ProductController.createProduct
);

privateRoutes.put(
  '/produto/atualizar/:id_product',
  authorizePermission('editar_produto'),
  upload.single('image'),
  ProductController.updateProduct
);

privateRoutes.delete(
  '/produto/excluir/:id_product',
  authorizePermission('excluir_produto'),
  ProductController.deleteProduct
);

// --- CATEGORIA ---

privateRoutes.post(
  '/categoria/salvar',
  authorizePermission('criar_categoria'),
  CategoryController.createCategory
);

privateRoutes.put(
  '/categoria/atualizar/:idCategory',
  authorizePermission('editar_categoria'),
  CategoryController.updateCategory
);

privateRoutes.delete(
  '/categoria/excluir/:id_category',
  authorizePermission('excluir_categoria'),
  CategoryController.deleteCategory
);

// --- USUÁRIO E PESSOA ---

privateRoutes.get('/usuario/listar', UserController.findAllUsers);

privateRoutes.get('/usuario/listarPorId/:id_user', UserController.findByIdUser);

privateRoutes.put('/usuario/atualizar/:id_user', UserController.updateUser);

privateRoutes.get('/pessoa/listar', PeopleController.findAllPeople);

privateRoutes.put('/pessoa/atualizar/:id_people', PeopleController.updatePeople);

privateRoutes.put('/endereco/atualizar/:id_address', AddressController.updateAddress);

privateRoutes.post('/pedido/checkout', OrderController.store);

privateRoutes.get(
  '/pedido/listar',
  authorizePermission('visualizar_pedidos'),
  OrderController.findAllOrders
);

privateRoutes.patch(
  '/pessoa/upload-foto/:id_people',
  upload.single('image'),
  PeopleController.uploadImage
);

privateRoutes.get(
  '/pedido/usuario/:id_people',
  //authorizePermission('visualizar_pedidos'),
  OrderController.findByUserId
);

privateRoutes.get(
  '/pedido/:id_order/itens',
  authorizePermission('visualizar_pedido'),
  OrderController.findItemsByOrder
);

privateRoutes.get(
  '/pedido/status/listar',
  authorizePermission('visualizar_pedidos'),
  OrderController.findAllStatuses
);

privateRoutes.patch(
  '/pedido/:id_order/status',
  authorizePermission('alterar_status_pedido'),
  OrderController.updateStatus
);

// --- TIPOS DE PAGAMENTO ---

privateRoutes.post(
  '/pagamento/salvar',
  authorizePermission('criar_tipo_pagamento'),
  TypeOfPaymentController.createTypeOfPayment
);

privateRoutes.put(
  '/pagamento/atualizar/:id_payment',
  authorizePermission('editar_tipo_pagamento'),
  TypeOfPaymentController.updateTypeOfPayment
);

privateRoutes.delete(
  '/pagamento/excluir/:id_payment',
  authorizePermission('excluir_tipo_pagamento'),
  TypeOfPaymentController.deleteTypeOfPayment
);

privateRoutes.get('/pagamento/listar', TypeOfPaymentController.findAllTypeOfPayment);

// --- TIPOS DE DELIVERY ---

privateRoutes.post(
  '/entrega/salvar',
  authorizePermission('criar_tipo_delivery'),
  TypeOfDeliveryController.create
);

privateRoutes.put(
  '/entrega/atualizar/:id_delivery',
  authorizePermission('editar_tipo_delivery'),
  TypeOfDeliveryController.update
);

privateRoutes.delete(
  '/entrega/excluir/:id_delivery',
  authorizePermission('excluir_tipo_delivery'),
  TypeOfDeliveryController.delete
);

privateRoutes.get(
  '/entrega/listarPorId/:id_delivery',
  authorizePermission('listar_tipos_delivery'),
  TypeOfDeliveryController.findById
);

privateRoutes.stack.forEach((layer) => {
  if (layer.route) {
    const routePath = layer.route.path;
    const handlers = layer.route.stack;
    handlers.forEach((h: any, index: number) => {
      if (!h.handle) {
        console.error(`[ERRO DE ROTA] Handler indefinido na rota: ${routePath} (índice ${index})`);
      }
    });
  }
});

export default privateRoutes;
