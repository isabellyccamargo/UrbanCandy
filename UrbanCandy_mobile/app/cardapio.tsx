import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useTheme } from '@/context/Theme';
import { useCart } from '@/context/CartContext';

import CardapioHeader from '@/components/cardapio/CardapioHeader';
import CategoryTabs from '@/components/cardapio/CategoryTabs';
import { ProductCard } from '@/components/cardapio/ProductsCard';
import { Menu } from '@/components/home/Menu';
import { CartToast } from '@/components/cart/CartToats';

import { getProductsByCategory } from '@/services/products';
import { getAllCategories } from '@/services/categories';

type Category = {
    id_category: number;
    name_category: string;
};

type Product = {
    id_product: number;
    name: string;
    price: number;
    image?: string;
};

export default function CardapioScreen() {
    const router = useRouter();
    const { colors, font, fontSize, space } = useTheme();
    const { addToCart } = useCart();
    const { category } = useLocalSearchParams<{ category?: string }>();

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastProduct, setToastProduct] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) loadProducts(selectedCategory);
    }, [selectedCategory]);

    async function loadCategories() {
        try {
            setLoadingCategories(true);

            const response = await getAllCategories();
            const data = response?.data ?? [];

            if (!Array.isArray(data)) return;

            setCategories(data);

            const selected =
                typeof category === 'string'
                    ? data.find(item => item.name_category === category)
                    : null;

            setSelectedCategory(
                selected?.name_category ?? data[0]?.name_category ?? null
            );
        } catch {
            setError('Não foi possível carregar as categorias.');
        } finally {
            setLoadingCategories(false);
        }
    }

    async function loadProducts(categoryName: string) {
        try {
            setLoadingProducts(true);
            setError(null);

            const response = await getProductsByCategory(categoryName);

            setProducts(Array.isArray(response?.data) ? response.data : []);
        } catch {
            setProducts([]);
            setError('Não foi possível carregar os produtos.');
        } finally {
            setLoadingProducts(false);
        }
    }

    function handleAddProduct(product: Product) {
        addToCart({
            id_product: product.id_product,
            name: product.name,
            price: Number(product.price),
            image: product.image,
        });

        setToastProduct(product.name);
        setShowToast(true);

        setTimeout(() => setShowToast(false), 2000);
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        loadingCategories: {
            height: 58,
            justifyContent: 'center',
            alignItems: 'center',
        },
        productsContainer: {
            paddingHorizontal: space.md,
            paddingTop: space.lg,
            paddingBottom: 110,
        },
        productRow: {
            justifyContent: 'space-between',
        },
        loading: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            marginTop: space.sm,
            fontFamily: font.regular,
            fontSize: fontSize.base,
            color: colors.textSecondary,
        },
        error: {
            textAlign: 'center',
            margin: space.sm,
            fontFamily: font.regular,
            fontSize: fontSize.base,
            color: colors.primary,
        },
        emptyContainer: {
            alignItems: 'center',
            paddingTop: space.huge,
        },
        emptyText: {
            fontFamily: font.regular,
            fontSize: fontSize.md,
            color: colors.textTertiary,
        },
    });

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <CardapioHeader />

            {loadingCategories ? (
                <View style={styles.loadingCategories}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            ) : (
                <CategoryTabs
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />
            )}

            {error && <Text style={styles.error}>{error}</Text>}

            {loadingProducts ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>
                        Carregando produtos...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={item => String(item.id_product)}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.productsContainer}
                    columnWrapperStyle={styles.productRow}
                    renderItem={({ item }) => (
                        <ProductCard
                            id_product={item.id_product}
                            name={item.name}
                            price={item.price}
                            image={item.image}
                            onPress={() =>
                                router.push({
                                    pathname: '/productDetails',
                                    params: { id: String(item.id_product) },
                                })
                            }
                            onAdd={() => handleAddProduct(item)}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                Nenhum produto encontrado.
                            </Text>
                        </View>
                    }
                />
            )}

            <CartToast visible={showToast} productName={toastProduct} />
            <Menu />
        </View>
    );
}