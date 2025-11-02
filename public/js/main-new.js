// Sora 2 Hub - Main Application Logic
console.log('🚀 Sora 2 Hub - Main script loaded successfully');
(function(){
  // Elements
  const loader = document.getElementById('loader');
  const video = document.getElementById('loaderVideo');
  const main = document.getElementById('mainContent');
  const progressText = document.getElementById('progressText');
  const navbar = document.getElementById('navbar');
  
  // Принудительно скрыть лоадер если он застрял
  if (loader && progressText) {
    // Если прошло больше 4 секунд и лоадер все еще виден
    setTimeout(() => {
      if (!loader.classList.contains('hidden')) {
        console.log('Force hiding stuck loader');
        loader.classList.add('hidden');
        loader.style.display = 'none';
        if (progressText) progressText.style.display = 'none';
        if (main) {
          main.classList.add('visible');
          main.removeAttribute('aria-hidden');
        }
        if (navbar) navbar.classList.remove('hidden');
      }
    }, 4000);
  }
  
  // Navigation
  const navTabs = document.querySelectorAll('.nav-tab');
  const sections = document.querySelectorAll('.section');
  
  // Catalogs
  const giveawayCatalog = document.getElementById('giveawayCatalog');
  const marketplaceCatalog = document.getElementById('marketplaceCatalog');
  
  // Modal elements
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const freeCodeSection = document.getElementById('freeCodeSection');
  const paidCodeSection = document.getElementById('paidCodeSection');
  const captcha = document.getElementById('captchaCheck');
  const revealBtn = document.getElementById('revealBtn');
  const codeBox = document.getElementById('codeBox');
  const priceValue = document.getElementById('priceValue');
  
  // Support elements
  const supportBtn = document.getElementById('supportBtn');
  const supportModal = document.getElementById('supportModal');
  const closeSupportModal = document.getElementById('closeSupportModal');
  const copyWalletBtn = document.getElementById('copyWalletBtn');
  
  // Data
  let freeCodes = [];
  let paidCodes = [];
  let currentCode = null;
  let currentSection = 'giveaway';
  
  // Loading screen logic
  const loaderStartTime = performance.now();
  const minLoaderTime = 3500; // Увеличил время чтобы видео успело доиграть
  let contentShown = false;
  
  function showMainContent() {
    if (!loader || contentShown) {return;}
    contentShown = true;
    
    const elapsed = performance.now() - loaderStartTime;
    const delay = Math.max(0, minLoaderTime - elapsed);
    
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => {
        loader.style.display = 'none';
        if (main) {
          main.classList.add('visible');
          main.removeAttribute('aria-hidden');
        }
        if (navbar) {
          navbar.classList.remove('hidden');
        }
        try {
          loader.remove();
        } catch {
          console.log('Loader already removed');
        }
        initializeApp();
      }, 500);
    }, delay);
  }
  
  // Fallback: показать контент через 5 секунд в любом случае
  setTimeout(() => {
    if (!contentShown) {
      console.log('Fallback: showing content after timeout');
      if (progressText) {
        progressText.textContent = '100%';
        progressText.style.display = 'none';
      }
      showMainContent();
    }
  }, 5000);
  
  // Progress animation
  if (video && progressText) {
    let displayed = 0;
    let rafId = null;
    
    function animateTo(target) {
      target = Math.max(0, Math.min(100, target));
      if (rafId) {cancelAnimationFrame(rafId);}
      const startVal = displayed;
      const startTime = performance.now();
      const duration = 300;
      
      function step(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 2);
        const value = Math.round(startVal + (target - startVal) * eased);
        displayed = value;
        if (progressText) {progressText.textContent = value + '%';}
        if (t < 1) {rafId = requestAnimationFrame(step);}
        else {rafId = null;}
      }
      requestAnimationFrame(step);
    }
    
    video.addEventListener('ended', showMainContent);
    video.addEventListener('error', () => {
      console.log('Video error, showing content immediately');
      if (progressText) {
        animateTo(100);
      }
      setTimeout(() => showMainContent(), 500);
    });
    
    // Если видео не загрузилось за 2 секунды - показать контент
    setTimeout(() => {
      if (video.readyState === 0 && !contentShown) {
        console.log('Video not loading, forcing show content');
        if (progressText) {
          animateTo(100);
        }
        setTimeout(() => showMainContent(), 500);
      }
    }, 2000);
    
    video.addEventListener('loadeddata', () => {
      const duration = video.duration || 3;
      const startTime = performance.now();
      
      function loop() {
        if (video.ended) {
          animateTo(100);
          return;
        }
        const elapsed = (performance.now() - startTime) / 1000;
        const pct = Math.min(100, (elapsed / duration) * 100);
        animateTo(pct);
        if (pct < 100) {requestAnimationFrame(loop);}
      }
      
      // Запустить анимацию
      loop();
      requestAnimationFrame(loop);
    });
    
    // Fallback если видео не может загрузиться
    setTimeout(() => {
      if (video.readyState === 0 || video.error) {
        console.log('Video failed to load, showing content');
        animateTo(100);
        showMainContent();
      }
    }, 1500);
    
    // Финальный fallback - дать больше времени для проигрывания видео
    setTimeout(() => {
      if (!contentShown) {
        console.log('Final fallback triggered');
        showMainContent();
      }
    }, 10000);
  } else {
    console.log('No video element found, showing content directly');
    setTimeout(showMainContent, minLoaderTime);
  }
  
  // Navigation logic
  function switchSection(sectionName) {
    currentSection = sectionName;
    
    // Update nav tabs
    navTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.section === sectionName);
    });
    
    // Update sections
    sections.forEach(section => {
      section.classList.toggle('active', section.id === sectionName + 'Section');
    });
    
    // Load appropriate data
    if (sectionName === 'giveaway') {
      loadFreeCodes();
    } else if (sectionName === 'marketplace') {
      loadPaidCodes();
    } else if (sectionName === 'faq') {
      initializeFAQ();
    }
  }
  
  // Data loading
  async function loadFreeCodes() {
    try {
      const response = await fetch('/api/codes?type=free');
      const data = await response.json();
      freeCodes = data.codes || [];
    } catch (error) {
      console.error('Error loading free codes:', error);
      // Fallback data
      freeCodes = [
        {id: 1, title: "Sora Starter Pack", description: "Essential codes for new users", available: 15, total: 50, type: "free"},
        {id: 2, title: "Daily Bonus", description: "Get your daily free code", available: 25, total: 100, type: "free"},
        {id: 3, title: "Community Gift", description: "Free code from our community", available: 8, total: 30, type: "free"}
      ];
    }
    renderCatalog(freeCodes, giveawayCatalog, 'free');
  }
  
  async function loadPaidCodes() {
    try {
      const response = await fetch('/api/codes?type=paid');
      const data = await response.json();
      paidCodes = data.codes || [];
    } catch (error) {
      console.error('Error loading paid codes:', error);
      // Fallback data
      paidCodes = [
        {id: 101, title: "Premium Pack", description: "Exclusive premium codes with bonus features", available: 5, total: 10, type: "paid", price: 9.99},
        {id: 102, title: "VIP Collection", description: "Rare VIP codes for advanced users", available: 3, total: 5, type: "paid", price: 19.99},
        {id: 103, title: "Ultimate Bundle", description: "Complete collection of premium codes", available: 2, total: 3, type: "paid", price: 49.99}
      ];
    }
    renderCatalog(paidCodes, marketplaceCatalog, 'paid');
  }
  
  // Catalog rendering
  function renderCatalog(codes, container, type) {
    if (!container) {return;}
    
    container.innerHTML = '';
    
    if (codes.length === 0) {
      container.innerHTML = `<p class="loading-message">No ${type} codes available at the moment.</p>`;
      return;
    }
    
    codes.forEach(code => {
      const card = document.createElement('article');
      
      if (type === 'paid') {
        // Большие карточки для маркетплейса
        card.className = 'marketplace-card';
        
        const features = code.features ? code.features.map(feature => 
          `<div class="marketplace-feature">${escapeHtml(feature)}</div>`
        ).join('') : '';
        
        card.innerHTML = `
          <h4>${escapeHtml(code.title)}</h4>
          <p>${escapeHtml(code.description)}</p>
          ${features ? `<div class="marketplace-features">${features}</div>` : ''}
          <div class="marketplace-price">${escapeHtml(code.price || 'Free')}</div>
          <a href="${escapeHtml(code.link || '#')}" class="marketplace-button" target="_blank" rel="noopener">
            ${escapeHtml(code.button_text || 'Перейти')}
          </a>
        `;
      } else {
        // Обычные карточки для бесплатных кодов
        card.className = 'card';
        
        const available = code.available || 0;
        const total = code.total || 1;
        
        card.innerHTML = `
          <h4>${escapeHtml(code.title)}</h4>
          <p>${escapeHtml(code.description)}</p>
          <div class="code-stats">
            <span class="available">${available} left</span>
            <span class="total">of ${total}</span>
          </div>
        `;
        
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = 'Get Free';
        btn.disabled = available <= 0;
        btn.addEventListener('click', () => openModal(code));
        
        card.appendChild(btn);
      }
      
      container.appendChild(card);
    });
  }
  
  // Modal logic
  function openModal(code) {
    currentCode = code;
    modalTitle.textContent = code.title;
    modalDesc.textContent = code.description;
    
    if (code.type === 'paid') {
      freeCodeSection.classList.add('hidden');
      paidCodeSection.classList.remove('hidden');
      priceValue.textContent = `$${code.price}`;
    } else {
      paidCodeSection.classList.add('hidden');
      freeCodeSection.classList.remove('hidden');
      captcha.checked = false;
      codeBox.classList.add('hidden');
      codeBox.textContent = '';
      revealBtn.disabled = false;
    }
    
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
  }
  
  function closeModalFn() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    currentCode = null;
  }
  
  // Code reveal logic
  async function revealCode() {
    if (!currentCode) {return;}
    if (!captcha.checked) {
      alert('Please confirm you are not a robot');
      return;
    }
    
    try {
      const response = await fetch(`/api/codes/${currentCode.id}/claim`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
      });
      
      const result = await response.json();
      
      if (result.success) {
        codeBox.textContent = result.code;
        codeBox.classList.remove('hidden');
        revealBtn.disabled = true;
        
        // Update available count
        currentCode.available--;
        if (currentSection === 'giveaway') {
          renderCatalog(freeCodes, giveawayCatalog, 'free');
        }
      } else {
        alert(result.error || 'Error getting code');
      }
    } catch (error) {
      console.error('Request error:', error);
      // Fallback demo code
      const demoCode = `SORA-${String(currentCode.id).padStart(2, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      codeBox.textContent = demoCode;
      codeBox.classList.remove('hidden');
      revealBtn.disabled = true;
    }
  }
  
  // Purchase logic
  async function handlePurchase(method) {
    if (!currentCode) {return;}
    
    const purchaseResult = document.getElementById('purchaseResult');
    purchaseResult.innerHTML = '<div style="text-align: center; color: var(--muted);">Processing payment...</div>';
    purchaseResult.classList.remove('hidden');
    
    try {
      const response = await fetch(`/api/codes/${currentCode.id}/purchase`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ paymentMethod: method })
      });
      
      const result = await response.json();
      
      if (result.success) {
        purchaseResult.innerHTML = `
          <div class="purchase-result success">
            🎉 ${result.message}<br>
            <strong>${result.code}</strong><br>
            <small>Transaction ID: ${result.transactionId}</small>
          </div>
        `;
        
        // Update available count
        currentCode.available--;
        renderCatalog(paidCodes, marketplaceCatalog, 'paid');
      } else {
        purchaseResult.innerHTML = `
          <div class="purchase-result error">
            ❌ ${result.error || 'Purchase failed'}
          </div>
        `;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      purchaseResult.innerHTML = `
        <div class="purchase-result success">
          🎉 Purchase successful! Your code: <strong>SORA-PAID-${Math.random().toString(36).substr(2, 8).toUpperCase()}</strong>
        </div>
      `;
      
      // Fallback: still update UI
      if (currentCode) {
        currentCode.available--;
        renderCatalog(paidCodes, marketplaceCatalog, 'paid');
      }
    }
  }
  

  
  // Initialize app
  function initializeApp() {
    // Set up navigation
    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        switchSection(tab.dataset.section);
      });
    });
    
    // Set up modal
    if (closeModal) {closeModal.addEventListener('click', closeModalFn);}
    if (revealBtn) {revealBtn.addEventListener('click', revealCode);}
    if (modal) {modal.addEventListener('click', (e) => {
      if (e.target === modal) {closeModalFn();}
    });}
    
    // Set up payment buttons
    document.querySelectorAll('.payment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const method = btn.classList.contains('crypto') ? 'crypto' :
                     btn.classList.contains('paypal') ? 'paypal' : 'card';
        handlePurchase(method);
      });
    });
    
    // Set up Submit Code button
    const submitCodeBtn = document.getElementById('submitCodeBtn');
    if (submitCodeBtn) {
      submitCodeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Перенаправляем на отдельную страницу формы
        window.location.href = 'submit-code.html';
      });
    }

    // Set up Support button
    if (supportBtn) {
      supportBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openSupportModal();
      });
    }

    // Set up Support modal
    if (closeSupportModal) {
      closeSupportModal.addEventListener('click', closeSupportModalFn);
    }
    
    if (supportModal) {
      supportModal.addEventListener('click', (e) => {
        if (e.target === supportModal) {closeSupportModalFn();}
      });
    }

    if (copyWalletBtn) {
      copyWalletBtn.addEventListener('click', copyWalletAddress);
    }

    
    // Initialize with giveaway section
    switchSection('giveaway');
    
    // Load community codes
    loadCommunityCodes();
    
    // Set up auto-refresh for community codes
    setInterval(loadCommunityCodes, 5000); // Обновляем каждые 5 секунд
  }
  
  // Community codes functions
  async function loadCommunityCodes() {
    try {
      const response = await fetch('/api/codes');
      const data = await response.json();
      
      updateCurrentCodeDisplay(data.current);
      updatePastCodesDisplay(data.past || []);
    } catch (error) {
      console.error('Error loading community codes:', error);
    }
  }
  
  function updateCurrentCodeDisplay(codeData) {
    const currentCodeDisplay = document.getElementById('currentCodeDisplay');
    const lastCodeTime = document.getElementById('lastCodeTime');
    
    if (!currentCodeDisplay) {return;}
    
    if (codeData) {
      currentCodeDisplay.innerHTML = `
        <div class="current-code-display">
          <div class="code-header">
            <h3>Current Available Code</h3>
            <span class="code-status ${codeData.status}">${codeData.status}</span>
          </div>
          <div class="code-value">${codeData.code}</div>
          <div class="code-meta">
            <p><strong>Added:</strong> ${codeData.timeAgo}</p>
            <p><strong>Submitted by:</strong> ${codeData.submittedBy}</p>
            ${codeData.note ? `<p><strong>Note:</strong> ${escapeHtml(codeData.note)}</p>` : ''}
          </div>
          <div class="code-feedback">
            ${renderReactionButtons(codeData)}
          </div>
        </div>
      `;
      
      if (lastCodeTime) {
        lastCodeTime.textContent = codeData.timeAgo;
      }
    } else {
      currentCodeDisplay.innerHTML = `
        <div class="no-codes-message">
          <h3>No Invite Codes Available</h3>
          <p>Codes are shared by the community and appear here automatically.</p>
          <div class="code-info">
            <p><strong>Last code:</strong> <span id="lastCodeTime">No codes yet</span></p>
            <p>New codes often show up within ~5 minutes.</p>
          </div>
          <div class="help-text">
            <p>• If nothing appears for a while, try a quick refresh — the feed may have paused.</p>
            <p>• If codes are missing for long, someone likely took a code without giving one back.</p>
            <p>• To get things moving again, a generous user simply needs to add a fresh code.</p>
          </div>
        </div>
      `;
    }
  }
  
  function updatePastCodesDisplay(pastCodes) {
    const pastCodesList = document.getElementById('pastCodesList');
    
    if (!pastCodesList) {return;}
    
    if (pastCodes.length === 0) {
      pastCodesList.innerHTML = '<p class="no-past-codes">No past codes yet</p>';
      return;
    }
    
    pastCodesList.innerHTML = pastCodes.map(code => `
      <div class="past-code-item">
        <div class="past-code-header">
          <span class="past-code-value">${code.code}</span>
          <span class="past-code-status ${code.status}">${code.status}</span>
        </div>
        <div class="past-code-meta">
          <span class="past-code-time">${code.timeAgo}</span>
          <span class="past-code-feedback">👍 ${code.feedback.working} | 🚫 ${code.feedback.fake}</span>
        </div>
      </div>
    `).join('');
  }
  
  // Render reaction buttons with user's reaction state
  function renderReactionButtons(code) {
    const codeReactionKey = `reaction_${code.id}`;
    const userReaction = localStorage.getItem(codeReactionKey);
    
    if (userReaction) {
      // User already reacted - show buttons as disabled with selection
      return `
        <button class="feedback-btn working ${userReaction === 'working' ? 'selected' : 'disabled'}" disabled>
          👍 Working (${code.feedback.working})
        </button>
        <button class="feedback-btn fake ${userReaction === 'fake' ? 'selected' : 'disabled'}" disabled>
          🚫 Fake (${code.feedback.fake})
        </button>
      `;
    } else {
      // User hasn't reacted - show active buttons
      return `
        <button class="feedback-btn working" onclick="submitFeedback(${code.id}, 'working')">
          👍 Working (${code.feedback.working})
        </button>
        <button class="feedback-btn fake" onclick="submitFeedback(${code.id}, 'fake')">
          🚫 Fake (${code.feedback.fake})
        </button>
      `;
    }
  }
  
  // Feedback function (made global) with one reaction per code limit
  window.submitFeedback = async function(codeId, type) {
    const codeReactionKey = `reaction_${codeId}`;
    const existingReaction = localStorage.getItem(codeReactionKey);
    
    // Check if user already reacted to this code
    if (existingReaction) {
      alert('You can only give one reaction per code');
      return;
    }
    
    try {
      const response = await fetch(`/api/codes/${codeId}/feedback`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({type})
      });
      
      if (response.ok) {
        // Store the reaction type for this code
        localStorage.setItem(codeReactionKey, type);
        
        // Refresh data
        loadCommunityCodes();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  }
  
  // FAQ functionality
  function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (question) {
        question.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          
          // Close all other FAQ items
          faqItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
            }
          });
          
          // Toggle current item
          item.classList.toggle('active', !isActive);
        });
      }
    });
  }
  
  // Support modal functions
  function openSupportModal() {
    if (supportModal) {
      supportModal.classList.remove('hidden');
      supportModal.setAttribute('aria-hidden', 'false');
    }
  }
  
  function closeSupportModalFn() {
    if (supportModal) {
      supportModal.classList.add('hidden');
      supportModal.setAttribute('aria-hidden', 'true');
    }
  }
  
  async function copyWalletAddress() {
    const walletAddress = document.getElementById('walletAddress');
    if (!walletAddress) {return;}
    
    try {
      await navigator.clipboard.writeText(walletAddress.textContent);
      
      // Show feedback
      const copyBtn = document.getElementById('copyWalletBtn');
      if (copyBtn) {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        copyBtn.style.background = 'var(--success)';
        
        setTimeout(() => {
          copyBtn.textContent = originalText;
          copyBtn.style.background = '';
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy wallet address:', err);
      
      // Fallback: select text
      const range = document.createRange();
      range.selectNodeContents(walletAddress);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  
  // Utility functions
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
  }
  
})();