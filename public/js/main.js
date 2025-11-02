// Управление экраном загрузки
(function(){
  const loader = document.getElementById('loader');
  const video = document.getElementById('loaderVideo');
  const skip = document.getElementById('skipBtn');
  const main = document.getElementById('mainContent');
  const progressText = document.getElementById('progressText');

  // Минимальное время показа лоадера
  const loaderStartTime = performance.now();
  const minLoaderTime = 2500; // 2.5 секунды минимум

  // Показ основного контента
  function showMain(){
    if(!loader) {return;}
    const elapsed = performance.now() - loaderStartTime;
    const delay = Math.max(0, minLoaderTime - elapsed);
    
    setTimeout(()=>{
      loader.classList.add('hidden');
      // дать время на анимацию скрытия
      setTimeout(()=>{
        loader.style.display = 'none';
        if(main) {main.classList.add('visible');}
        // снять aria-hidden
        if(main) {main.removeAttribute('aria-hidden');}
        loader.remove();
      },500);
    }, delay);
  }

  // Если видео закончилось
  if(video){
    // Обновление UI прогресса: синхронизация с текущим временем видео
    let displayed = 0;
    let rafId = null;
    // анимирует отображаемый процент к целевому плавно
    function animateTo(target){
      target = Math.max(0, Math.min(100, target));
      if(rafId) {cancelAnimationFrame(rafId);}
      const startVal = displayed;
      const startTime = performance.now();
      const duration = 300; // ms для догоняющей анимации
      function step(now){
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 2); // ease-out
        const value = Math.round(startVal + (target - startVal) * eased);
        displayed = value;
        if(progressText) {progressText.textContent = value + '%';}
        if(t < 1) {rafId = requestAnimationFrame(step);} else {rafId = null;}
      }
      rafId = requestAnimationFrame(step);
    }

    // Запуск основной синхронизации: обновлять целевой процент в рендер-цикле
    function startSync(durationSeconds){
      const startTime = performance.now();
      function loop(){
        if(stopSync){
          animateTo(100);
          displayed = 100;
          if(progressText) {progressText.textContent = '100%';}
          return;
        }
        const now = performance.now();
        const elapsed = (now - startTime) / 1000;
        const pct = Math.min(100, (elapsed / durationSeconds) * 100);
        animateTo(pct);
        if(pct < 100){
          requestAnimationFrame(loop);
        } else {
          displayed = 100;
          if(progressText) {progressText.textContent = '100%';}
        }
      }
      requestAnimationFrame(loop);
    }

    // в некоторых браузерах autoplay может быть запрещён, поэтому ставим запасной таймаут
    let finished = false;
    let stopSync = false;
    video.addEventListener('ended', ()=>{
      finished = true;
      stopSync = true;
      if(rafId) {cancelAnimationFrame(rafId);}
      // плавно догоняем до 100%
      animateTo(100);
      // небольшая задержка чтобы пользователь увидел 100%
      setTimeout(()=>{
        if(fallbackTimeout) {clearTimeout(fallbackTimeout);}
        showMain();
      }, 350);
    });

    // Когда метаданные загружены — можем отслеживать buffered/progress
    let fallbackTimeout = null;
    // Защита от повторного старта синхронизации
    let syncStarted = false;

    // Если известна длительность видео — привяжем прогресс к currentTime, иначе симулируем 5 секунд
    function initSync(){
      if(syncStarted) {return;} syncStarted = true;
      if(video.duration && isFinite(video.duration) && video.duration > 0){
        // привязываем процент к реальному времени воспроизведения
        const onTime = ()=>{
          try{
            const pct = Math.min(100, (video.currentTime / video.duration) * 100);
            animateTo(pct);
          }catch(e){ /* ignore */ }
        };
        video.addEventListener('timeupdate', onTime);
        // также обновим сразу
        onTime();
        // очистка при окончании
        video.addEventListener('ended', ()=>{ video.removeEventListener('timeupdate', onTime); }, {once:true});
      } else {
        // нет длительности — симулируем линейно за 5 секунд
        startSync(5);
      }
    }

    if(video.readyState >= 1){
      initSync();
    } else {
      video.addEventListener('loadedmetadata', initSync, {once:true});
      // запасной: если метаданные не пришли — всё равно стартуем симуляцию через 300ms
      setTimeout(()=>{ if(displayed === 0) {initSync();} },300);
    }

    // Если открыто через file:// — часто autoplay и некоторые события работают иначе, запустим синхронизацию
    try{
      if(location && location.protocol === 'file:'){
        setTimeout(()=>{ if(!syncStarted) {initSync();} }, 50);
      }
    }catch(e){}

    // Если видео не запустилось в течение 12 секунд — скрываем лоадер (fallback)
    fallbackTimeout = setTimeout(()=>{
      if(!finished){
        if(rafId) {cancelAnimationFrame(rafId);}
        displayed = 100; if(progressText) {progressText.textContent = '100%';}
        setTimeout(showMain, 300);
      }
    },12000);

    // Кнопка пропуска
    // Кнопка "Пропустить" удалена — управление только автоскрытием по окончанию или таймауту

    // Если autoplay заблокирован — таймаут всё равно снимет лоадер
    // попробуем запустить явно
    const playPromise = video.play && video.play();
    if(playPromise && typeof playPromise.then === 'function'){
      playPromise.catch(()=>{
        // проигрывание не разрешено — запускаем симуляцию/синхронизацию вручную
        initSync();
      });
    }
  } else {
    // Нет видео — просто скрываем лоадер
    setTimeout(showMain,800);
  }

  // Логика каталога кодов (загружается после показа main)
  function initCatalog(){
    const catalog = document.getElementById('catalog');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const captcha = document.getElementById('captchaCheck');
    const revealBtn = document.getElementById('revealBtn');
    const codeBox = document.getElementById('codeBox');

    if(!catalog) {return;} // элементы не найдены

    let codes = [];
    let active = null;
    const claimedKey = 'dispenser_claimed';
    const claimed = JSON.parse(localStorage.getItem(claimedKey) || '[]');

    // Load codes from API with fallback
    async function loadCodes(){
      try {
        const response = await fetch('http://localhost:3001/api/codes');
        const data = await response.json();
        codes = data.codes || [];
        render();
      } catch (error) {
        console.error('Error loading codes from API, using fallback data:', error);
        // Fallback data when API is not available
        codes = [
          {"id":1,"title":"Sora Starter Pack","description":"Essential codes for new users","claim_limit":50,"claimed_count":12},
          {"id":2,"title":"Premium Bonus","description":"One-time premium code with extra features","claim_limit":25,"claimed_count":8},
          {"id":3,"title":"VIP Gift","description":"Rare VIP code with exclusive functions","claim_limit":10,"claimed_count":3},
          {"id":4,"title":"Limited Edition","description":"Limited series codes - only 50 available!","claim_limit":50,"claimed_count":27},
          {"id":5,"title":"Creator Promo","description":"Promo code from popular content creator","claim_limit":100,"claimed_count":45}
        ];
        render();
      }
    }

    function render(){
      catalog.innerHTML = '';
      
      if (codes.length === 0) {
        catalog.innerHTML = '<p style="color: var(--muted); text-align: center;">No codes available at the moment. Please try again later.</p>';
        return;
      }
      
      codes.forEach(item=>{
        const card = document.createElement('article');
        card.className = 'card';
        if(claimed.includes(item.id)) {card.classList.add('locked');}
        const available = (item.claim_limit || 1) - (item.claimed_count || 0);
        card.innerHTML = `
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.description || item.desc || '')}</p>
          <div class="code-stats">
            <span class="available">${available} left</span>
            <span class="total">of ${item.claim_limit || 1}</span>
          </div>
        `;
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = claimed.includes(item.id)? 'Claimed' : 'Get Code';
        btn.disabled = claimed.includes(item.id);
        btn.addEventListener('click', ()=> openModal(item));
        card.appendChild(btn);
        catalog.appendChild(card);
      });
    }

    function openModal(item){
      active = item;
      modalTitle.textContent = item.title;
      modalDesc.textContent = item.description || item.desc || '';
      captcha.checked = false;
      codeBox.classList.add('hidden');
      codeBox.textContent = '';
      revealBtn.disabled = false;
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden','false');
    }

    function closeModalFn(){
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden','true');
      active = null;
    }

    async function reveal(){
      if(!active) {return;}
      if(!captcha.checked){ alert('Please confirm you are not a robot'); return; }
      
      // Запрос к API для получения кода
      try {
        revealBtn.disabled = true;
        revealBtn.textContent = 'Getting...';
        
        const response = await fetch(`http://localhost:3001/api/codes/${active.id}/claim`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ captcha: true })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          codeBox.textContent = result.code;
          codeBox.classList.remove('hidden');
          
          // Сохраняем в localStorage что код получен
          if(!claimed.includes(active.id)){
            claimed.push(active.id);
            localStorage.setItem(claimedKey, JSON.stringify(claimed));
            render();
          }
        } else {
          alert(result.error || 'Error getting code');
          revealBtn.disabled = false;
          revealBtn.textContent = 'Reveal Code';
        }
      } catch (error) {
        console.error('Request error:', error);
        // Fallback: show demo code when API is not available
        const demoCode = `SORA-DEMO-${active.id}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        codeBox.textContent = demoCode;
        codeBox.classList.remove('hidden');
        
        // Save to localStorage
        if(!claimed.includes(active.id)){
          claimed.push(active.id);
          localStorage.setItem(claimedKey, JSON.stringify(claimed));
          render();
        }
      }
    }

    function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    if(closeModal) {closeModal.addEventListener('click', closeModalFn);}
    if(revealBtn) {revealBtn.addEventListener('click', reveal);}
    if(modal) {modal.addEventListener('click', (e)=>{ if(e.target === modal) {closeModalFn();} });}

    // Load data from server
    loadCodes();
  }

  // Initialize catalog after loader is hidden
  const originalShowMain = showMain;
  showMain = function(){
    originalShowMain();
    setTimeout(initCatalog, 600); // запустить каталог через 600ms после показа main
  };
})();