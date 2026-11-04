import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './componentes/Header/Header';
import Home from './pages/Home/Home';
import { MenuByCategory } from './pages/Menu/MenuByCategory';
import { Footer } from './componentes/Footer/Footer';
import MyData from './pages/MyData/MyData';
import { MyOrders } from './pages/MyOrders/MyOrders';
import { CartModal } from './componentes/Cart/CartModal';
import Checkout from './pages/Checkout/Checkout';
import { AdminLayout } from './pages/Admin/AdminLayout';
import { Categorias } from './pages/Admin/Categories/CategoriesList';
import { CategoriesForm } from './pages/Admin/Categories/CategoriesForm';
import Dashboard from './pages/Admin/Dashboard/Dashboard';
import ProductList from './pages/Admin/Products/ProductsList';
import { TypeOfPaymentForm } from './pages/Admin/Payment/TypeOfPaymentForm';
import { TypeOfPaymentList } from './pages/Admin/Payment/TypeOfPaymentList';
import TypeOfDeliveryList from './pages/Admin/Delivery/TypeOfDeliveryList';
import TypeOfDeliveryForm from './pages/Admin/Delivery/TypeOfDeliveryForm';
import AdminUsers from './pages/Admin/Users/AdminUsers';
import AccessManagement from './pages/Admin/Access/AccessManagement';
import ProductsForm from './pages/Admin/Products/ProductsForm';
import { AuthProvider, useAuth } from './hooks/AuthContext';
import { getUserRole } from './hooks/userRole';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import EmployeeOrders from './pages/Admin/EmployeeOrders';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user ? children : <Navigate to="/" />;
};

const RoleRoute = ({ role, children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user && getUserRole(user) === role ? children : <Navigate to="/" replace />;
};

const AdminIndex = () => {
  const { user } = useAuth();
  const role = getUserRole(user);

  if (role === 'employee') return <Navigate to="/admin/pedidos" replace />;
  return role === 'manager' ? <Dashboard /> : <Navigate to="/" replace />;
};

function AppContent() {
  return (
    <Routes>
      {/* --- ROTAS PÚBLICAS --- */}
      <Route
        path="/"
        element={
          <>
            <Header />
            <CartModal />
            <Home />
            <Footer />
          </>
        }
      />
      <Route
        path="/cardapio/:categoryName"
        element={
          <>
            <Header />
            <CartModal />
            <MenuByCategory />
            <Footer />
          </>
        }
      />
      <Route
        path="/produto/:id"
        element={
          <>
            <Header />
            <CartModal />
            <ProductDetails />
            <Footer />
          </>
        }
      />
      <Route
        path="/perfil/cadastrar"
        element={
          <>
            <Header />
            <MyData />
            <Footer />
          </>
        }
      />

      {/* --- ROTAS PROTEGIDAS --- */}
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <Header />
            <MyData />
            <Footer />
          </PrivateRoute>
        }
      />
      <Route
        path="/pedidos"
        element={
          <PrivateRoute>
            <Header />
            <MyOrders />
            <Footer />
          </PrivateRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <PrivateRoute>
            <Header />
            <Checkout />
            <Footer />
          </PrivateRoute>
        }
      />

      {/* ADMIN PROTEGIDO */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<AdminIndex />} />
        <Route
          path="categorias"
          element={<RoleRoute role="manager"><Categorias /></RoleRoute>}
        />
        <Route
          path="categorias/form"
          element={<RoleRoute role="manager"><CategoriesForm /></RoleRoute>}
        />
        <Route
          path="produtos"
          element={<RoleRoute role="manager"><ProductList /></RoleRoute>}
        />
        <Route
          path="produtos/form"
          element={<RoleRoute role="manager"><ProductsForm /></RoleRoute>}
        />
        <Route
          path="produtos/form/:id_product"
          element={<RoleRoute role="manager"><ProductsForm /></RoleRoute>}
        />
        <Route
          path="tipos-pagamento"
          element={<RoleRoute role="manager"><TypeOfPaymentList /></RoleRoute>}
        />
        <Route
          path="tipos-pagamento/form"
          element={<RoleRoute role="manager"><TypeOfPaymentForm /></RoleRoute>}
        />
        <Route
          path="tipos-pagamento/form/:id"
          element={<RoleRoute role="manager"><TypeOfPaymentForm /></RoleRoute>}
        />
        <Route
          path="tipos-entrega"
          element={<RoleRoute role="manager"><TypeOfDeliveryList /></RoleRoute>}
        />
        <Route
          path="tipos-entrega/form"
          element={<RoleRoute role="manager"><TypeOfDeliveryForm /></RoleRoute>}
        />
        <Route
          path="usuarios"
          element={<RoleRoute role="manager"><AdminUsers /></RoleRoute>}
        />
        <Route
          path="permissoes"
          element={<RoleRoute role="manager"><AccessManagement /></RoleRoute>}
        />
        <Route
          path="pedidos"
          element={<RoleRoute role="employee"><EmployeeOrders /></RoleRoute>}
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
