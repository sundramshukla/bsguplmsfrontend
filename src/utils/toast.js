// A simple, premium, dynamic toast notification system
export const showToast = (message, type = 'success') => {
  const containerId = 'bsgup-toast-container';
  let container = document.getElementById(containerId);
  
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 9999;
      pointer-events: none;
      max-width: 380px;
      width: calc(100% - 48px);
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  
  // Custom styles for success and error toast
  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)';
  const borderHex = isSuccess ? '#10b981' : '#ef4444';
  const icon = isSuccess ? '⚜️' : '⚠️';
  const shadowColor = isSuccess ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';

  toast.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    background: ${bgColor};
    color: white;
    padding: 14px 20px;
    border-radius: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 10px 15px -3px ${shadowColor}, 0 4px 6px -4px ${shadowColor};
    border: 1px solid ${borderHex};
    backdrop-filter: blur(8px);
    transform: translateX(120%);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
    opacity: 0;
    pointer-events: auto;
  `;

  toast.innerHTML = `
    <span style="font-size: 18px; flex-shrink: 0">${icon}</span>
    <span style="flex-grow: 1; line-height: 1.4;">${message}</span>
    <button style="background: none; border: none; color: white; cursor: pointer; font-size: 16px; font-weight: bold; opacity: 0.7; padding: 0 0 0 8px; flex-shrink: 0">×</button>
  `;

  // Attach manual dismiss
  const closeBtn = toast.querySelector('button');
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 400);
    };
  }

  container.appendChild(toast);

  // Trigger animation entry
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  }, 10);

  // Auto remove after 4.5 seconds
  const autoRemoveTimer = setTimeout(() => {
    if (toast.parentNode) {
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 400);
    }
  }, 4500);

  // Add click to dismiss early
  toast.onclick = (e) => {
    if (e.target !== closeBtn) {
      clearTimeout(autoRemoveTimer);
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 400);
    }
  };
};

if (typeof window !== 'undefined') {
  window.showToast = showToast;
}
