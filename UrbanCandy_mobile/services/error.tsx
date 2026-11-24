export function getApiErrorMessage(
    error: any,
    fallback = 'Não foi possível realizar esta ação.'
) {
    if (error?.response?.data?.code === 'PAYMENT_GATEWAY_NOT_CONFIGURED') {
        return 'O pagamento online ainda não está configurado no servidor. Configure MERCADOPAGO_ACCESS_TOKEN no .env do backend e reinicie a API. Não coloque esse token no aplicativo mobile.';
    }

    return (
        error?.response?.data?.message ||
        error?.response?.data?.mensagem ||
        error?.message ||
        fallback
    );
}