export function getApiErrorMessage(
    error: any,
    fallback = 'Não foi possível realizar esta ação.'
) {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.mensagem ||
        error?.message ||
        fallback
    );
}