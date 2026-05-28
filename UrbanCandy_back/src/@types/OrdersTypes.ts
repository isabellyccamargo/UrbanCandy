export interface ICartItem {
  id_product: number;
  quantity: number;
  sub_total: number;
  products?: {
    price: number;
    name: string;
  };
}

export interface ICart {
  items: ICartItem[];
  total: number;
}

export interface IOrderCheckout {
  id_people: number;
  id_payment: number;
  cart: ICart;
}

export interface IPaginatedResponse<T> {
  rows: T[];
  count: number;
}
