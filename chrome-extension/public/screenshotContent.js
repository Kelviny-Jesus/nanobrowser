// Content script para screenshot com seleção de área
(function () {
  // Injeta overlay se não estiver presente
  function injectOverlay() {
    if (!document.getElementById('__screenshotOverlayScript')) {
      const script = document.createElement('script');
      script.id = '__screenshotOverlayScript';
      script.src = chrome.runtime.getURL('screenshotOverlay.js');
      document.body.appendChild(script);
    }
  }

  // Escuta seleção de área
  function handleSelection(event) {
    if (event.source !== window) return;
    if (!event.data || event.data.type !== 'SCREENSHOT_SELECTION') return;
    const { rect, windowWidth, windowHeight } = event.data;

    // Remove listener após uso
    window.removeEventListener('message', handleSelection);

    // Solicita ao background a captura da tela inteira
    chrome.runtime.sendMessage({ type: 'take_screenshot_full' }, response => {
      if (!response || !response.dataUrl) return;
      // Cria imagem e recorta via canvas
      const img = new window.Image();
      img.onload = () => {
        // Ajusta proporção caso a janela capturada seja diferente da viewport
        const scaleX = img.width / windowWidth;
        const scaleY = img.height / windowHeight;
        const sx = rect.x * scaleX;
        const sy = rect.y * scaleY;
        const sw = rect.w * scaleX;
        const sh = rect.h * scaleY;
        const canvas = document.createElement('canvas');
        canvas.width = sw;
        canvas.height = sh;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        const croppedDataUrl = canvas.toDataURL('image/png');
        // Envia imagem recortada ao background
        chrome.runtime.sendMessage({ type: 'cropped_screenshot', dataUrl: croppedDataUrl });
      };
      img.src = response.dataUrl;
    });
  }

  window.addEventListener('message', handleSelection);

  injectOverlay();
})();
