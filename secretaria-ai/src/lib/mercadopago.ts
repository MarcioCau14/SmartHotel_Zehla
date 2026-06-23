import * as mercadopago from 'mercadopago';  
import { MP_ACCESS_TOKEN } from '@/lib/env';

let mpClient: mercadopago.MercadoPagoConfig | null = null;

export function getMercadoPagoClient() {  
  if (mpClient) return mpClient;

  const token = MP_ACCESS_TOKEN;  
  if (!token || token === 'TEST-xxxxx-seu-access-token-aqui') {  
    throw new Error('Mercado Pago access token not configured');  
  }

  mpClient = new mercadopago.MercadoPagoConfig({ accessToken: token });  
  return mpClient;  
}

export async function createPixPayment(params: {  
  amount: number;  
  email: string;  
  firstName: string;  
  lastName: string;  
  cpf?: string;  
  description: string;  
  externalRef: string;  
}) {  
  const client = getMercadoPagoClient();  
  const payment = new mercadopago.Payment(client);

  const body = {  
    transaction_amount: params.amount,  
    description: params.description,  
    payment_method_id: 'pix',  
    payer: {  
      email: params.email,  
      first_name: params.firstName,  
      last_name: params.lastName,  
      identification: params.cpf ? { type: 'CPF', number: params.cpf } : undefined,  
    },  
    external_reference: params.externalRef,  
  };

  const result = await payment.create({ body });  
  return result;  
}

export async function getPayment(id: string) {  
  const client = getMercadoPagoClient();  
  const payment = new mercadopago.Payment(client);  
  return payment.get({ id });  
}
