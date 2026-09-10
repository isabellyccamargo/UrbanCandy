import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useTheme } from '@/context/Theme';

import PersonalDataForm from './PersonalDataForm';
import AddressForm from './AddressForm';
import AccountButton from './AccountButton';

type Props = {
    isEditing: boolean;

    imageUri?: string | null;
    onPickImage?: () => void;

    name: string;
    cpf: string;
    telephone: string;
    email: string;

    password: string;
    confirmPassword: string;

    cep: string;
    city: string;
    neighborhood: string;
    road: string;
    number: string;
    complement: string;

    loading: boolean;

    onChangeName: (value: string) => void;
    onChangeCpf: (value: string) => void;
    onChangeTelephone: (value: string) => void;
    onChangeEmail: (value: string) => void;

    onChangePassword: (value: string) => void;
    onChangeConfirmPassword: (value: string) => void;

    onChangeCep: (value: string) => void;
    onChangeCity: (value: string) => void;
    onChangeNeighborhood: (value: string) => void;
    onChangeRoad: (value: string) => void;
    onChangeNumber: (value: string) => void;
    onChangeComplement: (value: string) => void;

    onSubmit: () => void;
};

export default function AccountForm({
    isEditing,

    imageUri,
    onPickImage,

    name,
    cpf,
    telephone,
    email,

    password,
    confirmPassword,

    cep,
    city,
    neighborhood,
    road,
    number,
    complement,

    loading,

    onChangeName,
    onChangeCpf,
    onChangeTelephone,
    onChangeEmail,

    onChangePassword,
    onChangeConfirmPassword,

    onChangeCep,
    onChangeCity,
    onChangeNeighborhood,
    onChangeRoad,
    onChangeNumber,
    onChangeComplement,

    onSubmit,
}: Props) {
    const {
        colors,
        font,
        fontSize,
        space,
    } = useTheme();

    const styles = StyleSheet.create({
        section: {
            marginBottom: space.lg,
        },

        title: {
            fontFamily: font.semibold,
            fontSize: fontSize.lg,
            color: colors.text,
            marginBottom: space.md,
        },
    });

    return (
        <View>
            <View style={styles.section}>
                <Text style={styles.title}>
                    Dados pessoais
                </Text>

                <PersonalDataForm
                    isEditing={isEditing}

                    imageUri={imageUri}
                    onPickImage={onPickImage}

                    name={name}
                    cpf={cpf}
                    telephone={telephone}
                    email={email}

                    password={password}
                    confirmPassword={confirmPassword}

                    onChangeName={onChangeName}
                    onChangeCpf={onChangeCpf}
                    onChangeTelephone={onChangeTelephone}
                    onChangeEmail={onChangeEmail}

                    onChangePassword={onChangePassword}
                    onChangeConfirmPassword={
                        onChangeConfirmPassword
                    }
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>
                    Endereço
                </Text>

                <AddressForm
                    cep={cep}
                    city={city}
                    neighborhood={neighborhood}
                    road={road}
                    number={number}
                    complement={complement}

                    onChangeCep={onChangeCep}
                    onChangeCity={onChangeCity}
                    onChangeNeighborhood={
                        onChangeNeighborhood
                    }
                    onChangeRoad={onChangeRoad}
                    onChangeNumber={onChangeNumber}
                    onChangeComplement={
                        onChangeComplement
                    }
                />
            </View>

            <AccountButton
                title={
                    isEditing
                        ? 'Atualizar dados'
                        : 'Cadastrar'
                }
                onPress={onSubmit}
                loading={loading}
            />
        </View>
    );
}