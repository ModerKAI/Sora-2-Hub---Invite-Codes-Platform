// Простая версия для тестирования модального окна
console.log('Simple script loaded');

// Добавим обработчик сразу без ожидания загрузки
window.addEventListener('load', function() {
  console.log('Window fully loaded');
  initializeSimpleApp();
});

// Дождемся полной загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM ready for simple version');
  
  // Также попробуем инициализировать сразу
  setTimeout(() => {
    console.log('Timeout initialization');
    initializeSimpleApp();
  }, 1000);
  
  // Обработка загрузчика (упрощенная)
  const loader = document.getElementById('loader');
  const main = document.getElementById('mainContent');
  const navbar = document.getElementById('navbar');
  
  console.log('Loader elements:', { loader, main, navbar });
  
  if (loader && main) {
    console.log('Loader found, setting timeout');
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => {
        loader.style.display = 'none';
        main.classList.add('visible');
        main.removeAttribute('aria-hidden');
        if (navbar) {navbar.classList.remove('hidden');}
        console.log('Calling initializeSimpleApp from loader');
        initializeSimpleApp();
      }, 500);
    }, 1000); // Уменьшил до 1 секунды
  } else {
    console.log('No loader, initializing directly');
    initializeSimpleApp();
  }
});

function initializeSimpleApp() {
  console.log('=== Initializing simple app ===');
  
  // Проверим все элементы на странице
  console.log('All buttons:', document.querySelectorAll('button'));
  console.log('All elements with submitCodeBtn ID:', document.getElementById('submitCodeBtn'));
  console.log('All modals:', document.querySelectorAll('.modal'));
  
  // Навигация
  const navTabs = document.querySelectorAll('.nav-tab');
  const sections = document.querySelectorAll('.section');
  
  console.log('Navigation elements:', { navTabs: navTabs.length, sections: sections.length });
  
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const sectionName = tab.dataset.section;
      console.log('Nav tab clicked:', sectionName);
      
      navTabs.forEach(t => t.classList.toggle('active', t === tab));
      sections.forEach(s => s.classList.toggle('active', s.id === sectionName + 'Section'));
    });
  });
  
  // Основная функциональность модального окна
  const submitBtn = document.getElementById('submitCodeBtn');
  const submitModal = document.getElementById('submitModal');
  const closeBtn = document.getElementById('closeSubmitModal');
  
  console.log('=== Modal elements ===');
  console.log('Submit button:', submitBtn);
  console.log('Submit modal:', submitModal);
  console.log('Close button:', closeBtn);
  
  // Также попробуем найти по классу
  const submitBtnByClass = document.querySelector('.submit-btn');
  const modalByClass = document.querySelector('.modal');
  console.log('By class - Submit button:', submitBtnByClass);
  console.log('By class - Modal:', modalByClass);
  
  // Попробуем разные способы найти и подключить кнопку
  function setupSubmitButton() {
    const buttons = [
      document.getElementById('submitCodeBtn'),
      document.querySelector('.submit-btn'),
      document.querySelector('[id*="submit"]'),
      ...document.querySelectorAll('button')
    ].filter(Boolean);
    
    console.log('Found buttons:', buttons);
    
    buttons.forEach((btn, index) => {
      if (btn.textContent.includes('Submit') || btn.id === 'submitCodeBtn') {
        console.log(`Setting up button ${index}:`, btn);
        
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          console.log('Submit button clicked - opening modal');
          
          const modal = document.getElementById('submitModal') || document.querySelector('.modal');
          if (modal) {
            console.log('Modal found, opening...');
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
            modal.style.display = 'flex';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
            
            // Инициализация полей ввода кода
            setTimeout(() => initializeCodeInputs(), 100);
            
            console.log('Modal should be visible now');
          } else {
            console.error('Modal not found!');
            alert('Modal not found - this is a debug message');
          }
        });
      }
    });
  }
  
  setupSubmitButton();
  
  if (submitBtn && submitModal) {
    console.log('Original setup - Setting up modal handlers');
    
    // Закрытие модального окна
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Close button clicked');
        closeModal();
      });
    }
    
    // Закрытие по клику вне модального окна
    submitModal.addEventListener('click', function(e) {
      if (e.target === submitModal) {
        console.log('Clicked outside modal');
        closeModal();
      }
    });
  } else {
    console.error('Modal elements not found!');
  }
  
  function closeModal() {
    if (submitModal) {
      submitModal.classList.add('hidden');
      submitModal.setAttribute('aria-hidden', 'true');
      submitModal.style.display = 'none';
      
      // Очистка полей
      const codeInputs = submitModal.querySelectorAll('.code-digit');
      codeInputs.forEach(input => {
        input.value = '';
        input.classList.remove('filled');
      });
    }
  }
  
  function initializeCodeInputs() {
    const codeInputs = submitModal.querySelectorAll('.code-digit');
    const submitSoraBtn = document.getElementById('submitSoraCodeBtn');
    const cancelBtn = document.getElementById('cancelSubmitSora');
    
    console.log('Code inputs found:', codeInputs.length);
    
    if (codeInputs.length === 0) {return;}
    
    // Обработка ввода в поля кода
    codeInputs.forEach((input, index) => {
      input.addEventListener('input', function(e) {
        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        e.target.value = value;
        
        if (value) {
          input.classList.add('filled');
          // Переход к следующему полю
          if (index < codeInputs.length - 1) {
            codeInputs[index + 1].focus();
          }
        } else {
          input.classList.remove('filled');
        }
        
        updateSubmitButton();
      });
      
      input.addEventListener('keydown', function(e) {
        // Backspace - переход к предыдущему полю
        if (e.key === 'Backspace' && !input.value && index > 0) {
          codeInputs[index - 1].focus();
          codeInputs[index - 1].value = '';
          codeInputs[index - 1].classList.remove('filled');
          updateSubmitButton();
        }
        
        // Enter - отправка если все поля заполнены
        if (e.key === 'Enter' && isCodeComplete()) {
          handleCodeSubmit();
        }
      });
    });
    
    function isCodeComplete() {
      return Array.from(codeInputs).every(input => input.value.length === 1);
    }
    
    function getCode() {
      return Array.from(codeInputs).map(input => input.value).join('');
    }
    
    function updateSubmitButton() {
      if (submitSoraBtn) {
        submitSoraBtn.disabled = !isCodeComplete();
      }
    }
    
    function handleCodeSubmit() {
      const code = getCode();
      if (code.length === 6) {
        console.log('Submitting code:', code);
        
        // Показать успешное сообщение
        alert(`✅ Code ${code} submitted successfully!`);
        
        // Обновить время последней отправки
        const lastSubmittedTime = document.getElementById('lastSubmittedTime');
        if (lastSubmittedTime) {
          const now = new Date();
          const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
          lastSubmittedTime.textContent = `${code} - submitted at ${timeString}`;
        }
        
        // Закрыть модальное окно
        closeModal();
      }
    }
    
    // Обработчики кнопок
    if (submitSoraBtn) {
      submitSoraBtn.addEventListener('click', handleCodeSubmit);
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModal);
    }
    
    // Фокус на первое поле
    setTimeout(() => {
      codeInputs[0].focus();
    }, 100);
    
    updateSubmitButton();
  }
  
  // Активировать раздел Giveaway по умолчанию
  const giveawayTab = document.querySelector('[data-section="giveaway"]');
  if (giveawayTab) {
    giveawayTab.click();
  }
  
  console.log('Simple app initialized');
}