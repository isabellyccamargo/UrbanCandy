import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Fonts } from '@/constants/fonts';
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
};

export function OfferSection() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        loadOffers();
    }, []);

    async function loadOffers() {
        try {
            const response = await getAllOffers();

            console.log('========== OFERTAS ==========');
            console.log(response.data);

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
            console.error(
                'Erro ao carregar ofertas:',
                error
            );

            setOffers([]);

        } finally {
            setLoading(false);
        }
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
                        color="#ED1765"
                    />
                </View>
            ) : (
                <>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.list}
                        pagingEnabled={false}
                        onScroll={(event) => {
                            const offsetX =
                                event.nativeEvent.contentOffset.x;

                            const cardWidth = 308;

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
                                price={Number(
                                    offer.price_offer
                                )}
                                image={offer.image}
                                onAdd={() => {
                                    console.log(
                                        'Oferta adicionada:',
                                        offer.id_offer
                                    );
                                }}
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
        fontFamily: Fonts.semibold,
        fontSize: 24,
        color: '#DD2E8A',
        marginBottom: 20,
    },

    list: {
        paddingHorizontal: 20,
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

        marginTop: 8,
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

        backgroundColor: '#DD2E8A',
    },
});