document.addEventListener("DOMContentLoaded", () => {
  // Simulação de dados do usuário
  const userData = {
    name: "matheus",
    isPremium: true,
    daysRemaining: 30,
  }

  // Atualizar nome do usuário
  const userNameElement = document.getElementById("userName")
  if (userNameElement) {
    userNameElement.textContent = userData.name
  }

  // Logout functionality
  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Tem certeza que deseja sair?")) {
        // Redirecionar para página inicial
        window.location.href = "index.html"
      }
    })
  }

  // Animação da barra de progresso
  const progressFills = document.querySelectorAll(".progress-fill")
  progressFills.forEach((fill) => {
    const width = fill.style.width
    fill.style.width = "0%"
    setTimeout(() => {
      fill.style.width = width
    }, 500)
  })

  // Notificações interativas
  const notificationItems = document.querySelectorAll(".notification-item")
  notificationItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remover classe 'new' ao clicar
      this.classList.remove("new")

      // Adicionar feedback visual
      this.style.transform = "scale(0.98)"
      setTimeout(() => {
        this.style.transform = ""
      }, 150)
    })
  })

  // Botões de suporte
  const supportButtons = document.querySelectorAll(".support-btn")
  supportButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const type = this.textContent.trim().toLowerCase()

      if (type.includes("whatsapp")) {
        // Abrir WhatsApp (substitua pelo número real)
        window.open("https://wa.me/5511999999999?text=Olá, preciso de ajuda com minha conta OnlyFlix", "_blank")
      } else if (type.includes("email")) {
        // Abrir cliente de email
        window.location.href =
          "mailto:suporte@onlyflix.com?subject=Suporte OnlyFlix&body=Olá, preciso de ajuda com minha conta."
      }
    })
  })

  // Atualizar contador de tempo da manutenção (simulação)
  function updateMaintenanceProgress() {
    const progressElement = document.querySelector(".maintenance-progress .progress-percentage")
    const progressBar = document.querySelector(".maintenance-progress .progress-fill")

    if (progressElement && progressBar) {
      let currentProgress = Number.parseInt(progressElement.textContent)

      // Simular progresso lento
      setInterval(() => {
        if (currentProgress < 100) {
          currentProgress += Math.random() * 0.5
          if (currentProgress > 100) currentProgress = 100

          progressElement.textContent = Math.floor(currentProgress) + "%"
          progressBar.style.width = currentProgress + "%"
        }
      }, 30000) // Atualizar a cada 30 segundos
    }
  }

  updateMaintenanceProgress()

  // Efeito de hover nas cards
  const cards = document.querySelectorAll(".status-card, .maintenance-card, .support-card, .notification-item")
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = ""
    })
  })

  // Adicionar efeito de loading inicial
  const dashboardContainer = document.querySelector(".dashboard-container")
  if (dashboardContainer) {
    dashboardContainer.style.opacity = "0"
    dashboardContainer.style.transform = "translateY(20px)"

    setTimeout(() => {
      dashboardContainer.style.transition = "all 0.5s ease"
      dashboardContainer.style.opacity = "1"
      dashboardContainer.style.transform = "translateY(0)"
    }, 100)
  }

  console.log("Dashboard OnlyFlix carregado com sucesso!")
})
