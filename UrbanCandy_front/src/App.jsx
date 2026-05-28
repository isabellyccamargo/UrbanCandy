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
import ProductsForm from './pages/Admin/Products/ProductsForm';
import { AuthProvider, useAuth } from './hooks/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user ? children : <Navigate to="/" />;
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
        <Route index element={<Dashboard />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="categorias/form" element={<CategoriesForm />} />
        <Route path="produtos" element={<ProductList />} />
        <Route path="produtos/form" element={<ProductsForm />} />
        <Route path="produtos/form/:id_product" element={<ProductsForm />} />
        <Route path="tipos-pagamento" element={<TypeOfPaymentList />} />
        <Route path="tipos-pagamento/form" element={<TypeOfPaymentForm />} />
        <Route path="tipos-pagamento/form/:id" element={<TypeOfPaymentForm />} />
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
