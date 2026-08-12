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

type CartItem = {
    id_product: number;
    product: Product;
    quantity: number;
};

type CartContextType = {
    items: CartItem[];
    total: number;
    addToCart: (product: Product) => void;
    removeFromCart: (id_product: number) => void;
    increaseQuantity: (id_product: number) => void;
    decreaseQuantity: (id_product: number) => void;
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

    function addToCart(product: Product) {
        setItems((currentItems) => {
            const existingItem =
                currentItems.find(
                    (item) =>
                        item.id_product ===
                        product.id_product
                );

            if (existingItem) {
                return currentItems.map((item) =>
                    item.id_product ===
                        product.id_product
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
                    id_product:
                        product.id_product,
                    product,
                    quantity: 1,
                },
            ];
        });
    }

    function removeFromCart(
        id_product: number
    ) {
        setItems((currentItems) =>
            currentItems.filter(
                (item) =>
                    item.id_product !==
                    id_product
            )
        );
    }

    function increaseQuantity(
        id_product: number
    ) {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.id_product ===
                    id_product
                    ? {
                        ...item,
                        quantity:
                            item.quantity + 1,
                    }
                    : item
            )
        );
    }

    function decreaseQuantity(
        id_product: number
    ) {
        setItems((currentItems) =>
            currentItems
                .map((item) =>
                    item.id_product ===
                        id_product
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