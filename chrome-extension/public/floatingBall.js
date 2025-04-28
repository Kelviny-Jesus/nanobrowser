// Floating action button com menu hover usando Shadow DOM para isolamento de estilos
(function () {
  if (window.__floatingBallInjected) return;
  window.__floatingBallInjected = true;

  // Criar o host para Shadow DOM
  const hostElement = document.createElement('div');
  hostElement.style.position = 'fixed';
  hostElement.style.zIndex = '2147483647'; // Valor máximo de z-index
  hostElement.style.bottom = '32px';
  hostElement.style.right = '32px';

  // Criar Shadow DOM com modo closed para melhor isolamento
  const shadow = hostElement.attachShadow({ mode: 'closed' });

  // Estilos isolados dentro do Shadow DOM
  const style = document.createElement('style');
  style.textContent = `
    .wrapper {
      position: relative;
      width: 64px;
      min-height: 120px;
      height: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      /* Permite que o wrapper cubra a área do menu para evitar sumiço ao mover o mouse */
    }
    
    .menu {
      position: absolute;
      bottom: 60px;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      background: rgba(255,255,255,0.98);
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
      padding: 10px 6px;
      transition: opacity 0.2s, transform 0.2s;
      z-index: 10;
    }
    
    .wrapper:hover .menu {
      display: flex;
      animation: fadeIn 0.2s forwards;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    
    .ball {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18);
      cursor: pointer;
      transition: box-shadow 0.2s, transform 0.2s;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
    }
    
    .wrapper:hover .ball {
      box-shadow: 0 4px 16px rgba(59,130,246,0.25);
    }
    
    .btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #fff;
      border: none;
      box-shadow: 0 1px 4px rgba(0,0,0,0.10);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, background 0.2s;
    }
    
    .btn:hover {
      transform: scale(1.05);
      background: #f5f5f5;
    }
    
    .btn svg {
      width: 22px;
      height: 22px;
    }
    
    .tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 8px;
      padding: 6px 10px;
      border-radius: 4px;
      background: rgba(0,0,0,0.75);
      color: white;
      font-size: 12px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    .btn:hover .tooltip {
      opacity: 1;
    }
  `;

  // Wrapper para o botão e menu
  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';

  // Container do menu
  const menu = document.createElement('div');
  menu.className = 'menu';

  // Botão screenshot
  const btnScreenshot = document.createElement('button');
  btnScreenshot.className = 'btn';
  btnScreenshot.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="18" r="2"/>
      <circle cx="6" cy="6" r="2"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88"/>
      <line x1="14.47" y1="14.48" x2="20" y2="20"/>
      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </svg>
    <span class="tooltip">Screenshot</span>
  `;

  // Botão sumarizador
  const btnSumarizar = document.createElement('button');
  btnSumarizar.className = 'btn';
  btnSumarizar.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <line x1="8" y1="9" x2="16" y2="9"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="12" y2="17"/>
    </svg>
    <span class="tooltip">Sumarizar</span>
  `;

  // Adicionar botões ao menu
  menu.appendChild(btnScreenshot);
  menu.appendChild(btnSumarizar);

  // Bola flutuante
  const ball = document.createElement('div');
  ball.className = 'ball';

  // Ícone para o botão (usando SVG inline para não depender de um arquivo externo)
  ball.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  `;

  // Montar a estrutura
  wrapper.appendChild(menu);
  wrapper.appendChild(ball);

  // Adicionar elementos ao Shadow DOM
  shadow.appendChild(style);
  shadow.appendChild(wrapper);

  // Adicionar o host ao corpo do documento
  document.body.appendChild(hostElement);

  // Implementação de drag-and-drop
  let isDragging = false;
  let offsetX, offsetY;

  ball.addEventListener('mousedown', e => {
    isDragging = true;
    offsetX = e.clientX - hostElement.getBoundingClientRect().left;
    offsetY = e.clientY - hostElement.getBoundingClientRect().top;

    // Adicionar estilo cursor durante o arraste
    document.body.style.userSelect = 'none';
    ball.style.cursor = 'grabbing';

    // Impedir o evento padrão
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;

    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;

    // Limites para não sair da tela
    const maxX = window.innerWidth - hostElement.offsetWidth;
    const maxY = window.innerHeight - hostElement.offsetHeight;

    hostElement.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
    hostElement.style.top = `${Math.max(0, Math.min(y, maxY))}px`;

    // Remover as posições originais
    hostElement.style.right = 'auto';
    hostElement.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.userSelect = '';
      ball.style.cursor = 'pointer';
    }
  });

  // Click handler para o botão principal
  ball.addEventListener('click', e => {
    if (isDragging) return;

    try {
      // Abrir ou fechar o painel lateral
      if (!ball._panelOpen) {
        chrome.runtime.sendMessage({ type: 'open_side_panel' });
        ball._panelOpen = true;
      } else {
        chrome.runtime.sendMessage({ type: 'close_side_panel' });
        ball._panelOpen = false;
      }
    } catch (err) {
      console.error('Erro ao comunicar com a extensão:', err);
    }
  });

  // Handler para o botão de screenshot
  btnScreenshot.addEventListener('click', e => {
    e.stopPropagation();
    try {
      chrome.runtime.sendMessage({ type: 'take_screenshot' });
    } catch (err) {
      console.error('Erro ao capturar screenshot:', err);
    }
  });

  // Handler para o botão de sumarizar
  btnSumarizar.addEventListener('click', e => {
    e.stopPropagation();
    try {
      chrome.runtime.sendMessage({ type: 'summarize_page' });
    } catch (err) {
      console.error('Erro ao sumarizar página:', err);
    }
  });

  console.log('Botão flutuante inicializado com sucesso');
})();
