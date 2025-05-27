document.addEventListener("DOMContentLoaded", () => {
  // Configuração do Toastr
  const toastr = window.toastr
  toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: true,
    progressBar: true,
    positionClass: "toast-top-right",
    preventDuplicates: false,
    onclick: null,
    showDuration: "300",
    hideDuration: "1000",
    timeOut: "5000",
    extendedTimeOut: "1000",
    showEasing: "swing",
    hideEasing: "linear",
    showMethod: "fadeIn",
    hideMethod: "fadeOut",
  }

  // Elementos DOM
  const phoneVerificationForm = document.getElementById("phoneVerificationForm")
  const smsCodeForm = document.getElementById("smsCodeForm")
  const smsCodeSection = document.getElementById("smsCodeSection")
  const phoneConfirmInput = document.getElementById("phoneConfirm")
  const sendCodeBtn = document.getElementById("sendCodeBtn")
  const verifyCodeBtn = document.getElementById("verifyCodeBtn")
  const resendBtn = document.getElementById("resendBtn")
  const countdownSpan = document.getElementById("countdown")
  const phoneDisplay = document.getElementById("phoneDisplay")
  const codeDigits = document.querySelectorAll(".code-digit")
  const verificationSuccessModal = document.getElementById("verificationSuccessModal")

  // Variáveis de controle
  let countdownTimer
  let generatedCode = ""
  let userData = null

  // Importar jQuery para usar a máscara
  const $ = window.$

  // Aplicar máscara no telefone
  $("#phoneConfirm").mask("(00) 00000-0000")

  // Carregar dados do usuário
  loadUserData()

  // Event Listeners
  phoneVerificationForm.addEventListener("submit", handlePhoneVerification)
  smsCodeForm.addEventListener("submit", handleCodeVerification)
  resendBtn.addEventListener("click", resendCode)

  // Configurar inputs do código
  setupCodeInputs()

  function loadUserData() {
    // Carregar dados do localStorage
    const storedUser = getUserData()

    if (storedUser) {
      userData = storedUser

      // Atualizar interface com dados do usuário
      document.getElementById("userName").textContent = userData.fullName
      document.getElementById("userPhone").textContent = formatPhone(userData.phone)

      // Pré-preencher o campo de telefone
      phoneConfirmInput.value = formatPhone(userData.phone)
    } else {
      // Se não há dados, redirecionar para o cadastro
      toastr.error("Dados do usuário não encontrados. Redirecionando...")
      setTimeout(() => {
        window.location.href = "index.html"
      }, 2000)
    }
  }

  function handlePhoneVerification(e) {
    e.preventDefault()

    const phoneConfirm = phoneConfirmInput.value.replace(/\D/g, "")
    const originalPhone = userData.phone.replace(/\D/g, "")

    // Verificar se o telefone confere
    if (phoneConfirm !== originalPhone) {
      toastr.error("O número digitado não confere com o cadastrado.")
      phoneConfirmInput.focus()
      return
    }

    // Mostrar loading
    sendCodeBtn.disabled = true
    sendCodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENVIANDO...'

    // Enviar código via Z-API
    sendSMSCode(phoneConfirm)
  }

  async function sendSMSCode(phone) {
    try {
      // Gerar código de 6 dígitos
      generatedCode = Math.floor(100000 + Math.random() * 900000).toString()

      // Configuração da Z-API (credenciais reais)
      const zapiConfig = {
        instanceId: "3E021D9318E4D0A86B7D4E20A388CB1E",
        token: "1265C91C4F6281A641150324",
        phone: phone,
        message: `🎰 Papi Bet - Seu código de verificação é: ${generatedCode}\n\nNão compartilhe este código com ninguém.\n\nVálido por 10 minutos.`,
      }

      console.log("Enviando SMS via Z-API para:", phone)
      console.log("Código gerado:", generatedCode)

      // Tentar enviar via Z-API
      const response = await sendZAPIMessage(zapiConfig)

      if (response.success) {
        // Sucesso no envio
        toastr.success("Código enviado com sucesso via WhatsApp!")
        showSMSCodeSection()
      } else {
        // Erro no envio
        console.error("Erro na Z-API:", response.error)
        toastr.error("Erro ao enviar código. Tente novamente.")

        // Em caso de erro, ainda mostrar a seção para teste
        toastr.info(`Código para teste: ${generatedCode}`)
        showSMSCodeSection()
      }
    } catch (error) {
      console.error("Erro ao enviar SMS:", error)
      toastr.error("Erro de conexão. Tente novamente.")

      // Em caso de erro, ainda mostrar a seção para teste
      toastr.info(`Código para teste: ${generatedCode}`)
      showSMSCodeSection()
    }

    // Resetar botão
    sendCodeBtn.disabled = false
    sendCodeBtn.innerHTML = '<i class="fas fa-paper-plane"></i> ENVIAR CÓDIGO SMS'
  }

  async function sendZAPIMessage(config) {
    try {
      const response = await fetch(
        `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}/send-text`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: `55${config.phone}`, // Adiciona código do Brasil
            message: config.message,
          }),
        },
      )

      const data = await response.json()
      console.log("Resposta Z-API:", data)

      if (response.ok) {
        return { success: true, data: data }
      } else {
        return { success: false, error: data }
      }
    } catch (error) {
      console.error("Erro na requisição Z-API:", error)
      return { success: false, error: error.message }
    }
  }

  function showSMSCodeSection() {
    // Mostrar seção do código
    smsCodeSection.style.display = "block"
    phoneDisplay.textContent = formatPhone(userData.phone)

    // Focar no primeiro input
    codeDigits[0].focus()

    // Iniciar countdown
    startCountdown()

    // Scroll suave para a seção
    smsCodeSection.scrollIntoView({ behavior: "smooth" })
  }

  function setupCodeInputs() {
    codeDigits.forEach((input, index) => {
      input.addEventListener("input", (e) => {
        const value = e.target.value

        // Permitir apenas números
        if (!/^\d$/.test(value)) {
          e.target.value = ""
          return
        }

        // Adicionar classe de preenchido
        e.target.classList.add("filled")

        // Mover para o próximo input
        if (value && index < codeDigits.length - 1) {
          codeDigits[index + 1].focus()
        }

        // Verificar se todos os campos estão preenchidos
        checkCodeComplete()
      })

      input.addEventListener("keydown", (e) => {
        // Backspace - voltar para o input anterior
        if (e.key === "Backspace" && !e.target.value && index > 0) {
          codeDigits[index - 1].focus()
          codeDigits[index - 1].classList.remove("filled")
        }
      })

      input.addEventListener("paste", (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "")

        if (pastedData.length === 6) {
          // Preencher todos os campos
          for (let i = 0; i < 6; i++) {
            if (codeDigits[i]) {
              codeDigits[i].value = pastedData[i]
              codeDigits[i].classList.add("filled")
            }
          }
          checkCodeComplete()
        }
      })
    })
  }

  function checkCodeComplete() {
    const code = Array.from(codeDigits)
      .map((input) => input.value)
      .join("")
    verifyCodeBtn.disabled = code.length !== 6
  }

  function handleCodeVerification(e) {
    e.preventDefault()

    const enteredCode = Array.from(codeDigits)
      .map((input) => input.value)
      .join("")

    // Mostrar loading
    verifyCodeBtn.disabled = true
    verifyCodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> VERIFICANDO...'

    // Simular verificação
    setTimeout(() => {
      if (enteredCode === generatedCode || enteredCode === "123456") {
        // 123456 para teste
        // Código correto
        userData.phoneVerified = true
        userData.verificationDate = new Date().toISOString()

        // Salvar dados atualizados
        saveUserData(userData)

        toastr.success("Telefone verificado com sucesso!")

        // Mostrar modal de sucesso
        setTimeout(() => {
          verificationSuccessModal.style.display = "flex"
        }, 500)
      } else {
        // Código incorreto
        toastr.error("Código incorreto. Tente novamente.")

        // Limpar campos e focar no primeiro
        codeDigits.forEach((input) => {
          input.value = ""
          input.classList.remove("filled")
        })
        codeDigits[0].focus()
      }

      // Resetar botão
      verifyCodeBtn.disabled = false
      verifyCodeBtn.innerHTML = '<i class="fas fa-check-circle"></i> VERIFICAR CÓDIGO'
    }, 2000)
  }

  function startCountdown() {
    let seconds = 60
    resendBtn.disabled = true

    countdownTimer = setInterval(() => {
      seconds--
      countdownSpan.textContent = seconds

      if (seconds <= 0) {
        clearInterval(countdownTimer)
        resendBtn.disabled = false
        resendBtn.innerHTML = "Reenviar código"
      }
    }, 1000)
  }

  function resendCode() {
    // Limpar countdown anterior
    if (countdownTimer) {
      clearInterval(countdownTimer)
    }

    // Reenviar código
    const phone = userData.phone.replace(/\D/g, "")
    sendSMSCode(phone)

    toastr.info("Reenviando código...")
  }

  function formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, "")
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/)

    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }

    return phone
  }

  // Funções auxiliares para dados do usuário
  function saveUserData(userData) {
    // Salvar no localStorage
    localStorage.setItem("papibet_user", JSON.stringify(userData))

    // Salvar em cookie com encoding adequado
    const expires = new Date()
    expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 ano
    const encodedData = encodeURIComponent(JSON.stringify(userData))
    document.cookie = `papibet_user=${encodedData}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`

    console.log("Dados salvos na verificação:", userData)
  }

  function getUserData() {
    // Tentar pegar do localStorage primeiro
    const localData = localStorage.getItem("papibet_user")
    if (localData) {
      try {
        return JSON.parse(localData)
      } catch (e) {
        console.error("Erro ao parsear localStorage:", e)
      }
    }

    // Se não encontrar, tentar pegar do cookie
    const cookies = document.cookie.split(";")
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=")
      if (name === "papibet_user" && value) {
        try {
          return JSON.parse(decodeURIComponent(value))
        } catch (e) {
          console.error("Erro ao parsear cookie:", e)
        }
      }
    }

    return null
  }

  // Fechar modal ao clicar fora
  window.addEventListener("click", (e) => {
    if (e.target === verificationSuccessModal) {
      verificationSuccessModal.style.display = "none"
    }
  })
})
