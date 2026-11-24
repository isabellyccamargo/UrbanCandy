import api from '@/services/api';

export interface OrderStatus {
  id_order_status: number;
  name: string;
  label: string;
}

export interface OrderItemProduct {
  id_product: number;
  name: string;
  description: string;
  price: string;
}

export interface OrderItem {
  id_order_item?: number;
  quantity: number;
  unit_price: string;
  sub_total: string;
  products: OrderItemProduct;
}

export interface Order {
  id_orders: number;
  id_people: number;
  order_date: string;
  total: string | number;
  id_payment: number;
  id_type_delivery: number;
  id_order_status: number;
  people?: {
    id_people: number;
    name: string;
  };
  paymentType?: {
    name_payment: string;
  };
  deliveryType?: {
    name: string;
  };
  status?: OrderStatus;
  items?: OrderItem[];
}

export async function fetchOrderStatuses(): Promise<OrderStatus[]> {
  const response = await api.get('/pedido/status/listar');
  return response.data;
}

export async function fetchAllOrders(page = 1, size = 100): Promise<{ data: Order[] }> {
  const response = await api.get(`/pedido/listar?page=${page}&size=${size}`);
  return response.data;
}

export async function updateOrderStatus(id_order: number, status: number | string) {
    const response = await api.put(`/pedidos/status/${id_order}`, { status });
    return response.data;
}