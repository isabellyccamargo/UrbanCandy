import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Fonts } from '@/constants/fonts';
import CardapioHeader from '@/components/cardapio/CardapioHeader';
import CategoryTabs from '@/components/cardapio/CategoryTabs';
import { ProductCard } from '@/components/cardapio/ProductsCard';
import { Menu } from '@/components/home/Menu';

import { getProductsByCategory } from '@/services/products';
import { getAllCategories } from '@/services/categories';
import { useCart } from '@/context/CartContext';

type Category = {
    id_category: number;
    name_category: string;
};

type Product = {
    id_product: number;
    name: string;
    description?: string;
    price: number;
    image?: string;
    id_category?: number;
    featured?: boolean;
};

export default function CardapioScreen() {
    const router = useRouter();
    const { addToCart } = useCart();
    const { category } = useLocalSearchParams<{ category?: string }>();

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            loadProductsByCategory(selectedCategory);
        }
    }, [selectedCategory]);

    async function loadCategories() {
        try {
            setLoadingCategories(true);
            setError(null);

            const response = await getAllCategories();
            const categoryData = response?.data ?? [];

            if (!Array.isArray(categoryData)) {
                setCategories([]);
                setSelectedCategory(null);
                return;
            }

            setCategories(categoryData);

            if (typeof category === 'string') {
                const categoryExists = categoryData.find(
                    (item: Category) => item.name_category === category
                );

                if (categoryExists) {
                    setSelectedCategory(categoryExists.name_category);
                    return;
                }
            }

            if (categoryData.length > 0) {
                setSelectedCategory(categoryData[0].name_category);
            }
        } catch (err) {
            console.error('Erro ao carregar categorias:', err);
            setCategories([]);
            setSelectedCategory(null);
            setError('Não foi possível carregar as categorias.');
        } finally {
            setLoadingCategories(false);
        }
    }

    async function loadProductsByCategory(categoryName: string) {
        try {
            setLoadingProducts(true);
            setError(null);

            const response = await getProductsByCategory(categoryName);
            const productData = response?.data ?? [];

            if (!Array.isArray(productData)) {
                setProducts([]);
                return;
            }

            setProducts(productData);
        } catch (err: any) {
            console.error('Erro ao carregar produtos:', err);
            console.error('Resposta da API:', err?.response?.data);
            console.error('Status:', err?.response?.status);

            setProducts([]);
            setError('Não foi possível carregar os produtos.');
        } finally {
            setLoadingProducts(false);
        }
    }

    function handleSelectCategory(categoryName: string) {
        setSelectedCategory(categoryName);
    }

    function handleProductPress(id_product: number) {
        console.log('ABRINDO PRODUTO:', id_product);

        router.push({
            pathname: '/productDetails',
            params: { id: String(id_product) },
        });
    }

    function handleAddProduct(product: Product) {
        console.log('🛒 CLICOU EM ADICIONAR:', product.name);

        addToCart({
            id_product: product.id_product,
            name: product.name,
            price: Number(product.price),
            image: product.image,
        });

        console.log('✅ PRODUTO ENVIADO PARA O CARRINHO');
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <CardapioHeader />

            {loadingCategories ? (
                <View style={styles.loadingCategories}>
                    <ActivityIndicator size="small" color="#DD2E8A" />
                </View>
            ) : (
                <CategoryTabs
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleSelectCategory}
                />
            )}

            {error && <Text style={styles.error}>{error}</Text>}

            {loadingProducts ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#DD2E8A" />
                    <Text style={styles.loadingText}>
                        Carregando produtos...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => String(item.id_product)}
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
                            onPress={() => handleProductPress(item.id_product)}
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

            <Menu />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },

    loadingCategories: {
        height: 58,
        justifyContent: 'center',
        alignItems: 'center',
    },

    productsContainer: {
        paddingHorizontal: 14,
        paddingTop: 18,
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
        marginTop: 10,
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#666666',
    },

    error: {
        textAlign: 'center',
        marginTop: 10,
        marginHorizontal: 20,
        fontFamily: Fonts.regular,
        fontSize: 14,
        color: '#DD2E8A',
    },

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },

    emptyText: {
        fontFamily: Fonts.regular,
        fontSize: 16,
        color: '#777777',
    },
});