import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Fonts } from '@/constants/fonts';

import { HomeHeader } from '@/components/home/Header';
import { Menu } from '@/components/home/Menu';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { OfferSection } from '@/components/home/OfferSection';

export default function HomeScreen() {
    return (
        <View style={styles.container}>

            <StatusBar style="dark" />

            <HomeHeader />

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

                    <OfferSection />

                </View>

                <CategorySection />

                <FeaturedSection />

            </ScrollView>

            <Menu />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },

    scrollContent: {
        paddingBottom: 100,
    },

    topSection: {
        width: '100%',
        backgroundColor: '#E7C9DA',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        paddingTop: 100,
        paddingHorizontal: 20,
        paddingBottom: 35,
    },

    presentation: {
        alignItems: 'center',
        marginTop: 30,
    },

    brand: {
        fontSize: 43,
        color: '#DD2E8A',
        fontFamily: Fonts.semibold,
    },

    slogan: {
        marginTop: 2,
        fontSize: 25,
        color: '#FFFFFF',
        fontFamily: Fonts.regular,
        textAlign: 'center',
    },
});