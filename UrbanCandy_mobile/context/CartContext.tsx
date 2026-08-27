import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

type Product = {
    id_product: number;
    name: string;
    price: number;
    image?: string;
};

export type OfferProduct = {
    id_product: number;
    quantity: number;
    product: Product;
};

export type CartItem = {
    id_product: number;
    product: Product;
    quantity: number;

    // Dados da oferta
    isOffer?: boolean;
    id_offer?: number;
    offerProducts?: OfferProduct[];
};

type CartContextType = {
    items: CartItem[];
    total: number;

    addToCart: (
        product: Product & {
            isOffer?: boolean;
            id_offer?: number;
            offerProducts?: OfferProduct[];
        }
    ) => void;

    removeFromCart: (itemId: string) => void;
    increaseQuantity: (itemId: string) => void;
    decreaseQuantity: (itemId: string) => void;

    clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(
    undefined
);

export function CartProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        loadCart();
    }, []);

    useEffect(() => {
        saveCart();
    }, [items]);

    async function loadCart() {
        try {
            const savedCart =
                await AsyncStorage.getItem(
                    '@UrbanCandy:cart'
                );

            if (savedCart) {
                setItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.log(
                'Erro ao carregar carrinho:',
                error
            );
        }
    }

    async function saveCart() {
        try {
            await AsyncStorage.setItem(
                '@UrbanCandy:cart',
                JSON.stringify(items)
            );
        } catch (error) {
            console.log(
                'Erro ao salvar carrinho:',
                error
            );
        }
    }

    /**
     * Identificador único do item do carrinho.
     *
     * Produto:
     * product-5
     *
     * Oferta:
     * offer-2
     */
    function getItemId(item: CartItem): string {
        if (item.isOffer && item.id_offer) {
            return `offer-${item.id_offer}`;
        }

        return `product-${item.id_product}`;
    }

    function addToCart(
        product: Product & {
            isOffer?: boolean;
            id_offer?: number;
            offerProducts?: OfferProduct[];
        }
    ) {
        setItems((currentItems) => {
            const newItemId =
                product.isOffer && product.id_offer
                    ? `offer-${product.id_offer}`
                    : `product-${product.id_product}`;

            const existingItem =
                currentItems.find(
                    (item) =>
                        getItemId(item) === newItemId
                );

            if (existingItem) {
                return currentItems.map((item) =>
                    getItemId(item) === newItemId
                        ? {
                              ...item,
                              quantity:
                                  item.quantity + 1,
                          }
                        : item
                );
            }

            return [
                ...currentItems,
                {
                    id_product: product.id_product,
                    product: {
                        id_product:
                            product.id_product,
                        name: product.name,
                        price: Number(product.price),
                        image: product.image,
                    },
                    quantity: 1,

                    isOffer: product.isOffer,
                    id_offer: product.id_offer,
                    offerProducts:
                        product.offerProducts,
                },
            ];
        });
    }

    function removeFromCart(itemId: string) {
        setItems((currentItems) =>
            currentItems.filter(
                (item) =>
                    getItemId(item) !== itemId
            )
        );
    }

    function increaseQuantity(itemId: string) {
        setItems((currentItems) =>
            currentItems.map((item) =>
                getItemId(item) === itemId
                    ? {
                          ...item,
                          quantity:
                              item.quantity + 1,
                      }
                    : item
            )
        );
    }

    function decreaseQuantity(itemId: string) {
        setItems((currentItems) =>
            currentItems
                .map((item) =>
                    getItemId(item) === itemId
                        ? {
                              ...item,
                              quantity:
                                  item.quantity - 1,
                          }
                        : item
                )
                .filter(
                    (item) =>
                        item.quantity > 0
                )
        );
    }

    function clearCart() {
        setItems([]);
    }

    const total = items.reduce(
        (sum, item) =>
            sum +
            Number(item.product.price) *
                item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                items,
                total,
                addToCart,
                removeFromCart,
                increaseQuantity,
                decreaseQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(
        CartContext
    );

    if (!context) {
        throw new Error(
            'useCart deve ser usado dentro do CartProvider'
        );
    }

    return context;
}