import React from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView,
} from 'react-native';

import { useTheme } from '@/context/Theme';

interface Category {
    id_category: number;
    name_category: string;
}

interface CategoryTabsProps {
    categories: Category[];
    selectedCategory: string | null;
    onSelectCategory: (category: string) => void;
}

export default function CategoryTabs({
    categories,
    selectedCategory,
    onSelectCategory,
}: CategoryTabsProps) {
    const {
        colors,
        font,
        fontSize,
        space,
        radius,
    } = useTheme();

    const styles = StyleSheet.create({
        container: {
            marginHorizontal: space.md,
            marginTop: space.md,
            height: 58,
            backgroundColor: colors.background,
            borderRadius: radius.md,

            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 8,
        },

        content: {
            alignItems: 'center',
            paddingHorizontal: space.md,
        },

        categoryButton: {
            minWidth: 110,
            height: 58,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: space.xs,
        },

        categoryText: {
            fontSize: fontSize.lg,
            color: colors.textSecondary,
            fontFamily: font.regular,
        },

        categoryTextSelected: {
            color: colors.primary,
            fontFamily: font.semibold,
        },

        underline: {
            position: 'absolute',
            bottom: 9,
            width: 70,
            height: 1,
            backgroundColor: colors.primary,
        },
    });

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {categories.map((category) => {
                    const isSelected =
                        selectedCategory === category.name_category;

                    return (
                        <Pressable
                            key={category.id_category}
                            onPress={() =>
                                onSelectCategory(category.name_category)
                            }
                            style={styles.categoryButton}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    isSelected &&
                                        styles.categoryTextSelected,
                                ]}
                            >
                                {category.name_category}
                            </Text>

                            {isSelected && (
                                <View style={styles.underline} />
                            )}
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}