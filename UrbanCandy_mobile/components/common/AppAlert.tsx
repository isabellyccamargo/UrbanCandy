import React, {
    createContext,
    useContext,
    useRef,
    useState,
} from 'react';

import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type AlertType = 'success' | 'error' | 'warning';

type AlertData = {
    title: string;
    message: string;
    type: AlertType;
    onClose?: () => void;
};

type AlertObjectOptions = {
    title: string;
    message: string;
    type?: AlertType;
    onClose?: () => void;
    onConfirm?: () => void;
};

type AlertContextType = {
    // Suporta chamada por Objeto: showMessage({ title, message, type })
    // e também Posicional: showMessage(title, message, onClose, type)
    showMessage: (
        titleOrOptions: string | AlertObjectOptions,
        message?: string,
        onClose?: () => void,
        type?: AlertType
    ) => void;
};

const AlertContext = createContext<AlertContextType | null>(null);

export function AppAlertProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [alert, setAlert] = useState<AlertData | null>(null);
    const closing = useRef(false);

    function showMessage(
        titleOrOptions: string | AlertObjectOptions,
        message?: string,
        onClose?: () => void,
        type: AlertType = 'error'
    ) {
        if (closing.current) {
            return;
        }

        // Trata chamada com Objeto
        if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
            setAlert({
                title: titleOrOptions.title,
                message: titleOrOptions.message,
                type: titleOrOptions.type || 'error',
                onClose: titleOrOptions.onClose || titleOrOptions.onConfirm,
            });
            return;
        }

        // Trata chamada Posicional original
        setAlert({
            title: titleOrOptions,
            message: message || '',
            type,
            onClose,
        });
    }

    function closeAlert() {
        if (!alert || closing.current) {
            return;
        }

        closing.current = true;
        const callback = alert.onClose;

        setAlert(null);

        setTimeout(() => {
            closing.current = false;
            if (callback) {
                callback();
            }
        }, 150);
    }

    const color =
        alert?.type === 'success'
            ? '#22C55E'
            : alert?.type === 'warning'
                ? '#F59E0B'
                : '#EF4444';

    return (
        <AlertContext.Provider value={{ showMessage }}>
            {children}

            <Modal
                transparent
                visible={alert !== null}
                animationType="fade"
                onRequestClose={closeAlert}
            >
                <View style={styles.overlay}>
                    {alert && (
                        <View style={styles.container}>
                            <View style={[styles.icon, { backgroundColor: color }]}>
                                <Text style={styles.iconText}>
                                    {alert.type === 'success'
                                        ? '✓'
                                        : alert.type === 'warning'
                                            ? '!'
                                            : '×'}
                                </Text>
                            </View>

                            <Text style={styles.title}>{alert.title}</Text>
                            <Text style={styles.message}>{alert.message}</Text>

                            <Pressable
                                style={[styles.button, { backgroundColor: color }]}
                                onPress={closeAlert}
                            >
                                <Text style={styles.buttonText}>OK</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            </Modal>
        </AlertContext.Provider>
    );
}

export function useAppAlert() {
    const context = useContext(AlertContext);

    if (!context) {
        throw new Error('useAppAlert deve ser usado dentro de AppAlertProvider.');
    }

    return context;
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '82%',
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        padding: 25,
        alignItems: 'center',
    },
    icon: {
        width: 58,
        height: 58,
        borderRadius: 29,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconText: {
        color: '#FFFFFF',
        fontSize: 30,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 22,
    },
    button: {
        width: '100%',
        height: 45,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});