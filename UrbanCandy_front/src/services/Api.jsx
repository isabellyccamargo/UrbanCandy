import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3030',
});

// Função auxiliar para extrair mensagem de erro
const extractErrorMessage = (errorData) => {
  if (typeof errorData === 'object' && errorData !== null) {
    return errorData.message || errorData.mensagem || 'Erro desconhecido';
  }
  if (typeof errorData === 'string') {
    // Se for HTML, tenta extrair a mensagem de erro
    const match = errorData.match(/<pre[^>]*>([^<]*)<\/pre>/);
    if (match) {
      const errorText = match[1];
      const messageMatch = errorText.match(/Error: (.+?)(?:<br|\n|$)/);
      return messageMatch ? messageMatch[1] : errorText;
    }
    return errorData;
  }
  return 'Erro desconhecido';
};

const token = localStorage.getItem('@UrbanCandy:token');
if (token) {
  api.defaults.headers.Authorization = `Bearer ${token}`;
}

let openLoginModalCallback = null;

export const setOpenLoginModalCallback = (callback) => {
  openLoginModalCallback = callback;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('@UrbanCandy:token');
      localStorage.removeItem('@UrbanCandy:user');

      if (openLoginModalCallback) {
        openLoginModalCallback();
      }
    }
    return Promise.reject(error);
  }
);

export const setHeaderToken = (token) => {
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
};

export const getAllProducts = (page = 1, size = 6) => {
  return api.get(`/produto/listar`, {
    params: { page, size },
  });
};

export const getFeaturedProducts = (page = 1, size = 6) => {
  return api.get(`/produto/listar`, {
    params: { page, size },
  });
};

export const getProductsByCategory = async (categoryName, page = 1, size = 50) => {
  try {
    const response = await api.get(`/produto/categoria/${categoryName}`, {
      params: { page, size },
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar produtos da categoria ${categoryName}:`, error);
    throw error;
  }
};

export const getAllCategory = async (page = 1, size = 100) => {
  try {
    return api.get(`/categoria/listar`, {
      params: { page, size },
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    return response.data;
  } catch (error) {
    const errorData = error.response?.data || {};
    const errorMessage = errorData.mensagem || errorData.message || 'Erro ao conectar ao servidor';

    const customError = new Error(errorMessage);
    customError.response = error.response;
    throw customError;
  }
};

export const getUserProfile = async (id_user) => {
  try {
    const response = await api.get(`/usuario/listarPorId/${id_user}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { mensagem: 'Erro ao carregar perfil' };
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/usuario/salvar', userData);
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error.response?.data);
    throw new Error(errorMessage);
  }
};

export const updateUser = async (id_people, peopleData) => {
  try {
    const response = await api.put(`/pessoa/atualizar/${id_people}`, peopleData);
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error.response?.data);
    throw new Error(errorMessage);
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/pedido/checkout', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { mensagem: 'Erro ao finalizar pedido' };
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await api.post('/categoria/salvar', categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { mensagem: 'Erro ao criar categoria' };
  }
};

export const deleteCategory = async (id_category) => {
  try {
    await api.delete(`/categoria/excluir/${id_category}`);
  } catch (error) {
    throw error.response?.data || { mensagem: 'Erro ao excluir categoria' };
  }
};

export const updateCategory = async (id_category, categoryData) => {
  try {
    const response = await api.put(`/categoria/atualizar/${id_category}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error.response?.data || { mensagem: 'Erro ao atualizar categoria' };
  }
};

export const getAllOrdersForDashboard = () => {
  return api.get(`/pedido/listar`, {
    params: { page: 1, size: 0 },
  });
};

export const deleteProduct = async (id_product) => {
  try {
    await api.delete(`/produto/excluir/${id_product}`);
  } catch (error) {
    throw error.response?.data || { mensagem: 'Erro ao excluir produto' };
  }
};

export const createProduct = async (productFormData) => {
  try {
    const response = await api.post('/produto/salvar', productFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { mensagem: 'Erro ao criar produto' };
  }
};

export const updateProduct = async (id_product, productFormData) => {
  try {
    const response = await api.put(`/produto/atualizar/${id_product}`, productFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { mensagem: 'Erro ao atualizar produto' };
  }
};

export const updateAddress = async (id_address, addressData) => {
  try {
    const response = await api.put(`/endereco/atualizar/${id_address}`, addressData);
    return response.data;
  } catch (error) {
    const errorMessage = extractErrorMessage(error.response?.data);
    throw new Error(errorMessage);
  }
};

export const getMyOrders = (id_people, page = 1, size = 6) => {
  return api.get(`/pedido/usuario/${id_people}`, {
    params: { page, size },
  });
};

export const getAllTypeOfPayment = async (page = 1, size = 6) => {
  return api.get(`/pagamento/listar`, {
    params: { page, size },
  });
};

export const createTypeOfPayment = async (paymentData) => {
  try {
    const response = await api.post('/pagamento/salvar', paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { mensagem: 'Erro ao criar tipo de pagamento' };
  }
};

export const updateTypeOfPayment = async (id_type_of_payment, paymentData) => {
  try {
    const response = await api.put(`/pagamento/atualizar/${id_type_of_payment}`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar tipo de pagamento:', error);
    throw error.response?.data || { mensagem: 'Erro ao atualizar tipo de pagamento' };
  }
};

export const deleteTypeOfPayment = async (id_type_of_payment) => {
  try {
    await api.delete(`/pagamento/excluir/${id_type_of_payment}`);
  } catch (error) {
    throw error.response?.data || { mensagem: 'Erro ao excluir tipo de pagamento' };
  }
};

export default api;
