import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import api from '@/services/api';
import { Fonts } from '@/constants/fonts';
import { FeaturedCard } from './FeaturedCard';
import { useCart } from '@/context/CartContext';

type Product = {
    id_product: number;
    name: string;
    price: number;
    image?: string;
    description?: string;
    featured?: boolean;
};

type FeaturedSectionProps = {
    onProductAdded?: (productName: string) => void;
};

export function FeaturedSection({
    onProductAdded,
}: FeaturedSectionProps) {
    const { addToCart } = useCart();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeaturedProducts();
    }, []);

    async function loadFeaturedProducts() {
        try {
            const response = await api.get('/produto/destaque', {
                params: {
                    page: 1,
                    size: 10,
                },
            });

            const data = response.data?.data;

            console.log('========== DESTAQUES ==========');
            console.log(data);

            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                setProducts([]);
            }
        } catch (error: any) {
            console.error(
                'Erro ao carregar destaques:',
                error.response?.data || error
            );

            setProducts([]);
        } finally {
            setLoading(false);
        }
    }

    function handleAddToCart(product: Product) {
        console.log(
            '🛒 ADICIONANDO AO CARRINHO:',
            product.name
        );

        addToCart({
            id_product: product.id_product,
            name: product.name,
            price: Number(product.price),
            image: product.image,
        });

        // Avisa a Home que o produto foi adicionado
        onProductAdded?.(product.name);
    }

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.title}>
                    Destaques da Casa
                </Text>

                <Text style={styles.subtitle}>
                    Os produtos mais amados
                </Text>
            </View>

            {loading ? (
                <View style={styles.loading}>
                    <ActivityIndicator
                        size="small"
                        color="#DD2E8A"
                    />
                </View>
            ) : products.length === 0 ? (
                <Text style={styles.empty}>
                    Nenhum destaque disponível.
                </Text>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                >
                    {products.map((product) => (
                        <FeaturedCard
                            key={product.id_product}
                            name={product.name}
                            price={Number(product.price)}
                            image={product.image}
                            onPress={() => {
                                console.log(
                                    'Produto selecionado:',
                                    product.id_product
                                );
                            }}
                            onAdd={() => {
                                handleAddToCart(product);
                            }}
                        />
                    ))}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 30,
    },

    header: {
        alignItems: 'center',
        marginBottom: 20,
    },

    title: {
        fontFamily: Fonts.semibold,
        fontSize: 24,
        color: '#DD2E8A',
    },

    subtitle: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: '#777777',
        marginTop: 3,
    },

    list: {
        paddingHorizontal: 20,
        gap: 12,
    },

    loading: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },

    empty: {
        textAlign: 'center',
        color: '#777777',
        fontSize: 14,
    },
});