// Content script para menu de ações rápidas ao selecionar texto (com Shadow DOM)
(function () {
  console.log('[quickActions] content script carregado');
  if (window.__quickActionsInjected) return;
  window.__quickActionsInjected = true;

  // Cria host para Shadow DOM
  const host = document.createElement('div');
  host.style.position = 'absolute';
  host.style.zIndex = '2147483647';
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'closed' });

  // Estilos
  const style = document.createElement('style');
  style.textContent = `
    .popup {
      position: fixed;
      display: flex;
      align-items: center;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
      padding: 6px 12px;
      gap: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      animation: fadeIn 0.18s;
    }
    .action-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 15px;
      color: #222;
      border-radius: 8px;
      padding: 4px 8px;
      transition: background 0.15s;
    }
    .action-btn:hover {
      background: #f3f4f6;
    }
    .action-btn svg {
      width: 20px;
      height: 20px;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 18px;
      color: #888;
      cursor: pointer;
      margin-left: 8px;
    }
    .response-box {
      position: fixed;
      min-width: 280px;
      max-width: 420px;
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.13);
      padding: 16px 18px 12px 18px;
      margin-top: 8px;
      font-size: 15px;
      color: #222;
      z-index: 2147483647;
      animation: fadeIn 0.18s;
    }
    .response-loading {
      color: #3B82F6;
      font-size: 16px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .response-loading svg {
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px);}
      to { opacity: 1; transform: translateY(0);}
    }
    .response-title {
      font-weight: bold;
      font-size: 17px;
      margin-bottom: 6px;
    }
    .response-original {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 6px 10px;
      margin-bottom: 8px;
      font-size: 14px;
      color: #888;
    }
    .response-form {
      margin-top: 10px;
      display: flex;
      align-items: center;
    }
    .response-form input {
      flex: 1;
      padding: 7px 12px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      font-size: 15px;
      margin-right: 8px;
    }
    .response-form button {
      background: #3B82F6;
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .response-form button svg {
      width: 20px;
      height: 20px;
      stroke: #fff;
    }
  `;
  shadow.appendChild(style);

  let popup = null;
  let responseBox = null;
  let lastAction = null;
  let lastOriginal = null;
  let lastHistory = [];

  function removePopup() {
    if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
    popup = null;
  }
  function removeResponseBox() {
    if (responseBox && responseBox.parentNode) responseBox.parentNode.removeChild(responseBox);
    responseBox = null;
  }

  // Função para mostrar caixa de resposta com loading e chat inline
  function showResponseBox(x, y, content, history = [], action = '', original = '', loading = false) {
    if (!responseBox) {
      responseBox = document.createElement('div');
      responseBox.className = 'response-box';
      responseBox.style.left = x + 'px';
      responseBox.style.top = y + 40 + 'px';

      // Título da ação
      if (action) {
        const title = document.createElement('div');
        title.className = 'response-title';
        title.textContent = action;
        responseBox.appendChild(title);
      }

      // Campo do texto original (readonly)
      if (original) {
        const orig = document.createElement('div');
        orig.className = 'response-original';
        orig.textContent = original;
        responseBox.appendChild(orig);
      }

      // Área da resposta
      const answer = document.createElement('div');
      answer.className = 'response-answer';
      answer.style.marginBottom = '10px';
      answer.style.fontSize = '15px';
      answer.style.color = '#222';
      responseBox.appendChild(answer);

      // Não adiciona campo para continuar perguntando
      shadow.appendChild(responseBox);
    }

    // Atualiza resposta e input
    const answer = responseBox.querySelector('.response-answer');
    const form = responseBox.querySelector('.response-form');
    if (loading) {
      setLoading(answer);
      if (form) form.style.display = 'none';
    } else {
      answer.innerHTML = content || '';
      if (form) form.style.display = '';
    }

    lastAction = action;
    lastOriginal = original;
    lastHistory = history;
  }

  function setLoading(answerDiv) {
    if (answerDiv) {
      answerDiv.innerHTML = `<span class="response-loading">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke-opacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10" /></svg>
        Generating...
      </span>`;
    }
  }

  // Função para mostrar popup de ações
  function showPopup(x, y, selectedText) {
    removePopup();
    removeResponseBox();

    popup = document.createElement('div');
    popup.className = 'popup';

    // Ícone da extensão
    const icon = document.createElement('span');
    icon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
    popup.appendChild(icon);

    // Funções
    const actions = [
      {
        label: 'Explain',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="16" y2="13"/></svg>`,
        prompt: `Explique o seguinte texto:\n${selectedText}`,
      },
      {
        label: 'Summarize',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>`,
        prompt: `Resuma o seguinte texto:\n${selectedText}`,
      },
      {
        label: 'Translate',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8h14"/><path d="M7 16h10"/><path d="M12 4v16"/></svg>`,
        prompt: `Traduza o seguinte texto para português:\n${selectedText}`,
      },
      {
        label: 'Code Explain',
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><polyline points="8 10 12 14 16 10"/></svg>`,
        prompt: `Explique o seguinte código:\n${selectedText}`,
      },
    ];

    actions.forEach(action => {
      const btn = document.createElement('button');
      btn.className = 'action-btn';
      btn.innerHTML = `${action.icon} ${action.label}`;
      btn.onclick = () => {
        removePopup();
        showResponseBox(x, y, '', [], action.label, selectedText, true);
        // Envia mensagem para background/sidepanel para criar new task
        chrome.runtime.sendMessage({
          type: 'quick_action_task',
          prompt: action.prompt,
          originalText: selectedText,
          action: action.label,
          history: [],
        });
      };
      popup.appendChild(btn);
    });

    // Botão fechar
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = removePopup;
    popup.appendChild(closeBtn);

    // Posiciona popup
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';

    shadow.appendChild(popup);
  }

  // Escuta seleção de texto
  document.addEventListener('mouseup', e => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        // Posição do popup: centro do texto selecionado
        const x = rect.left + rect.width / 2 + window.scrollX - 120;
        const y = rect.top + window.scrollY - 48;
        showPopup(x, y, selection.toString().trim());
      } else {
        removePopup();
        removeResponseBox();
      }
    }, 10);
  });

  // Recebe resposta do background/sidepanel
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === 'quick_action_response') {
      if (!responseBox) {
        // Se a caixa não existe, cria uma nova próxima ao último popup
        const lastPopup = shadow.querySelector('.popup');
        let x = 200,
          y = 200;
        if (lastPopup) {
          const rect = lastPopup.getBoundingClientRect();
          x = rect.left + window.scrollX;
          y = rect.top + window.scrollY + 40;
        }
        showResponseBox(x, y, msg.content, msg.history || [], lastAction, lastOriginal, false);
      } else {
        // Atualiza apenas o conteúdo da resposta e mostra o input
        const answer = responseBox.querySelector('.response-answer');
        const form = responseBox.querySelector('.response-form');
        if (answer) answer.innerHTML = msg.content || '';
        if (form) form.style.display = '';
      }
      sendResponse && sendResponse(true);
    }
    return true;
  });
})();
