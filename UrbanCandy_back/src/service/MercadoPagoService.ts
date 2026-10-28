import { createHmac, timingSafeEqual } from 'node:crypto';
import { MercadoPagoConfig, MercadoPagoError, Payment, Preference } from 'mercadopago';
import { ApiException } from '../exception/ApiException.js';
import type { ICart } from '../@types/OrdersTypes.js';
import PaymentAttemptRepository from '../repositories/PaymentAttemptRepository.js';
import { type PaymentAttemptStatus } from '../models/PaymentAttempt.js';
import TypeOfDelivery from '../models/TypeOfDelivery.js';
import TypeOfPayment from '../models/TypeOfPayment.js';
import Users from '../models/Users.js';
import { priceCart } from './CartPricingService.js';
import { observeDependency } from '../observability/metrics.js';

type CheckoutRequest = {
  userId: number;
  peopleId: number;
  id_payment: number;
  id_type_delivery: number;
  paymentMethod: 'pix' | 'card' | 'both';
  cart: ICart;
};

function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new ApiException(
      'PAYMENT_GATEWAY_NOT_CONFIGURED',
      503,
      `A configuração ${name} não foi definida no backend.`
    );
  }
  return value;
}

export function validateAccessToken(
  accessToken: string,
  nodeEnvironment = process.env.NODE_ENV
): string {
  if (nodeEnvironment === 'production' && accessToken.startsWith('TEST-')) {
    throw new ApiException(
      'PAYMENT_PRODUCTION_CREDENTIAL_REQUIRED',
      503,
      'Configure a credencial de produção do Mercado Pago.'
    );
  }
  return accessToken;
}

function getMercadoPagoAccessToken(): string {
  return validateAccessToken(requireEnvironment('MERCADOPAGO_ACCESS_TOKEN'));
}

function getMercadoPagoClient(accessToken = getMercadoPagoAccessToken()): MercadoPagoConfig {
  return new MercadoPagoConfig({
    accessToken,
    options: { timeout: 10_000 },
  });
}

async function observeMercadoPago<T>(operation: () => Promise<T>): Promise<T> {
  const startedAt = performance.now();
  try {
    const result = await operation();
    observeDependency('mercado_pago', 'success', (performance.now() - startedAt) / 1_000);
    return result;
  } catch (error) {
    observeDependency('mercado_pago', 'failure', (performance.now() - startedAt) / 1_000);
    throw error;
  }
}

export function getCheckoutUrl(
  preference: { init_point?: string; sandbox_init_point?: string },
  accessToken: string
): string | undefined {
  return accessToken.startsWith('TEST-') ? preference.sandbox_init_point : preference.init_point;
}

function getCheckoutErrorDetails(error: unknown): Record<string, unknown> {
  if (error instanceof MercadoPagoError) {
    return {
      status: error.status,
      error: error.error,
      message: error.message,
      causes: error.causes.map((cause) => {
        if (!cause || typeof cause !== 'object') return String(cause);
        const details = cause as Record<string, unknown>;
        return {
          code: details.code,
          description: details.description,
        };
      }),
    };
  }

  return {
    message: error instanceof Error ? error.message : String(error),
  };
}

class MercadoPagoService {
  async createCheckout(input: CheckoutRequest): Promise<{
    attemptId: string;
    checkoutUrl: string;
    total: number;
  }> {
    const accessToken = getMercadoPagoAccessToken();
    const notificationUrl = process.env.MERCADOPAGO_WEBHOOK_URL?.trim();

    const paymentTypePromise = (async () => {
      if (input.paymentMethod === 'both') {
        const [gatewayPaymentType] = await TypeOfPayment.findOrCreate({
          where: { name_payment: 'Mercado Pago' },
          defaults: { name_payment: 'Mercado Pago' },
        });
        return gatewayPaymentType;
      }
      return TypeOfPayment.findByPk(input.id_payment);
    })();
    const [paymentType, deliveryType, user, trustedCart] = await Promise.all([
      paymentTypePromise,
      TypeOfDelivery.findByPk(input.id_type_delivery),
      Users.findByPk(input.userId, { attributes: ['email'] }),
      priceCart(input.cart),
    ]);
    if (!paymentType) {
      throw new ApiException('PAYMENT_METHOD_NOT_FOUND', 400, 'Forma de pagamento inválida.');
    }
    const normalizedPaymentName = paymentType.name_payment
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
    if (normalizedPaymentName.includes('dinheiro') || normalizedPaymentName.includes('cash')) {
      throw new ApiException(
        'INVALID_ONLINE_PAYMENT_METHOD',
        400,
        'Selecione Pix ou cartão para pagar pelo Mercado Pago.'
      );
    }
    if (
      (input.paymentMethod === 'pix' && !normalizedPaymentName.includes('pix')) ||
      (input.paymentMethod === 'card' &&
        !['cartao', 'credito', 'debito', 'card'].some((word) =>
          normalizedPaymentName.includes(word)
        ))
    ) {
      throw new ApiException(
        'PAYMENT_METHOD_MISMATCH',
        400,
        'A forma escolhida não corresponde ao tipo de pagamento solicitado.'
      );
    }
    if (!deliveryType) {
      throw new ApiException('DELIVERY_NOT_FOUND', 400, 'Tipo de entrega inválido.');
    }
    if (!user?.email) {
      throw new ApiException('USER_NOT_FOUND', 404, 'Usuário não encontrado.');
    }

    const attempt = await PaymentAttemptRepository.create({
      userId: input.userId,
      peopleId: input.peopleId,
      paymentId: paymentType.id_payment,
      deliveryId: input.id_type_delivery,
      items: trustedCart.items.map((item) => ({
        id_product: item.id_product,
        quantity: item.quantity,
        unit_price: item.products?.price ?? 0,
        sub_total: item.sub_total,
        name: item.products?.name ?? '',
      })),
      total: trustedCart.total,
    });

    try {
      const preference = new Preference(getMercadoPagoClient(accessToken));
      const excludedPaymentTypes =
        input.paymentMethod === 'pix'
          ? ['credit_card', 'debit_card', 'prepaid_card', 'ticket', 'atm', 'digital_currency']
          : input.paymentMethod === 'card'
            ? ['bank_transfer', 'ticket', 'atm']
            : [];
      const response = await observeMercadoPago(() =>
        preference.create({
          body: {
            external_reference: attempt.id,
            ...(notificationUrl ? { notification_url: notificationUrl } : {}),
            payer: { email: user.email },
            items: trustedCart.items.map((item) => ({
              id: String(item.id_product),
              title: item.products?.name ?? `Produto ${item.id_product}`,
              quantity: item.quantity,
              unit_price: item.products?.price ?? 0,
              currency_id: 'BRL',
            })),
            payment_methods: {
              installments: 3,
              ...(excludedPaymentTypes.length > 0
                ? { excluded_payment_types: excludedPaymentTypes.map((id) => ({ id })) }
                : {}),
            },
          },
          requestOptions: { idempotencyKey: attempt.id },
        })
      );
      const checkoutUrl = getCheckoutUrl(response, accessToken);
      if (!response.id || !checkoutUrl) {
        throw new Error('Mercado Pago não retornou o link da preferência.');
      }
      await PaymentAttemptRepository.setPreference(attempt.id, response.id);
      return { attemptId: attempt.id, checkoutUrl, total: trustedCart.total };
    } catch (error) {
      await attempt.update({ status: 'failed' });
      console.error(
        '[payment] Falha ao criar checkout Mercado Pago:',
        getCheckoutErrorDetails(error)
      );
      throw new ApiException(
        'PAYMENT_CHECKOUT_FAILED',
        502,
        'Não foi possível iniciar o pagamento. Tente novamente.'
      );
    }
  }

  async getStatus(attemptId: string, userId: number) {
    let attempt = await PaymentAttemptRepository.findOwnedByUser(attemptId, userId);
    if (!attempt) {
      throw new ApiException('PAYMENT_ATTEMPT_NOT_FOUND', 404, 'Pagamento não encontrado.');
    }
    if (attempt.status === 'pending' && attempt.preference_id) {
      const currentAttemptId = attempt.id;
      const results = await observeMercadoPago(() =>
        new Payment(getMercadoPagoClient()).search({
          options: {
            external_reference: currentAttemptId,
            sort: 'date_created',
            criteria: 'desc',
            limit: 1,
          },
        })
      );
      const paymentId = results.results?.[0]?.id;
      if (paymentId) {
        await this.processProviderPayment(String(paymentId), currentAttemptId);
        const refreshedAttempt = await PaymentAttemptRepository.findOwnedByUser(attemptId, userId);
        if (!refreshedAttempt) {
          throw new ApiException(
            'PAYMENT_ATTEMPT_NOT_FOUND',
            404,
            'Pagamento não encontrado após sincronizar o status.'
          );
        }
        attempt = refreshedAttempt;
      }
    }
    return {
      id: attempt.id,
      status: attempt.status,
      id_order: attempt.id_order,
      total: Number(attempt.total),
    };
  }

  async receiveWebhook(
    payload: unknown,
    queryId: unknown,
    signatureHeader: string | undefined,
    requestId: string | undefined
  ): Promise<void> {
    const paymentId =
      typeof queryId === 'string'
        ? queryId
        : payload &&
            typeof payload === 'object' &&
            'data' in payload &&
            typeof payload.data === 'object' &&
            payload.data &&
            'id' in payload.data
          ? String(payload.data.id)
          : '';

    if (!paymentId || !signatureHeader || !requestId) {
      throw new ApiException('INVALID_PAYMENT_WEBHOOK', 400, 'Notificação de pagamento inválida.');
    }

    const secret = requireEnvironment('MERCADOPAGO_WEBHOOK_SECRET');
    if (!verifyWebhookSignature(paymentId, requestId, signatureHeader, secret)) {
      throw new ApiException('INVALID_PAYMENT_SIGNATURE', 401, 'Assinatura inválida.');
    }

    await this.processProviderPayment(paymentId);
  }

  private async processProviderPayment(
    paymentId: string,
    expectedAttemptId?: string
  ): Promise<void> {
    const payment = await observeMercadoPago(() =>
      new Payment(getMercadoPagoClient()).get({ id: paymentId })
    );
    if (!payment.external_reference) {
      console.warn(`[payment] Pagamento ${paymentId} sem referência externa; ignorado.`);
      return;
    }

    if (expectedAttemptId && payment.external_reference !== expectedAttemptId) {
      throw new ApiException(
        'PAYMENT_REFERENCE_MISMATCH',
        400,
        'O pagamento não corresponde a esta tentativa.'
      );
    }

    const attempt = await PaymentAttemptRepository.findById(payment.external_reference);
    if (!attempt) {
      console.warn(`[payment] Tentativa ${payment.external_reference} não encontrada.`);
      return;
    }

    if (
      payment.currency_id !== 'BRL' ||
      Math.round(Number(payment.transaction_amount) * 100) !==
        Math.round(Number(attempt.total) * 100)
    ) {
      throw new ApiException(
        'PAYMENT_AMOUNT_MISMATCH',
        400,
        'O valor confirmado não corresponde ao pedido.'
      );
    }

    const status = mapProviderStatus(payment.status);
    const result = await PaymentAttemptRepository.applyProviderStatus(
      attempt.id,
      String(payment.id),
      status
    );
    console.info(
      `[payment] Webhook processado: attempt=${attempt.id} payment=${payment.id} ` +
        `status=${result.status} order=${result.orderId ?? 'pending'}`
    );
  }
}

function mapProviderStatus(status: string | undefined): PaymentAttemptStatus {
  if (status === 'approved') return 'approved';
  if (status === 'rejected') return 'rejected';
  if (status === 'cancelled' || status === 'refunded' || status === 'charged_back') {
    return 'cancelled';
  }
  return 'pending';
}

export function verifyWebhookSignature(
  paymentId: string,
  requestId: string,
  signature: string,
  secret: string
): boolean {
  const values = Object.fromEntries(
    signature.split(',').map((part) => {
      const [key, ...value] = part.trim().split('=');
      return [key, value.join('=')];
    })
  );
  if (!values.ts || !values.v1) return false;

  const manifest = `id:${paymentId.toLowerCase()};request-id:${requestId};ts:${values.ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest();
  let received: Buffer;
  try {
    received = Buffer.from(values.v1, 'hex');
  } catch {
    return false;
  }
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export default new MercadoPagoService();
