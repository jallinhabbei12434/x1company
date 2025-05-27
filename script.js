document.addEventListener("DOMContentLoaded", () => {
  // Import Toastr and jQuery
  const toastr = window.toastr
  const $ = window.$

  // Configuração do Toastr
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
  const menuToggle = document.getElementById("menuToggle")
  const closeMenu = document.getElementById("closeMenu")
  const sideMenu = document.getElementById("sideMenu")
  const menuOverlay = document.getElementById("menuOverlay")

  // Botões de autenticação
  const loginBtn = document.getElementById("loginBtn")
  const registerBtn = document.getElementById("registerBtn")

  // Modais
  const loginModal = document.getElementById("loginModal")
  const registerModal = document.getElementById("registerModal")
  const successModal = document.getElementById("successModal")

  // Botões de fechar modais
  const closeLoginModal = document.getElementById("closeLoginModal")
  const closeRegisterModal = document.getElementById("closeRegisterModal")
  const closeSuccessModal = document.getElementById("closeSuccessModal")

  // Botões de troca entre modais
  const switchToRegister = document.getElementById("switchToRegister")
  const switchToLogin = document.getElementById("switchToLogin")

  // Formulários
  const loginForm = document.getElementById("loginForm")
  const registerForm = document.getElementById("registerForm")

  // Botão de começar a jogar
  const startPlaying = document.getElementById("startPlaying")

  // Elementos clicáveis
  const clickableItems = document.querySelectorAll(".clickable-item")

  // Indicadores do carrossel
  const indicators = document.querySelectorAll(".indicator")
  const bannerSlides = document.querySelectorAll(".banner-slide")

  // Aplicar máscaras nos campos
  $("#cpf, #loginCpf").mask("000.000.000-00")
  $("#phone, #loginPhone").mask("(00) 00000-0000")

  // Menu lateral
  menuToggle.addEventListener("click", () => {
    sideMenu.classList.add("active")
    menuOverlay.classList.add("active")
    document.body.style.overflow = "hidden"
  })

  closeMenu.addEventListener("click", closeMenuFunction)
  menuOverlay.addEventListener("click", closeMenuFunction)

  function closeMenuFunction() {
    sideMenu.classList.remove("active")
    menuOverlay.classList.remove("active")
    document.body.style.overflow = ""
  }

  // Abrir modais de autenticação
  loginBtn.addEventListener("click", () => {
    openModal(loginModal)
  })

  registerBtn.addEventListener("click", () => {
    openModal(registerModal)
  })

  // Fechar modais
  closeLoginModal.addEventListener("click", () => {
    closeModal(loginModal)
  })

  closeRegisterModal.addEventListener("click", () => {
    closeModal(registerModal)
  })

  closeSuccessModal.addEventListener("click", () => {
    closeModal(successModal)
  })

  // Trocar entre modais
  switchToRegister.addEventListener("click", (e) => {
    e.preventDefault()
    closeModal(loginModal)
    setTimeout(() => openModal(registerModal), 300)
  })

  switchToLogin.addEventListener("click", (e) => {
    e.preventDefault()
    closeModal(registerModal)
    setTimeout(() => openModal(loginModal), 300)
  })

  // Elementos clicáveis abrem modal de cadastro
  clickableItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault()

      // Verificar se o usuário já está logado
      const userData = getUserData()
      if (userData) {
        toastr.info("Você já está logado! Aproveite os jogos.")
        return
      }

      // Mostrar mensagem motivacional e abrir modal de cadastro
      const messages = [
        "Cadastre-se agora e ganhe R$50 de bônus!",
        "Não perca essa oportunidade! Bônus exclusivo te esperando!",
        "Crie sua conta e comece a ganhar agora mesmo!",
        "Bônus de R$50 + 100 rodadas grátis! Cadastre-se já!",
      ]

      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      toastr.info(randomMessage)

      setTimeout(() => {
        openModal(registerModal)
      }, 1000)
    })
  })

  // Formulário de login
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const cpf = document.getElementById("loginCpf").value
    const phone = document.getElementById("loginPhone").value

    if (!validateCPF(cpf)) {
      showError("loginCpf", "CPF inválido")
      return
    }

    if (!validatePhone(phone)) {
      showError("loginPhone", "Telefone inválido")
      return
    }

    // Verificar se o usuário existe
    const userData = getUserData()
    const cleanCpf = cpf.replace(/\D/g, "")
    const cleanPhone = phone.replace(/\D/g, "")

    if (userData && userData.cpf === cleanCpf && userData.phone === cleanPhone) {
      toastr.success("Login realizado com sucesso!")
      closeModal(loginModal)
      updateUIForLoggedUser(userData)
    } else {
      toastr.error("Usuário não encontrado. Verifique seus dados ou cadastre-se.")
    }
  })

  // Formulário de cadastro
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const fullName = document.getElementById("fullName").value
    const email = document.getElementById("email").value
    const phone = document.getElementById("phone").value
    const ageConfirm = document.getElementById("ageConfirm").checked
    const terms = document.getElementById("terms").checked

    // Validações
    if (!fullName.trim()) {
      showError("fullName", "Nome completo é obrigatório")
      return
    }

    if (!validateEmail(email)) {
      showError("email", "Email inválido")
      return
    }

    if (!validatePhone(phone)) {
      showError("phone", "Telefone inválido")
      return
    }

    if (!ageConfirm) {
      toastr.error("Você deve confirmar que tem mais de 18 anos")
      return
    }

    if (!terms) {
      toastr.error("Você deve aceitar os termos e condições")
      return
    }

    // Verificar se email já está cadastrado
    const existingUser = getUserData()

    if (existingUser && existingUser.email === email.toLowerCase()) {
      toastr.error("Email já cadastrado. Faça login ou use outro email.")
      return
    }

    // Salvar dados do usuário
    const userData = {
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      phone: phone.replace(/\D/g, ""),
      registrationDate: new Date().toISOString(),
      bonusReceived: true,
      bonusAmount: 50.0,
      freeSpins: 100,
      phoneVerified: false,
    }

    saveUserData(userData)
    saveToDatabase(userData)

    closeModal(registerModal)
    setTimeout(() => {
      openModal(successModal)
    }, 500)

    toastr.success("Cadastro realizado com sucesso!")
  })

  // Começar a jogar
  // Botão de ir para verificação
  const goToVerification = document.getElementById("goToVerification")
  if (goToVerification) {
    goToVerification.addEventListener("click", () => {
      window.location.href = "verificacao.html"
    })
  }

  // Carrossel de banners
  let currentSlide = 0

  function showSlide(index) {
    bannerSlides.forEach((slide) => slide.classList.remove("active"))
    indicators.forEach((indicator) => indicator.classList.remove("active"))

    bannerSlides[index].classList.add("active")
    indicators[index].classList.add("active")

    currentSlide = index
  }

  function nextSlide() {
    const nextIndex = (currentSlide + 1) % bannerSlides.length
    showSlide(nextIndex)
  }

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      showSlide(index)
    })
  })

  // Carrossel automático
  setInterval(nextSlide, 5000)

  // Verificar se usuário já está logado ao carregar a página
  const userData = getUserData()
  if (userData) {
    updateUIForLoggedUser(userData)

    // Verificar se o telefone não foi verificado
    if (!userData.phoneVerified) {
      setTimeout(() => {
        toastr.warning("Você precisa verificar seu telefone para continuar!")
        setTimeout(() => {
          if (confirm("Seu telefone ainda não foi verificado. Deseja verificar agora?")) {
            window.location.href = "verificacao.html"
          }
        }, 2000)
      }, 1000)
    }
  }

  // Funções auxiliares
  function openModal(modal) {
    modal.style.display = "flex"
    document.body.style.overflow = "hidden"
  }

  function closeModal(modal) {
    modal.style.display = "none"
    document.body.style.overflow = ""
    clearErrors()
  }

  function showError(fieldId, message) {
    const field = document.getElementById(fieldId)
    field.classList.add("error")

    // Remover mensagem de erro anterior
    const existingError = field.parentNode.querySelector(".error-message")
    if (existingError) {
      existingError.remove()
    }

    // Adicionar nova mensagem de erro
    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.textContent = message
    field.parentNode.appendChild(errorDiv)

    toastr.error(message)
  }

  function clearErrors() {
    const errorFields = document.querySelectorAll(".error")
    const errorMessages = document.querySelectorAll(".error-message")

    errorFields.forEach((field) => field.classList.remove("error"))
    errorMessages.forEach((message) => message.remove())
  }

  function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, "")

    if (cpf.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cpf)) return false

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += Number.parseInt(cpf.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== Number.parseInt(cpf.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += Number.parseInt(cpf.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== Number.parseInt(cpf.charAt(10))) return false

    return true
  }

  function validatePhone(phone) {
    const cleanPhone = phone.replace(/\D/g, "")
    return cleanPhone.length === 11 && cleanPhone.charAt(2) === "9"
  }

  function validateAge(birthDate) {
    const today = new Date()
    const birth = new Date(birthDate)
    const age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18
    }

    return age >= 18
  }

  function saveUserData(userData) {
    // Salvar no localStorage
    localStorage.setItem("papibet_user", JSON.stringify(userData))

    // Salvar em cookie com encoding adequado
    const expires = new Date()
    expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 ano
    const encodedData = encodeURIComponent(JSON.stringify(userData))
    document.cookie = `papibet_user=${encodedData}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`

    console.log("Dados salvos:", userData)
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

  function saveToDatabase(userData) {
    // Simular salvamento em "banco de dados" local
    let database = []

    // Tentar carregar dados existentes
    const existingData = localStorage.getItem("papibet_database")
    if (existingData) {
      database = JSON.parse(existingData)
    }

    // Adicionar novo usuário
    database.push(userData)

    // Salvar de volta
    localStorage.setItem("papibet_database", JSON.stringify(database))

    console.log("Usuário salvo no banco de dados local:", userData)
    console.log("Total de usuários cadastrados:", database.length)
  }

  function updateUIForLoggedUser(userData) {
    // Atualizar botões de autenticação
    const authButtons = document.querySelector(".auth-buttons")
    authButtons.innerHTML = `
            <span style="color: #4dff4d; font-size: 12px;">Olá, ${userData.fullName.split(" ")[0]}!</span>
            <button class="btn-register" onclick="logout()">SAIR</button>
        `

    // Atualizar banner de promoção
    const promoBanner = document.querySelector(".promo-banner p")
    promoBanner.innerHTML = `🎉 Bem-vindo, ${userData.fullName.split(" ")[0]}! Seu bônus de R$${userData.bonusAmount} está disponível! 🎉`
  }

  // Função global para logout
  window.logout = () => {
    localStorage.removeItem("papibet_user")
    document.cookie = "papibet_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    location.reload()
  }

  // Fechar modais ao clicar fora
  window.addEventListener("click", (e) => {
    if (e.target === loginModal) closeModal(loginModal)
    if (e.target === registerModal) closeModal(registerModal)
    if (e.target === successModal) closeModal(successModal)
  })

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
})
