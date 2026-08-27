import {
    StyleSheet,
    View,
} from 'react-native';

import { useTheme } from '@/context/Theme';

import AccountInput from './AccountInput';

type Props = {
    cep: string;
    city: string;
    neighborhood: string;
    road: string;
    number: string;
    complement: string;

    onChangeCep: (value: string) => void;
    onChangeCity: (value: string) => void;
    onChangeNeighborhood: (value: string) => void;
    onChangeRoad: (value: string) => void;
    onChangeNumber: (value: string) => void;
    onChangeComplement: (value: string) => void;
};

export default function AddressForm({
    cep,
    city,
    neighborhood,
    road,
    number,
    complement,

    onChangeCep,
    onChangeCity,
    onChangeNeighborhood,
    onChangeRoad,
    onChangeNumber,
    onChangeComplement,
}: Props) {
    const { space } = useTheme();

    const styles = StyleSheet.create({
        container: {
            width: '100%',
        },

        row: {
            flexDirection: 'row',
            gap: space.md,
        },

        half: {
            flex: 1,
        },
    });

    function handleCepChange(value: string) {
        const numbers = value
            .replace(/\D/g, '')
            .slice(0, 8);

        const formatted =
            numbers.length > 5
                ? `${numbers.slice(0, 5)}-${numbers.slice(5)}`
                : numbers;

        onChangeCep(formatted);

        if (numbers.length === 8) {
            searchCep(numbers);
        }
    }

    async function searchCep(cepNumber: string) {
        try {
            const response = await fetch(
                `https://viacep.com.br/ws/${cepNumber}/json/`
            );

            const data = await response.json();

            if (data.erro) {
                return;
            }

            onChangeRoad(data.logradouro ?? '');
            onChangeNeighborhood(data.bairro ?? '');
            onChangeCity(data.localidade ?? '');
        } catch {
            // Se o CEP não puder ser consultado,
            // o usuário ainda pode preencher os campos manualmente.
        }
    }

    return (
        <View style={styles.container}>
            <AccountInput
                label="CEP"
                value={cep}
                onChangeText={handleCepChange}
                placeholder="Digite seu CEP"
                keyboardType="numeric"
            />

            <View style={styles.row}>
                <View style={styles.half}>
                    <AccountInput
                        label="Cidade"
                        value={city}
                        onChangeText={onChangeCity}
                        placeholder="Cidade"
                    />
                </View>

                <View style={styles.half}>
                    <AccountInput
                        label="Bairro"
                        value={neighborhood}
                        onChangeText={onChangeNeighborhood}
                        placeholder="Bairro"
                    />
                </View>
            </View>

            <AccountInput
                label="Rua"
                value={road}
                onChangeText={onChangeRoad}
                placeholder="Rua"
            />

            <View style={styles.row}>
                <View style={styles.half}>
                    <AccountInput
                        label="Número"
                        value={number}
                        onChangeText={value =>
                            onChangeNumber(
                                value.replace(/\D/g, '')
                            )
                        }
                        placeholder="Número"
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.half}>
                    <AccountInput
                        label="Complemento"
                        value={complement}
                        onChangeText={onChangeComplement}
                        placeholder="Complemento"
                    />
                </View>
            </View>
        </View>
    );
}