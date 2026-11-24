export interface ICartItem {
  id_product: number;
  quantity: number;
  sub_total: number;
  products?: {
    price: number;
    name: string;
  };
}

export interface ICartOffer {
  id_offer: number;
  quantity: number;
}

export interface ICart {
  items: ICartItem[];
  offers?: ICartOffer[];
  total: number;
}

export interface IOrderCheckout {
  id_people?: number;
  id_payment: number;
  id_type_delivery: number;
  cart: ICart;
}

export interface IPaginatedResponse<T> {
  rows: T[];
  count: number;
}
