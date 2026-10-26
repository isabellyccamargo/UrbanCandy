export function verificationEmail(code: string) {
  return {
    subject: 'Confirme seu e-mail - UrbanCandy',
    text: `Seu código de confirmação do UrbanCandy é ${code}. Ele expira em 15 minutos.`,
  };
}

export function orderStatusEmail(orderId: number, status: string) {
  return {
    subject: `Atualização do pedido #${orderId} - UrbanCandy`,
    text: `O status do seu pedido #${orderId} foi atualizado para: ${status}.`,
  };
}
