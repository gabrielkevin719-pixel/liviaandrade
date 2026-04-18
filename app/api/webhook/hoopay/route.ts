import { NextRequest, NextResponse } from 'next/server'

// Webhook para receber notificacoes do HooPay sobre pagamentos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('[HooPay Webhook] Recebido:', JSON.stringify(body, null, 2))

    const { id, status, amount, external_reference } = body

    // Verifica o status do pagamento
    if (status === 'paid' || status === 'completed' || status === 'approved' || status === 'confirmed') {
      // Pagamento confirmado!
      console.log(`[HooPay Webhook] Pagamento confirmado! ID: ${id}, Valor: ${amount}, Ref: ${external_reference}`)
      
      // Aqui voce pode:
      // 1. Atualizar o banco de dados
      // 2. Liberar acesso ao conteudo
      // 3. Enviar email de confirmacao
      // 4. Adicionar usuario ao grupo VIP
      
      // Exemplo: salvar no banco de dados (descomente quando tiver DB)
      // await db.payments.update({
      //   where: { id },
      //   data: { status: 'paid', paidAt: new Date() }
      // })
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('[HooPay Webhook Error]', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}

// Aceita requisicoes GET para verificacao do endpoint
export async function GET() {
  return NextResponse.json({ status: 'Webhook HooPay ativo' })
}
