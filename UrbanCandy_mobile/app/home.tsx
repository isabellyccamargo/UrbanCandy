import { useState } from 'react';

import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';

import { useTheme } from '@/context/Theme';

import { HomeHeader } from '@/components/home/Header';
import { Menu } from '@/components/home/Menu';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { OfferSection } from '@/components/home/OfferSection';
import { CartToast } from '@/components/cart/CartToats';

export default function HomeScreen() {
    const {
        colors,
        font,
        fontSize,
        space,
        radius,
    } = useTheme();

    const [showCartToast, setShowCartToast] = useState(false);
    const [addedProductName, setAddedProductName] = useState('');

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },

        scrollContent: {
            paddingBottom: 100,
        },

        topSection: {
            width: '100%',
            backgroundColor: colors.secondary,
            borderBottomLeftRadius: radius.xxl,
            borderBottomRightRadius: radius.xxl,
            paddingTop: 100,
            paddingHorizontal: space.xl,
            paddingBottom: 35,
        },

        presentation: {
            alignItems: 'center',
            marginTop: 30,
        },

        brand: {
            fontSize: fontSize.display,
            color: colors.primary,
            fontFamily: font.semibold,
        },

        slogan: {
            marginTop: 2,
            fontSize: 25,
            color: colors.white,
            fontFamily: font.regular,
            textAlign: 'center',
        },
    });

    function handleProductAdded(productName: string) {
        setAddedProductName(productName);
        setShowCartToast(true);

        setTimeout(() => {
            setShowCartToast(false);
        }, 2500);
    }

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <HomeHeader />

            <CartToast
                visible={showCartToast}
                productName={addedProductName}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.topSection}>
                    <View style={styles.presentation}>
                        <Text style={styles.brand}>
                            UrbanCandy
                        </Text>

                        <Text style={styles.slogan}>
                            Doces que conquistam corações!
                        </Text>
                    </View>

                    <OfferSection
                        onProductAdded={handleProductAdded}
                    />
                </View>

                <CategorySection />

                <FeaturedSection
                    onProductAdded={handleProductAdded}
                />
            </ScrollView>

            <Menu />
        </View>
    );
}