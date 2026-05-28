import { Router } from 'express';
import authMiddleware from '../middlewares/AuthMiddleware.js';
import ProductController from '../controllers/ProductController.js';
import CategoryController from '../controllers/CategoryController.js';
import UserController from '../controllers/UserController.js';
import PeopleController from '../controllers/PeopleController.js';
import OrderController from '../controllers/OrderController.js';
import AddressController from '../controllers/AddressController.js';
import TypeOfPaymentController from '../controllers/TypeOfPaymentController.js';
import multer from 'multer';

const privateRoutes = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

privateRoutes.use(authMiddleware);

// --- PRODUTO ---
privateRoutes.get('/produto/listar', ProductController.findAllProduct);
privateRoutes.post('/produto/salvar', upload.single('image'), ProductController.createProduct);
privateRoutes.put(
  '/produto/atualizar/:id_product',
  upload.single('image'),
  ProductController.updateProduct
);
privateRoutes.delete('/produto/excluir/:id_product', ProductController.deleteProduct);

// --- CATEGORIA  ---
privateRoutes.get('/categoria/listar', CategoryController.findAllCategory);
privateRoutes.post('/categoria/salvar', CategoryController.createCategory);
privateRoutes.put('/categoria/atualizar/:idCategory', CategoryController.updateCategory);
privateRoutes.delete('/categoria/excluir/:id_category', CategoryController.deleteCategory);

// --- USUÁRIO E PESSOA ---
privateRoutes.get('/usuario/listar', UserController.findAllUsers);
privateRoutes.get('/usuario/listarPorId/:id_user', UserController.findByIdUser);
privateRoutes.put('/usuario/atualizar/:id_user', UserController.updateUser);
privateRoutes.get('/pessoa/listar', PeopleController.findAllPeople);
privateRoutes.put('/pessoa/atualizar/:id_people', PeopleController.updatePeople);
privateRoutes.put('/endereco/atualizar/:id_address', AddressController.updateAddress);

// --- PEDIDOS  ---
privateRoutes.post('/pedido/checkout', OrderController.store);
privateRoutes.get('/pedido/listar', OrderController.findAllOrders);
privateRoutes.get('/pedido/usuario/:id_people', OrderController.findByUserId);

// --- TIPOS DE PAGAMENTO ---
privateRoutes.post('/pagamento/salvar', TypeOfPaymentController.createTypeOfPayment);
privateRoutes.put('/pagamento/atualizar/:id_payment', TypeOfPaymentController.updateTypeOfPayment);
privateRoutes.delete('/pagamento/excluir/:id_payment', TypeOfPaymentController.deleteTypeOfPayment);
privateRoutes.get('/pagamento/listar', TypeOfPaymentController.findAllTypeOfPayment);
privateRoutes.get(
  '/pagamento/listarPorId/:id_payment',
  TypeOfPaymentController.findByIdTypeOfPayment
);

export default privateRoutes;
