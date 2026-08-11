import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';

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
                  isSelected && styles.categoryTextSelected,
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

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 14,
    marginTop: 12,
    height: 58,
    backgroundColor: '#F4F4F4',
    borderRadius: 12,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  categoryButton: {
    minWidth: 110,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },

  categoryText: {
    fontSize: 17,
    color: '#666666',
    fontFamily: 'serif',
  },

  categoryTextSelected: {
    color: '#ED1764',
  },

  underline: {
    position: 'absolute',
    bottom: 9,
    width: 70,
    height: 1,
    backgroundColor: '#ED1764',
  },
});