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

  // Carregar dados do usuário
  loadUserData()

  function loadUserData() {
    const userData = getUserData()

    if (userData) {
      // Atualizar texto de boas-vindas
      const welcomeText = document.getElementById("welcomeText")
      welcomeText.textContent = `Bem-vindo, ${userData.fullName.split(" ")[0]}!`

      // Atualizar tempo de registro
      const registrationTime = document.getElementById("registrationTime")
      const regDate = new Date(userData.registrationDate)
      registrationTime.textContent = formatTimeAgo(regDate)

      // Verificar status do telefone
      const phoneStatus = document.getElementById("phoneStatus")
      if (!userData.phoneVerified) {
        phoneStatus.classList.remove("completed")
        phoneStatus.classList.add("pending")
        phoneStatus.querySelector("h4").textContent = "Telefone Pendente"
        phoneStatus.querySelector("p").textContent = "Verificação necessária"
        phoneStatus.querySelector("i").className = "fas fa-exclamation-triangle"

        // Mostrar aviso
        setTimeout(() => {
          toastr.warning("Seu telefone ainda não foi verificado!")
        }, 1000)
      }

      console.log("Dados do usuário carregados:", userData)
    } else {
      // Se não há dados, redirecionar
      toastr.error("Sessão expirada. Redirecionando...")
      setTimeout(() => {
        window.location.href = "index.html"
      }, 2000)
    }
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

  function formatTimeAgo(date) {
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return "Agora"
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h atrás`
    return `${Math.floor(diffInMinutes / 1440)} dias atrás`
  }

  // Função global para logout
  window.logout = () => {
    if (confirm("Tem certeza que deseja sair?")) {
      localStorage.removeItem("papibet_user")
      document.cookie = "papibet_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      toastr.success("Logout realizado com sucesso!")
      setTimeout(() => {
        window.location.href = "index.html"
      }, 1000)
    }
  }

  // Animações e efeitos
  const statCards = document.querySelectorAll(".stat-card")
  statCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = "0"
      card.style.transform = "translateY(20px)"
      card.style.transition = "all 0.6s ease"

      setTimeout(() => {
        card.style.opacity = "1"
        card.style.transform = "translateY(0)"
      }, 100)
    }, index * 200)
  })

  // Verificar status do sistema periodicamente
  setInterval(() => {
    console.log("Verificando status do sistema...")
    // Aqui você pode fazer uma requisição para verificar se o sistema saiu de manutenção
  }, 30000)
})
