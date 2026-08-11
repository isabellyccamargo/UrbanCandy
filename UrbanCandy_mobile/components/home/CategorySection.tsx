import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { CategoryCard } from './Categorycard';
import api from '@/services/api';
import { Fonts } from '@/constants/fonts';
import { useRouter } from 'expo-router';

type Category = {
    id_category: number;
    name_category: string;
};

const CATEGORY_IMAGES: Record<number, any> = {
    5: require('@/assets/images/CookieChocolate.jpg'),
    6: require('@/assets/images/1776169280605-Brigadeiro.jpg'),
    7: require('@/assets/images/1776169099201-BrownieNutella.jpg'),
};

export function CategorySection() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        try {
            const response = await api.get('/categoria/listar');

            const data = response.data?.data;

            console.log('========== CATEGORIAS ==========');
            console.log(data);

            if (!Array.isArray(data)) {
                setCategories([]);
                return;
            }

            setCategories(data);

        } catch (error: any) {
            console.error(
                'Erro ao carregar categorias:',
                error.response?.data || error
            );

            setCategories([]);

        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.title}>
                    Categorias
                </Text>
            </View>

            {loading ? (
                <View style={styles.loading}>
                    <ActivityIndicator
                        size="small"
                        color="#DD2E8A"
                    />
                </View>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                >
                    {categories.map((category, index) => {

                        const image =
                            CATEGORY_IMAGES[category.id_category];

                        console.log(
                            `${category.id_category} - ${category.name_category} →`,
                            image ? 'IMAGEM OK' : 'SEM IMAGEM'
                        );

                        return (
                            <View
                                key={category.id_category}
                                style={styles.categoryItem}
                            >
                                <CategoryCard
                                    name={category.name_category}
                                    image={image}
                                    onPress={() => {
                                        router.push({
                                            pathname: '/cardapio',
                                            params: {
                                                category: category.name_category,
                                            },
                                        });
                                    }}
                                />

                                {index < categories.length - 1 && (
                                    <View style={styles.divider} />
                                )}

                            </View>
                        );
                    })}
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
        marginBottom: 18,
    },

    title: {
        fontFamily: Fonts.semibold,
        fontSize: 24,
        color: '#DD2E8A',
    },

    list: {
        paddingHorizontal: 20,
    },

    loading: {
        minHeight: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },

    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    divider: {
        width: 1,
        height: 75,
        backgroundColor: '#e6b3ce',

    },
});