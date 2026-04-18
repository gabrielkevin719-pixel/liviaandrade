import { NextRequest, NextResponse } from 'next/server'

const SYNCPAY_API_URL = 'https://api.syncpayments.com.br'
const CLIENT_ID = '2226426b-4177-4459-9d8e-06f245202191'
const CLIENT_SECRET = '0e2d04f3-413f-4089-a8c8-17f1b03deb32'

// Cache do token para evitar gerar novo a cada requisicao
let cachedToken: { token: string; expiresAt: number } | null = null

// Funcao para obter o token de autenticacao
async function getAuthToken(): Promise<string> {
  // Verifica se o token em cache ainda e valido (com margem de 5 minutos)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token
  }

  const response = await fetch(`${SYNCPAY_API_URL}/api/partner/v1/auth-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[SyncPay Auth Error]', errorText)
    throw new Error('Falha ao autenticar com SyncPay')
  }

  const data = await response.json()
  
  // Armazena o token em cache
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000)
  }

  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, name, email, cpf, phone } = body

    // Validacoes basicas
    if (!amount) {
      return NextResponse.json(
        { error: 'Valor do pagamento e obrigatorio.' },
        { status: 400 }
      )
    }

    // Limpa CPF e telefone
    const cpfClean = cpf?.replace(/\D/g, '') || '00000000000'
    const phoneClean = phone?.replace(/\D/g, '') || '11999999999'

    // Normaliza o valor (substitui virgula por ponto se necessario)
    const amountNormalized = String(amount).replace(',', '.')
    const amountValue = parseFloat(amountNormalized)

    // Obtem o token de autenticacao
    const authToken = await getAuthToken()

    // URL do webhook para receber notificacoes
    const webhookUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://liviaandrade.vercel.app'}/api/webhook/syncpay`

    // Monta o payload para a API do SyncPay
    const syncPayPayload = {
      amount: amountValue,
      description: 'Conteudo Exclusivo - Privacy',
      webhook_url: webhookUrl,
      client: {
        name: name || 'Cliente',
        cpf: cpfClean,
        email: email || 'cliente@email.com',
        phone: phoneClean
      }
    }

    // Faz a requisicao para gerar o PIX
    const response = await fetch(`${SYNCPAY_API_URL}/api/partner/v1/cash-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(syncPayPayload)
    })

    const responseText = await response.text()
    
    // Verifica se a resposta e HTML (erro)
    if (responseText.startsWith('<!DOCTYPE') || responseText.startsWith('<html')) {
      return NextResponse.json(
        { error: 'API retornou HTML em vez de JSON. Verifique a URL da API.' },
        { status: 500 }
      )
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      return NextResponse.json(
        { error: `Resposta invalida da API: ${responseText.substring(0, 200)}` },
        { status: 500 }
      )
    }

    if (!response.ok) {
      const errorMsg = data.message || data.error || 'Erro ao gerar PIX'
      console.error('[SyncPay Error]', data)
      return NextResponse.json(
        { error: errorMsg },
        { status: response.status }
      )
    }

    // Extrai os dados do PIX da resposta do SyncPay
    const pixCode = data.pix_code
    const identifier = data.identifier

    // Retorna os dados do PIX gerado
    return NextResponse.json({
      success: true,
      pix_code: pixCode,
      pix_qrcode: null, // SyncPay retorna o codigo PIX que serve como copia/cola e QR
      identifier: identifier,
      amount: amountValue,
      status: 'pending',
      message: 'PIX gerado com sucesso!'
    })

  } catch (error) {
    console.error('[PIX API Error]', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro interno ao processar pagamento.'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
