/**
 * supabaseClient.js - Inicialização do cliente Supabase
 */

const SUPABASE_URL = 'https://xwchohxsnqwmvwgyujbm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GLmM4eXPZRHkNMUyPuLSdw_IXK7o6_n';

// Instancia o cliente do Supabase a partir do SDK global do CDN
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

/**
 * Exibe notificação temporária na interface (Toast)
 * @param {string} mensagem 
 * @param {'success'|'error'|'warning'} tipo 
 */
function showToast(mensagem, tipo = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  
  const icon = tipo === 'success' ? '✓' : tipo === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<strong>${icon}</strong><span>${mensagem}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
