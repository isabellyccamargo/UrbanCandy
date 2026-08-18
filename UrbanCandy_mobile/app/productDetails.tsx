import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { API_BASE_URL } from '@/services/api';
import { getProductById } from '@/services/products';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/Theme';

import { Menu } from '@/components/home/Menu';
import { CartToast } from '@/components/cart/CartToats';
import { SmallButton } from '@/components/ui/smallButton';

type Product = {
    id_product: number;
    name: string;
    description: string;
    price: number;
    image: string;
    id_category: number;
    featured: boolean;
    ingredients?: string | null;
};

export default function ProdutoScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const { addToCart } = useCart();
    const { colors, font, fontSize, space, radius } = useTheme();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastProduct, setToastProduct] = useState('');

    useEffect(() => {
        if (!id) {
            setError('Produto não informado.');
            setLoading(false);
            return;
        }

        loadProduct(Number(id));
    }, [id]);

    async function loadProduct(productId: number) {
        try {
            setLoading(true);
            setError(null);
            setProduct(await getProductById(productId));
        } catch (err) {
            console.error('Erro ao buscar produto:', err);
            setError('Não foi possível carregar o produto.');
        } finally {
            setLoading(false);
        }
    }

    function handleAddToCart() {
        if (!product) return;

        addToCart({
            id_product: product.id_product,
            name: product.name,
            price: Number(product.price),
            image: product.image,
        });

        setToastProduct(product.name);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 2000);
    }

    function formatPrice(price: number) {
        return Number(price).toFixed(2).replace('.', ',');
    }

    function getIngredients() {
        return product?.ingredients
            ?.split(';')
            .map(item => item.trim())
            .filter(Boolean) ?? [];
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollContent: {
            paddingBottom: 100,
        },
        topSection: {
            height: 400,
            backgroundColor: colors.secondary,
            borderBottomLeftRadius: radius.xxl,
            borderBottomRightRadius: radius.xxl,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 70,
            paddingHorizontal: 18,
        },
        backButton: {
            width: 38,
            height: 38,
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerTitle: {
            fontFamily: font.regular,
            fontSize: fontSize.xxl,
            color: colors.white,
            marginLeft: 5,
        },
        imageContainer: {
            position: 'absolute',
            top: 120,
            left: 15,
            right: 15,
            height: 375,
            borderRadius: radius.md,
            overflow: 'hidden',
        },
        productImage: {
            width: '100%',
            height: '100%',
        },
        imagePlaceholder: {
            flex: 1,
            backgroundColor: colors.border,
            justifyContent: 'center',
            alignItems: 'center',
        },
        placeholderText: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.textTertiary,
        },
        infoContainer: {
            paddingHorizontal: space.xxl,
            paddingTop: 130,
        },
        nameRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        nameContainer: {
            flex: 1,
            paddingRight: 10,
        },
        productName: {
            fontFamily: font.regular,
            fontSize: fontSize.title,
            color: colors.text,
        },
        price: {
            fontFamily: font.bold,
            fontSize: fontSize.xl,
            color: colors.primary,
            marginTop: 10,
        },
        sectionTitle: {
            fontFamily: font.regular,
            fontSize: fontSize.lg,
            color: colors.text,
            marginTop: 28,
            marginBottom: space.md,
        },
        description: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            lineHeight: 29,
            color: colors.textSecondary,
        },
        ingredientsTitle: {
            fontFamily: font.regular,
            fontSize: fontSize.lg,
            color: colors.text,
            marginTop: 14,
            marginBottom: 5,
        },
        ingredient: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            lineHeight: 30,
            color: colors.textSecondary,
        },
        noIngredients: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.textTertiary,
        },
        loading: {
            flex: 1,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 30,
        },
        loadingText: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.textSecondary,
            marginTop: space.md,
        },
        error: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.primary,
            textAlign: 'center',
            marginBottom: space.xl,
        },
        backErrorButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: 30,
            paddingVertical: 10,
            borderRadius: radius.xl,
        },
        backErrorText: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.white,
        },
    });

    if (loading) {
        return (
            <View style={styles.loading}>
                <StatusBar style="dark" />
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Carregando produto...</Text>
            </View>
        );
    }

    if (error || !product) {
        return (
            <View style={styles.loading}>
                <StatusBar style="dark" />
                <Text style={styles.error}>
                    {error || 'Produto não encontrado.'}
                </Text>
                <Pressable
                    style={styles.backErrorButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backErrorText}>Voltar</Text>
                </Pressable>
            </View>
        );
    }

    const imageUrl = product.image
        ? `${API_BASE_URL}/uploads/${product.image}`
        : null;

    const ingredients = getIngredients();

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.topSection}>
                    <View style={styles.header}>
                        <Pressable
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={26}
                                color={colors.white}
                            />
                        </Pressable>

                        <Text style={styles.headerTitle}>Detalhes</Text>
                    </View>
                </View>

                <View style={styles.imageContainer}>
                    {imageUrl ? (
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.placeholderText}>
                                Sem imagem
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.nameRow}>
                        <View style={styles.nameContainer}>
                            <Text style={styles.productName}>
                                {product.name}
                            </Text>

                            <Text style={styles.price}>
                                R$ {formatPrice(product.price)}
                            </Text>
                        </View>

                        <SmallButton
                            title="Adicionar"
                            onPress={handleAddToCart}
                        />
                    </View>

                    <Text style={styles.sectionTitle}>
                        Detalhes do Produto
                    </Text>

                    <Text style={styles.description}>
                        {product.description}
                    </Text>

                    <Text style={styles.ingredientsTitle}>
                        Ingredientes:
                    </Text>

                    {ingredients.length > 0 ? (
                        ingredients.map((ingredient, index) => (
                            <Text
                                key={`${ingredient}-${index}`}
                                style={styles.ingredient}
                            >
                                _ {ingredient};
                            </Text>
                        ))
                    ) : (
                        <Text style={styles.noIngredients}>
                            Ingredientes não informados.
                        </Text>
                    )}
                </View>
            </ScrollView>

            <CartToast
                visible={toastVisible}
                productName={toastProduct}
            />

            <Menu />
        </View>
    );
}