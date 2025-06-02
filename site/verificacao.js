document.addEventListener("DOMContentLoaded", () => {
  /* ------------------------------------------------------------------
   * Funções de storage
   * -----------------------------------------------------------------*/
  function getStorage(name) {
    try {
      let v = localStorage.getItem(name);
      if (v) return v;
      return sessionStorage.getItem(name);
    } catch (err) {
      console.error("Erro ao ler storage:", err);
      return null;
    }
  }

  function setStorage(n, v) {
    try {
      localStorage.setItem(n, v);
      sessionStorage.setItem(n, v);
    } catch (err) {
      console.error("Erro ao salvar storage:", err);
    }
  }

  function removeStorage(name) {
    try {
      localStorage.removeItem(name);
      sessionStorage.removeItem(name);
    } catch (error) {
      console.error("Erro ao remover do storage:", error);
    }
  }

  /* ------------------------------------------------------------------
   * Função de alerta customizado
   * -----------------------------------------------------------------*/
  function showCustomAlert(msg, type = "error") {
    document.querySelectorAll(".custom-alert").forEach((a) => a.remove());
    const alert = document.createElement("div");
    alert.className = `modal custom-alert ${type}-alert`;
    alert.style.display = "flex";
    const icon = { error: "exclamation-triangle", success: "check-circle", info: "info-circle" }[type];
    const title = { error: "Atenção", success: "Sucesso!", info: "Informação" }[type];
    alert.innerHTML = `
      <div class="modal-content alert-content">
        <div class="modal-header ${type}-header">
          <div class="alert-header-icon"><i class="fas fa-${icon}"></i></div>
          <h2>${title}</h2>
        </div>
        <div class="modal-body alert-body">
          <p>${msg}</p>
          <button class="alert-btn ${type}-btn" onclick="window.location.href='index.html'">
            <i class="fas fa-check"></i> ENTENDI
          </button>
        </div>
      </div>`;
    document.body.appendChild(alert);
  }

  /* ------------------------------------------------------------------
   * Checagens iniciais de acesso
   * -----------------------------------------------------------------*/
  const tempUserData = getStorage("tempUserData");
  const accessAllowed = getStorage("accessAllowed");
  const registrationStep = getStorage("registrationStep");

  if (!tempUserData && !accessAllowed) {
    showCustomAlert("Acesso negado. Faça o cadastro primeiro.", "error");
    setTimeout(() => (window.location.href = "index.html"), 3000);
    return;
  }

  let userData = {};
  if (tempUserData) {
    try {
      userData = JSON.parse(tempUserData);
    } catch {
      userData = { fullName: "Usuário", phone: "(11) 99999-9999" };
    }
  }

  const sendCodeBtn = document.getElementById("sendCodeBtn");
  const verifyBtn = document.getElementById("verifyBtn");
  const resendBtn = document.getElementById("resendBtn");
  const codeModal = document.getElementById("codeModal");
  const verificationForm = document.getElementById("verificationForm");
  const codeInputs = document.querySelectorAll(".code-digit");

  codeInputs.forEach((inp, idx) => {
    inp.addEventListener("input", (e) => {
      if (!/^\d$/.test(e.target.value)) {
        e.target.value = "";
        return;
      }
      if (idx < codeInputs.length - 1) codeInputs[idx + 1].focus();
      checkCodeComplete();
    });

    inp.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !inp.value && idx > 0) codeInputs[idx - 1].focus();
    });

    inp.addEventListener("paste", (e) => {
      e.preventDefault();
      const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      d.split("").forEach((dig, i) => codeInputs[i] && (codeInputs[i].value = dig));
      checkCodeComplete();
    });
  });

  function checkCodeComplete() {
    const c = [...codeInputs].map(i => i.value).join("");
    verifyBtn.disabled = c.length !== 6;
    verifyBtn.classList.toggle("ready", c.length === 6);
  }

  if (sendCodeBtn) {
    sendCodeBtn.addEventListener("click", () => {
      sendCodeBtn.disabled = true;
      sendCodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      setTimeout(() => {
        sendCodeBtn.disabled = false;
        sendCodeBtn.innerHTML = 'ENVIAR SMS';
        codeModal.style.display = "flex";
        document.querySelector(".code-digit").focus();
        startResendCountdown();
        showCustomAlert("Código SMS enviado com sucesso!", "success");
      }, 2000);
    });
  }

  if (verificationForm) {
    verificationForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const code = [...codeInputs].map(i => i.value).join("");
      if (code.length !== 6) {
        showCustomAlert("Digite os 6 dígitos.", "error");
        return;
      }

      verifyBtn.disabled = true;
      verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';

      const rawPhone = userData.phone || "";
      const numero = "+55" + rawPhone.replace(/\D/g, "");

      try {
        const res = await fetch("https://n8n-n8n.mkiyhs.easypanel.host/webhook/por-codigo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ numero, code })
        });

        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();

        if (data.validado === true) {
          if (codeModal) codeModal.style.display = "none";
          showSuccessModal();
        } else {
          showCustomAlert("Código inválido ou expirado.", "error");
          resetVerifyBtn();
        }
      } catch (err) {
        console.error("Erro webhook:", err);
        showCustomAlert("Falha na validação. Tente novamente.", "error");
        resetVerifyBtn();
      }
    });
  }

  function resetVerifyBtn() {
    verifyBtn.disabled = false;
    verifyBtn.innerHTML = 'VERIFICAR CÓDIGO';
  }

  function startResendCountdown() {
    let t = 120;
    resendBtn.disabled = true;
    resendBtn.innerHTML = `<i class="fas fa-redo"></i> Reenviar em <span id="countdown">${t}</span>s`;
    const int = setInterval(() => {
      t--;
      document.getElementById("countdown").textContent = t;
      if (t <= 0) {
        clearInterval(int);
        resendBtn.disabled = false;
        resendBtn.innerHTML = '<i class="fas fa-redo"></i> Reenviar código';
      }
    }, 1000);
  }

  if (resendBtn) {
    resendBtn.addEventListener("click", async () => {
      resendBtn.disabled = true;
      resendBtn.innerHTML = "Aguardando...";
      const numero = getStorage("numeroConfirmado");
      const instanciaId = getStorage("instanciaId");
      try {
        await fetch("https://main-bot.vruch7.easypanel.host/resend-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ numero })
        });
        location.reload();
      } catch (err) {
        showCustomAlert("Erro ao reenviar código. Tente novamente.", "error");
      }
    });
  }

  const expirationTime = 240;
  const countdownEl = document.getElementById("code-expiration-timer");
  let t = expirationTime;

  const intervalExpira = setInterval(() => {
    t--;
    if (countdownEl) countdownEl.textContent = `⏳ Seu código expira em ${Math.floor(t / 60)}min ${t % 60}s`;
    if (t <= 0) {
      clearInterval(intervalExpira);
      removeStorage("numeroConfirmado");
      showCustomAlert("Seu código expirou. Solicite um novo para continuar.", "error");
    }
  }, 1000);

  function showSuccessModal() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.display = "flex";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-body success-modal-body">
          <div class="success-icon"><i class="fas fa-check-circle"></i></div>
          <h2>Verificação Concluída!</h2>
          <p>Seu telefone foi verificado com sucesso.</p>
          <p>Bem-vindo ao OnlyFlix Premium!</p>
          <div class="loading-spinner"><div class="spinner"></div></div>
          <p style="margin-top:20px;font-size:14px;opacity:.8;">Redirecionando para seu dashboard…</p>
        </div>
      </div>`;
    document.body.appendChild(modal);
    setTimeout(() => { modal.remove(); window.location.href = "dashboard.html"; }, 4000);
  }
startResendCountdown();

  console.log("Página de verificação carregada com dados:", userData);
});