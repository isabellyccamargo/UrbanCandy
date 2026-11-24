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

export function orderCreatedEmail(orderId: number, total: number) {
  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(total);
  return {
    subject: `Pedido #${orderId} recebido - UrbanCandy`,
    text: `Recebemos seu pedido #${orderId}, no valor de ${formattedTotal}. Você receberá novas atualizações quando o status mudar.`,
  };
}
