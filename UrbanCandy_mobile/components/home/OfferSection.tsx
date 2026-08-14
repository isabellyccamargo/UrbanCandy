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
import { getAllOffers } from '@/services/offers';

import { OfferCard } from './OfferCard';

type Offer = {
    id_offer: number;
    name_offer: string;
    description?: string;
    discount: number | string;
    price_offer: number | string;
    image?: string;
    active: boolean;
    id_product?: number;
};

type OfferSectionProps = {
    onProductAdded?: (productName: string) => void;
};

export function OfferSection({ onProductAdded }: OfferSectionProps) {
    const { addToCart } = useCart();
    const { colors, font, fontSize, space } = useTheme();

    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            height: 260,
            marginTop: 28,
        },
        header: {
            alignItems: 'center',
        },
        title: {
            fontFamily: font.semibold,
            fontSize: fontSize.xxl,
            color: colors.primary,
            marginBottom: space.xl,
        },
        list: {
            paddingHorizontal: space.xl,
        },
        loading: {
            height: 118,
            justifyContent: 'center',
            alignItems: 'center',
        },
        dots: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: space.sm,
            gap: 6,
        },
        dot: {
            width: 10,
            height: 10,
            borderRadius: 10,
            backgroundColor: '#E5E5E5',
        },
        activeDot: {
            width: 10,
            height: 10,
            borderRadius: 10,
            backgroundColor: colors.primary,
        },
    });

    useEffect(() => {
        loadOffers();
    }, []);

    async function loadOffers() {
        try {
            const response = await getAllOffers();

            if (!Array.isArray(response.data)) {
                setOffers([]);
                return;
            }

            setOffers(
                response.data.filter(
                    (offer: Offer) => offer.active
                )
            );
        } catch (error) {
            console.error('Erro ao carregar ofertas:', error);
            setOffers([]);
        } finally {
            setLoading(false);
        }
    }

    function handleAddToCart(offer: Offer) {
        addToCart({
            id_product: offer.id_product ?? offer.id_offer,
            name: offer.name_offer,
            price: Number(offer.price_offer),
            image: offer.image,
        });

        onProductAdded?.(offer.name_offer);
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    Ofertas Especiais
                </Text>
            </View>

            {loading ? (
                <View style={styles.loading}>
                    <ActivityIndicator
                        size="small"
                        color={colors.primary}
                    />
                </View>
            ) : (
                <>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.list}
                        onScroll={(event) => {
                            const offsetX =
                                event.nativeEvent.contentOffset.x;

                            const cardWidth = 352;

                            const index = Math.round(
                                offsetX / cardWidth
                            );

                            setActiveIndex(index);
                        }}
                        scrollEventThrottle={16}
                    >
                        {offers.map((offer) => (
                            <OfferCard
                                key={offer.id_offer}
                                name={offer.name_offer}
                                description={offer.description}
                                price={Number(offer.price_offer)}
                                image={offer.image}
                                onAdd={() =>
                                    handleAddToCart(offer)
                                }
                            />
                        ))}
                    </ScrollView>

                    {offers.length > 0 && (
                        <View style={styles.dots}>
                            {offers.map((offer, index) => (
                                <View
                                    key={offer.id_offer}
                                    style={[
                                        styles.dot,
                                        index === activeIndex &&
                                            styles.activeDot,
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </>
            )}
        </View>
    );
}