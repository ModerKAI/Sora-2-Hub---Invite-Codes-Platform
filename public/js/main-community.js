// Sora 2 Hub - Community Code Sharing System
(function(){
  // Elements
  const loader = document.getElementById('loader');
  const video = document.getElementById('loaderVideo');
  const main = document.getElementById('mainContent');
  const progressText = document.getElementById('progressText');
  const navbar = document.getElementById('navbar');
  
  // Navigation
  const navTabs = document.querySelectorAll('.nav-tab');
  const sections = document.querySelectorAll('.section');
  
  // Giveaway elements
  const currentCodeDisplay = document.getElementById('currentCodeDisplay');
  const lastCodeTime = document.getElementById('lastCodeTime');
  const pastCodesList = document.getElementById('pastCodesList');
  const submitCodeBtn = document.getElementById('submitCodeBtn');
  
  // Submit modal elements
  const submitModal = document.getElementById('submitModal');
  const closeSubmitModal = document.getElementById('closeSubmitModal');
  
  // Marketplace elements
  const marketplaceCatalog = document.getElementById('marketplaceCatalog');
  
  // Regular modal elements
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  
  // Data
  let activeCodes = [];
  let pastCodes = [];
  let paidCodes = [];
  let currentSection = 'giveaway';
  const lastUpdateTime = Date.now();
  
  // Loading screen logic (2 seconds)
  const loaderStartTime = performance.now();
  const minLoaderTime = 2000; // Changed to 2 seconds
  
  function showMainContent() {
    if (!loader) {return;}
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
        loader.remove();
        initializeApp();
      }, 500);
    }, delay);
  }
  
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
    video.addEventListener('loadeddata', () => {
      const duration = video.duration || 2;
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
      requestAnimationFrame(loop);
    });
    
    // Fallback
    setTimeout(() => {
      if (!video.ended) {showMainContent();}
    }, 5000);
  } else {
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
      loadGiveawayData();
    } else if (sectionName === 'marketplace') {
      loadPaidCodes();
    }
  }
  
  // Giveaway system
  async function loadGiveawayData() {
    try {
      const response = await fetch('/api/community-codes');
      const data = await response.json();
      
      activeCodes = data.active || [];
      pastCodes = data.past || [];
      
      updateGiveawayDisplay();
    } catch (error) {
      console.error('Error loading community codes:', error);
      // Fallback demo data
      pastCodes = generateDemoHistory();
      updateGiveawayDisplay();
    }
  }
  
  function generateDemoHistory() {
    return [
      {
        id: 1,
        code: 'JOYKHF',
        status: 'fake',
        timeAgo: '2 hours ago',
        feedback: { working: 2, fake: 8 }
      },
      {
        id: 2,
        code: 'ABC123',
        status: 'working',
        timeAgo: '4 hours ago',
        feedback: { working: 15, fake: 1 }
      },
      {
        id: 3,
        code: 'XYZ789',
        status: 'unknown',
        timeAgo: '6 hours ago',
        feedback: { working: 3, fake: 3 }
      }
    ];
  }
  
  function updateGiveawayDisplay() {
    // Update last code time
    if (pastCodes.length > 0) {
      lastCodeTime.textContent = pastCodes[0].timeAgo || 'Unknown';
    } else {
      lastCodeTime.textContent = 'No codes yet';
    }
    
    // Update past codes list
    renderPastCodes();
  }
  
  function renderPastCodes() {
    if (!pastCodesList) {return;}
    
    pastCodesList.innerHTML = '';
    
    pastCodes.forEach(code => {
      const item = document.createElement('div');
      item.className = 'past-code-item';
      
      const statusClass = code.status === 'working' ? 'status-working' : 
                         code.status === 'fake' ? 'status-fake' : 'status-unknown';
      const statusText = code.status === 'working' ? '✅ Working' :
                        code.status === 'fake' ? '❌ Fake' : '❓ Unknown';
      const percentage = code.status === 'fake' ? '30% fake' :
                        code.status === 'working' ? '90% working' : '50% unknown';
      
      item.innerHTML = `
        <div class="past-code-header">
          <span class="past-code-status ${statusClass}">${percentage}</span>
        </div>
        <div class="past-code-value" onclick="copyCode('${code.code}')">${code.code}</div>
        <div class="past-code-feedback">
          <small style="color: var(--muted); text-align: center; display: block;">
            Did it work for you?
          </small>
        </div>
        <div class="past-code-feedback">
          <button class="feedback-btn" onclick="submitFeedback(${code.id}, 'working')">✅ Yes</button>
          <button class="feedback-btn" onclick="submitFeedback(${code.id}, 'fake')">❌ No</button>
          <button class="feedback-btn" onclick="reportCode(${code.id})">🚩 Report</button>
        </div>
      `;
      
      pastCodesList.appendChild(item);
    });
  }
  
  // Code submission
  function openSubmitModal() {
    console.log('Opening submit modal...', submitModal);
    const modal = document.getElementById('submitModal');
    console.log('Modal from DOM:', modal);
    
    if (modal) {
      console.log('Modal found, showing...');
      console.log('Modal classes before:', modal.className);
      
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      modal.style.display = 'flex';
      modal.style.visibility = 'visible';
      modal.style.opacity = '1';
      
      console.log('Modal classes after:', modal.className);
      console.log('Modal style:', modal.style.display);
      
      // Trigger the custom shown event for modal code inputs
      modal.dispatchEvent(new CustomEvent('shown'));
      console.log('Modal should be visible now');
    } else {
      console.error('Submit modal not found in DOM!');
    }
  }
  
  function closeSubmitModalFn() {
    if (submitModal) {
      submitModal.classList.add('hidden');
      submitModal.setAttribute('aria-hidden', 'true');
      
      // Clear all code inputs
      const codeDigits = submitModal.querySelectorAll('.code-digit');
      codeDigits.forEach(input => {
        input.value = '';
        input.classList.remove('filled');
      });
      
      // Disable submit button
      const submitBtn = document.getElementById('submitSoraCodeBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
      }
    }
  }
  

  
  // Marketplace (existing functionality)
  async function loadPaidCodes() {
    try {
      const response = await fetch('/api/codes?type=paid');
      const data = await response.json();
      paidCodes = data.codes || [];
    } catch (error) {
      console.error('Error loading paid codes:', error);
      // Fallback data
      paidCodes = [
        {id: 101, title: "Premium Pack", description: "Exclusive premium codes", available: 5, total: 10, type: "paid", price: 9.99},
        {id: 102, title: "VIP Collection", description: "Rare VIP codes", available: 3, total: 5, type: "paid", price: 19.99}
      ];
    }
    renderMarketplace();
  }
  
  function renderMarketplace() {
    if (!marketplaceCatalog) {return;}
    
    marketplaceCatalog.innerHTML = '';
    
    if (paidCodes.length === 0) {
      marketplaceCatalog.innerHTML = '<p class="loading-message">No premium codes available.</p>';
      return;
    }
    
    paidCodes.forEach(code => {
      const card = document.createElement('article');
      card.className = 'card';
      
      card.innerHTML = `
        <h4>${escapeHtml(code.title)}</h4>
        <p>${escapeHtml(code.description)}</p>
        <div class="code-stats">
          <span class="available">${code.available} left</span>
          <span class="total">of ${code.total}</span>
        </div>
        <div class="price-tag">$${code.price}</div>
      `;
      
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.textContent = 'Buy Now';
      btn.disabled = code.available <= 0;
      btn.addEventListener('click', () => alert('Marketplace feature coming soon!'));
      
      card.appendChild(btn);
      marketplaceCatalog.appendChild(card);
    });
  }
  
  // Utility functions
  function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
      alert('📋 Code copied to clipboard!');
    }).catch(() => {
      alert('📋 Code: ' + code);
    });
  }
  
  function submitFeedback(codeId, type) {
    alert(`Thank you for your feedback! (${type})`);
    // In real app, would send to server
  }
  
  function reportCode(codeId) {
    alert('Code reported. Thank you for helping keep the community clean!');
    // In real app, would send report to server
  }
  
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
  }
  
  // Modal code input logic
  function initializeModalCodeInputs() {
    // Only initialize when modal is opened
    const modal = document.getElementById('submitModal');
    if (!modal) {return;}
    
    modal.addEventListener('shown', () => {
      const codeDigits = modal.querySelectorAll('.code-digit');
      const submitBtn = document.getElementById('submitSoraCodeBtn');
      const lastSubmittedTime = document.getElementById('lastSubmittedTime');
      
      if (!codeDigits.length) {return;}
      
      // Auto-focus and navigation
      codeDigits.forEach((input, index) => {
        input.addEventListener('input', (e) => {
          const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          e.target.value = value;
          
          if (value) {
            input.classList.add('filled');
            // Move to next input
            if (index < codeDigits.length - 1) {
              codeDigits[index + 1].focus();
            }
          } else {
            input.classList.remove('filled');
          }
          
          updateSubmitButton();
        });
        
        input.addEventListener('keydown', (e) => {
          // Backspace - move to previous input if current is empty
          if (e.key === 'Backspace' && !input.value && index > 0) {
            codeDigits[index - 1].focus();
            codeDigits[index - 1].value = '';
            codeDigits[index - 1].classList.remove('filled');
            updateSubmitButton();
          }
          
          // Arrow key navigation
          if (e.key === 'ArrowLeft' && index > 0) {
            codeDigits[index - 1].focus();
          }
          if (e.key === 'ArrowRight' && index < codeDigits.length - 1) {
            codeDigits[index + 1].focus();
          }
          
          // Enter - submit if all filled
          if (e.key === 'Enter' && isCodeComplete()) {
            handleModalCodeSubmit();
          }
        });
        
        input.addEventListener('paste', (e) => {
          e.preventDefault();
          const paste = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          
          for (let i = 0; i < Math.min(paste.length, codeDigits.length - index); i++) {
            if (codeDigits[index + i]) {
              codeDigits[index + i].value = paste[i];
              codeDigits[index + i].classList.add('filled');
            }
          }
          
          updateSubmitButton();
        });
      });
      
      function isCodeComplete() {
        return Array.from(codeDigits).every(input => input.value.length === 1);
      }
      
      function getCodeValue() {
        return Array.from(codeDigits).map(input => input.value).join('');
      }
      
      function updateSubmitButton() {
        if (submitBtn) {
          submitBtn.disabled = !isCodeComplete();
        }
      }
      
      async function handleModalCodeSubmit() {
        const code = getCodeValue();
        if (code.length === 6) {
          try {
            const response = await fetch('/api/submit-code', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code, note: 'Submitted via Sora interface' })
            });
            
            const result = await response.json();
            
            if (result.success) {
              // Update last submitted time
              const now = new Date();
              const timeString = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              });
              
              if (lastSubmittedTime) {
                lastSubmittedTime.textContent = `${code} - submitted at ${timeString}`;
              }
              
              // Show success and close modal
              showCodeSubmittedMessage(code);
              closeSubmitModalFn();
              
              // Refresh giveaway data
              loadGiveawayData();
              
            } else {
              alert('❌ ' + (result.error || 'Failed to submit code'));
            }
          } catch (error) {
            console.error('Submission error:', error);
            // Demo mode
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            });
            
            if (lastSubmittedTime) {
              lastSubmittedTime.textContent = `${code} - submitted at ${timeString}`;
            }
            
            showCodeSubmittedMessage(code);
            closeSubmitModalFn();
            
            // Add to demo data
            pastCodes.unshift({
              id: Date.now(),
              code: code,
              status: 'unknown',
              timeAgo: 'Just now',
              feedback: { working: 0, fake: 0 }
            });
            renderPastCodes();
          }
        }
      }
      
      function showCodeSubmittedMessage(code) {
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(16, 185, 129, 0.9);
          color: white;
          padding: 15px 25px;
          border-radius: 8px;
          font-weight: 600;
          z-index: 10000;
          animation: slideIn 0.3s ease;
        `;
        successMsg.textContent = `✅ Code ${code} submitted to community!`;
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
          successMsg.style.animation = 'slideOut 0.3s ease forwards';
          setTimeout(() => successMsg.remove(), 300);
        }, 3000);
      }
      
      // Set up submit button
      if (submitBtn) {
        submitBtn.addEventListener('click', handleModalCodeSubmit);
      }
      
      // Set up cancel link
      const cancelLink = document.getElementById('cancelSubmitSora');
      if (cancelLink) {
        cancelLink.addEventListener('click', () => {
          closeSubmitModalFn();
        });
      }
      
      // Clear and focus first input
      codeDigits.forEach(input => {
        input.value = '';
        input.classList.remove('filled');
      });
      updateSubmitButton();
      
      // Focus first input
      setTimeout(() => {
        codeDigits[0].focus();
      }, 100);
    });
  }

  // Initialize app
  function initializeApp() {
    console.log('Initializing app...');
    console.log('Submit button element:', submitCodeBtn);
    console.log('Submit modal element:', submitModal);
    
    // Set up navigation
    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        switchSection(tab.dataset.section);
      });
    });
    
    // Set up submit button with fresh DOM query
    const freshSubmitBtn = document.getElementById('submitCodeBtn');
    const freshSubmitModal = document.getElementById('submitModal');
    
    console.log('Fresh submit button:', freshSubmitBtn);
    console.log('Fresh submit modal:', freshSubmitModal);
    
    if (freshSubmitBtn) {
      console.log('Submit button found, adding event listener');
      freshSubmitBtn.addEventListener('click', (e) => {
        console.log('Submit button clicked!');
        e.preventDefault();
        
        const modal = document.getElementById('submitModal');
        if (modal) {
          console.log('Opening modal...');
          modal.classList.remove('hidden');
          modal.setAttribute('aria-hidden', 'false');
          modal.style.display = 'flex';
          
          // Initialize modal code inputs
          setTimeout(() => {
            const codeDigits = modal.querySelectorAll('.code-digit');
            if (codeDigits.length > 0) {
              codeDigits[0].focus();
            }
          }, 100);
        } else {
          console.error('Modal not found when button clicked!');
        }
      });
    } else {
      console.error('Submit button not found!');
    }
    
    // Set up submit modal close button
    const freshCloseBtn = document.getElementById('closeSubmitModal');
    if (freshCloseBtn) {
      console.log('Close button found, adding event listener');
      freshCloseBtn.addEventListener('click', (e) => {
        console.log('Close button clicked!');
        e.preventDefault();
        
        const modal = document.getElementById('submitModal');
        if (modal) {
          modal.classList.add('hidden');
          modal.setAttribute('aria-hidden', 'true');
          modal.style.display = 'none';
        }
      });
    } else {
      console.error('Close button not found!');
    }
    
    // Set up regular modal
    if (closeModal) {closeModal.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    });}
    
    // Close modals on outside click
    if (submitModal) {
      submitModal.addEventListener('click', (e) => {
        if (e.target === submitModal) {closeSubmitModalFn();}
      });
    }
    
    // Initialize modal code inputs
    initializeModalCodeInputs();
    
    // Initialize with giveaway section
    switchSection('giveaway');
  }
  
})();