import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/Theme';
import api from '@/services/api';

import { FeaturedCard } from './FeaturedCard';

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
    const { colors, font, fontSize, space } = useTheme();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            marginTop: 30,
        },
        header: {
            alignItems: 'center',
            marginBottom: space.xl,
        },
        title: {
            fontFamily: font.semibold,
            fontSize: fontSize.xxl,
            color: colors.primary,
        },
        subtitle: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.textSecondary,
            marginTop: 3,
        },
        list: {
            paddingHorizontal: space.sm,
            gap: space.md,
        },
        loading: {
            height: 180,
            justifyContent: 'center',
            alignItems: 'center',
        },
        empty: {
            textAlign: 'center',
            color: colors.textSecondary,
            fontFamily: font.regular,
            fontSize: fontSize.sm,
        },
    });

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
        addToCart({
            id_product: product.id_product,
            name: product.name,
            price: Number(product.price),
            image: product.image,
        });

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
                        color={colors.primary}
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
                            onAdd={() => handleAddToCart(product)}
                        />
                    ))}
                </ScrollView>
            )}
        </View>
    );
}