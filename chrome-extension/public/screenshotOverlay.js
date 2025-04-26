// Overlay de seleção de área para screenshot
(function () {
  if (window.__screenshotOverlayInjected) return;
  window.__screenshotOverlayInjected = true;

  // Cria overlay
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.zIndex = 999999;
  overlay.style.background = 'rgba(0,0,0,0.15)';
  overlay.style.cursor = 'crosshair';
  overlay.style.userSelect = 'none';

  // Elemento de seleção
  const selection = document.createElement('div');
  selection.style.position = 'absolute';
  selection.style.border = '2px dashed #3b82f6';
  selection.style.background = 'rgba(59,130,246,0.08)';
  selection.style.pointerEvents = 'none';

  // Botões de ação
  const btnBox = document.createElement('div');
  btnBox.style.position = 'absolute';
  btnBox.style.display = 'flex';
  btnBox.style.flexDirection = 'row';
  btnBox.style.alignItems = 'center';
  btnBox.style.gap = '4px';
  btnBox.style.zIndex = 1000000;
  btnBox.style.background = 'rgba(255,255,255,0.95)';
  btnBox.style.borderRadius = '8px';
  btnBox.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
  btnBox.style.padding = '2px 6px';

  const btnOk = document.createElement('button');
  btnOk.textContent = '✔️';
  btnOk.style.fontSize = '16px';
  btnOk.style.background = 'none';
  btnOk.style.border = 'none';
  btnOk.style.color = '#22c55e';
  btnOk.style.borderRadius = '4px';
  btnOk.style.padding = '2px 6px';
  btnOk.style.cursor = 'pointer';

  const btnCancel = document.createElement('button');
  btnCancel.textContent = '❌';
  btnCancel.style.fontSize = '16px';
  btnCancel.style.background = 'none';
  btnCancel.style.border = 'none';
  btnCancel.style.color = '#ef4444';
  btnCancel.style.borderRadius = '4px';
  btnCancel.style.padding = '2px 6px';
  btnCancel.style.cursor = 'pointer';

  btnBox.appendChild(btnCancel);
  btnBox.appendChild(btnOk);

  let startX = 0,
    startY = 0,
    endX = 0,
    endY = 0,
    selecting = false;

  function updateSelectionRect() {
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const w = Math.abs(endX - startX);
    const h = Math.abs(endY - startY);
    selection.style.left = x + 'px';
    selection.style.top = y + 'px';
    selection.style.width = w + 'px';
    selection.style.height = h + 'px';
    btnBox.style.left = x + w - 60 + 'px';
    btnBox.style.top = y + h + 8 + 'px';
  }

  overlay.addEventListener('mousedown', e => {
    selecting = true;
    startX = endX = e.clientX;
    startY = endY = e.clientY;
    updateSelectionRect();
    if (!selection.parentNode) overlay.appendChild(selection);
    if (!btnBox.parentNode) overlay.appendChild(btnBox);
    btnBox.style.display = 'none';
  });

  overlay.addEventListener('mousemove', e => {
    if (!selecting) return;
    endX = e.clientX;
    endY = e.clientY;
    updateSelectionRect();
  });

  overlay.addEventListener('mouseup', e => {
    if (!selecting) return;
    selecting = false;
    endX = e.clientX;
    endY = e.clientY;
    updateSelectionRect();
    btnBox.style.display = 'flex';
  });

  btnCancel.onclick = () => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    window.__screenshotOverlayInjected = false;
  };

  btnOk.onclick = () => {
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const w = Math.abs(endX - startX);
    const h = Math.abs(endY - startY);
    document.body.removeChild(overlay);
    window.__screenshotOverlayInjected = false;
    // Envia mensagem para background com área selecionada
    window.postMessage(
      {
        type: 'SCREENSHOT_SELECTION',
        rect: { x, y, w, h },
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      },
      '*',
    );
  };

  document.body.appendChild(overlay);
})();
