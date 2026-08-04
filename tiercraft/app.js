/**
 * TIERCRAFT - CUSTOM TIERLIST MAKER
 * Static Single Page Application
 */

(function () {
  'use strict';

  // LocalStorage Key
  const STORAGE_KEY = 'tiercraft_app_data_v1';

  // Default Presets Configuration
  const PRESETS = {
    standard: [
      { id: 'row-s', label: 'S', color: '#ff4757', items: [] },
      { id: 'row-a', label: 'A', color: '#ffa502', items: [] },
      { id: 'row-b', label: 'B', color: '#eccc68', items: [] },
      { id: 'row-c', label: 'C', color: '#2ed573', items: [] },
      { id: 'row-d', label: 'D', color: '#1e90ff', items: [] }
    ],
    gaming: [
      { id: 'row-sss', label: 'God Tier', color: '#ec4899', items: [] },
      { id: 'row-s', label: 'S', color: '#ff4757', items: [] },
      { id: 'row-a', label: 'A', color: '#ffa502', items: [] },
      { id: 'row-b', label: 'B', color: '#eccc68', items: [] },
      { id: 'row-c', label: 'C', color: '#2ed573', items: [] },
      { id: 'row-f', label: 'F', color: '#718093', items: [] }
    ],
    simple: [
      { id: 'row-excelente', label: 'Excelente', color: '#2ed573', items: [] },
      { id: 'row-bom', label: 'Bom', color: '#1e90ff', items: [] },
      { id: 'row-neutro', label: 'Neutro', color: '#eccc68', items: [] },
      { id: 'row-ruim', label: 'Ruim', color: '#ff4757', items: [] }
    ],
    empty: []
  };

  // Effects are provided locally: bundled assets or sounds synthesized in the browser.
  const SOUND_LIBRARY = {
    swoosh: { label: 'Swoosh', src: 'assets/sounds/swoosh.mp3' },
    pop: { label: 'Pop', synth: true },
    achievement: { label: 'Achievement', synth: true },
    sparkle: { label: 'Sparkle', synth: true },
    impact: { label: 'Impact', synth: true },
    fail: { label: 'Fail', synth: true },
    applause: { label: 'Applause', synth: true }
  };

  let audioContext = null;

  // State
  let state = {
    activeTierListId: 'default',
    tierLists: {
      'default': {
        id: 'default',
        title: 'Minha Tier List Customizada',
        description: 'Clique no título/descrição para editar. Arraste os itens para organizar sua classificação.',
        rows: JSON.parse(JSON.stringify(PRESETS.standard)),
        unrankedItems: [
          { id: 'item-1', type: 'text', text: '⭐ Destaque', bgColor: '#6366f1', textColor: '#ffffff' },
          { id: 'item-2', type: 'text', text: '🔥 Épico', bgColor: '#ff4757', textColor: '#ffffff' },
          { id: 'item-3', type: 'text', text: '⚡ Rápido', bgColor: '#ffa502', textColor: '#ffffff' },
          { id: 'item-4', type: 'text', text: '💎 Diamante', bgColor: '#10b981', textColor: '#ffffff' },
          { id: 'item-5', type: 'text', text: '🚀 Futuro', bgColor: '#a855f7', textColor: '#ffffff' }
        ]
      }
    }
  };

  // Currently dragged item id & touch state
  let draggedItemId = null;
  let touchDragElement = null;
  let touchClone = null;
  let editingItemId = null;

  // DOM Elements References
  const selectTierList = document.getElementById('select-tierlist');
  const btnNewTierList = document.getElementById('btn-new-tierlist');
  const btnRenameTierList = document.getElementById('btn-rename-tierlist');
  const btnDeleteTierList = document.getElementById('btn-delete-tierlist');
  const btnExportImage = document.getElementById('btn-export-image');
  const btnBackupModal = document.getElementById('btn-backup-modal');
  const btnResetBoard = document.getElementById('btn-reset-board');

  const tierListTitle = document.getElementById('tierlist-title');
  const tierListDesc = document.getElementById('tierlist-desc');
  const btnAddRow = document.getElementById('btn-add-row');
  const btnSoundSettings = document.getElementById('btn-sound-settings');
  const tierRowsBoard = document.getElementById('tier-rows-board');

  const unrankedItemsContainer = document.getElementById('unranked-items-container');
  const itemsCountBadge = document.getElementById('items-count-badge');
  const emptyBankMsg = document.getElementById('empty-bank-msg');
  const searchItemsInput = document.getElementById('search-items');
  const btnOpenAddItemModal = document.getElementById('btn-open-add-item-modal');

  // Modals
  const modalItem = document.getElementById('modal-item');
  const modalRow = document.getElementById('modal-row');
  const modalBackup = document.getElementById('modal-backup');
  const modalNewList = document.getElementById('modal-new-list');
  const modalSoundSettings = document.getElementById('modal-sound-settings');

  // Item Form Elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const fileDropArea = document.getElementById('file-drop-area');
  const itemImageFile = document.getElementById('item-image-file');
  const itemImageUrl = document.getElementById('item-image-url');
  const itemImageLabel = document.getElementById('item-image-label');
  const itemTextTitle = document.getElementById('item-text-title');
  const itemBgColor = document.getElementById('item-bg-color');
  const itemTextColor = document.getElementById('item-text-color');
  const textCardPreview = document.getElementById('text-card-preview');
  const btnSaveItem = document.getElementById('btn-save-item');

  // Row Form Elements
  const editRowId = document.getElementById('edit-row-id');
  const rowLabelInput = document.getElementById('row-label-input');
  const rowCustomColor = document.getElementById('row-custom-color');
  const colorDots = document.querySelectorAll('.color-dot');
  const btnSaveRow = document.getElementById('btn-save-row');
  const btnDeleteRow = document.getElementById('btn-delete-row');
  const rowSoundSelect = document.getElementById('row-sound-select');
  const btnPreviewRowSound = document.getElementById('btn-preview-row-sound');

  const listDefaultSound = document.getElementById('list-default-sound');
  const btnPreviewDefaultSound = document.getElementById('btn-preview-default-sound');
  const btnSaveSoundSettings = document.getElementById('btn-save-sound-settings');

  // New List Form Elements
  const newListTitle = document.getElementById('new-list-title');
  const newListPreset = document.getElementById('new-list-preset');
  const btnConfirmNewList = document.getElementById('btn-confirm-new-list');

  // Backup Elements
  const btnDownloadJson = document.getElementById('btn-download-json');
  const inputImportJson = document.getElementById('input-import-json');
  const jsonPreview = document.getElementById('json-preview');
  const btnApplyJsonText = document.getElementById('btn-apply-json-text');

  // Canvas
  const exportCanvas = document.getElementById('export-canvas');

  // ==========================================
  // INITIALIZATION & STATE PERSISTENCE
  // ==========================================

  function init() {
    loadState();
    setupEventListeners();
    renderApp();
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.tierLists && Object.keys(parsed.tierLists).length > 0) {
          state = parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar dados do localStorage:', e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }

  function getActiveList() {
    if (!state.tierLists || Object.keys(state.tierLists).length === 0) {
      state.tierLists = {
        'default': {
          id: 'default',
          title: 'Minha Tier List Customizada',
          description: 'Clique no título/descrição para editar. Arraste os itens para organizar sua classificação.',
          rows: JSON.parse(JSON.stringify(PRESETS.standard)),
          unrankedItems: [
            { id: 'item-1', type: 'text', text: '⭐ Destaque', bgColor: '#6366f1', textColor: '#ffffff' },
            { id: 'item-2', type: 'text', text: '🔥 Épico', bgColor: '#ff4757', textColor: '#ffffff' },
            { id: 'item-3', type: 'text', text: '⚡ Rápido', bgColor: '#ffa502', textColor: '#ffffff' },
            { id: 'item-4', type: 'text', text: '💎 Diamante', bgColor: '#10b981', textColor: '#ffffff' },
            { id: 'item-5', type: 'text', text: '🚀 Futuro', bgColor: '#a855f7', textColor: '#ffffff' }
          ]
        }
      };
      state.activeTierListId = 'default';
    }

    if (!state.tierLists[state.activeTierListId]) {
      const firstId = Object.keys(state.tierLists)[0];
      state.activeTierListId = firstId || 'default';
    }

    const list = state.tierLists[state.activeTierListId];

    if (!list.rows || !Array.isArray(list.rows) || list.rows.length === 0) {
      list.rows = JSON.parse(JSON.stringify(PRESETS.standard));
      saveState();
    }

    if (!list.unrankedItems || !Array.isArray(list.unrankedItems)) {
      list.unrankedItems = [];
      saveState();
    }

    // Migrate saved Tier Lists created before sound effects existed.
    if (typeof list.defaultSoundId === 'undefined') {
      list.defaultSoundId = 'swoosh';
      saveState();
    }

    return list;
  }

  // ==========================================
  // RENDERING LOGIC
  // ==========================================

  function renderApp() {
    renderTierListSelector();

    const activeList = getActiveList();
    tierListTitle.textContent = activeList.title || 'Sem título';
    tierListDesc.textContent = activeList.description || '';

    renderRowsBoard(activeList);
    renderUnrankedItems(activeList);
  }

  function renderTierListSelector() {
    selectTierList.innerHTML = '';
    Object.values(state.tierLists).forEach(list => {
      const option = document.createElement('option');
      option.value = list.id;
      option.textContent = list.title;
      if (list.id === state.activeTierListId) {
        option.selected = true;
      }
      selectTierList.appendChild(option);
    });
  }

  function renderRowsBoard(list) {
    tierRowsBoard.innerHTML = '';

    list.rows.forEach((row, index) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'tier-row';
      rowEl.dataset.rowId = row.id;

      // Badge (Left Side)
      const badgeEl = document.createElement('div');
      badgeEl.className = 'tier-badge-container';
      badgeEl.style.backgroundColor = row.color || '#718093';

      const labelEl = document.createElement('span');
      labelEl.className = 'tier-label';
      labelEl.textContent = row.label || 'TIER';
      badgeEl.appendChild(labelEl);

      // Controls on hover (up, down, settings)
      const controlsEl = document.createElement('div');
      controlsEl.className = 'tier-row-controls';
      
      const btnUp = document.createElement('button');
      btnUp.className = 'btn-row-action';
      btnUp.innerHTML = '▲';
      btnUp.title = 'Mover para cima';
      btnUp.onclick = (e) => { e.stopPropagation(); moveRow(index, -1); };

      const btnDown = document.createElement('button');
      btnDown.className = 'btn-row-action';
      btnDown.innerHTML = '▼';
      btnDown.title = 'Mover para baixo';
      btnDown.onclick = (e) => { e.stopPropagation(); moveRow(index, 1); };

      const btnSettings = document.createElement('button');
      btnSettings.className = 'btn-row-action';
      btnSettings.innerHTML = '⚙️';
      btnSettings.title = 'Configurações da linha';
      btnSettings.onclick = (e) => { e.stopPropagation(); openEditRowModal(row); };

      controlsEl.appendChild(btnUp);
      controlsEl.appendChild(btnDown);
      controlsEl.appendChild(btnSettings);
      badgeEl.appendChild(controlsEl);

      badgeEl.onclick = () => openEditRowModal(row);

      // Drop Zone (Right Side)
      const dropzoneEl = document.createElement('div');
      dropzoneEl.className = 'tier-dropzone dropzone';
      dropzoneEl.dataset.rowId = row.id;

      // Items in row
      row.items.forEach(item => {
        const itemEl = createItemElement(item);
        dropzoneEl.appendChild(itemEl);
      });

      attachDropzoneListeners(dropzoneEl);

      rowEl.appendChild(badgeEl);
      rowEl.appendChild(dropzoneEl);
      tierRowsBoard.appendChild(rowEl);
    });
  }

  function renderUnrankedItems(list) {
    unrankedItemsContainer.innerHTML = '';
    const filterText = searchItemsInput.value.toLowerCase().trim();

    const filteredItems = list.unrankedItems.filter(item => {
      if (!filterText) return true;
      if (item.type === 'text') return item.text.toLowerCase().includes(filterText);
      if (item.type === 'image') return (item.label || '').toLowerCase().includes(filterText);
      return true;
    });

    itemsCountBadge.textContent = list.unrankedItems.length;

    if (filteredItems.length === 0) {
      unrankedItemsContainer.appendChild(emptyBankMsg);
      emptyBankMsg.style.display = 'flex';
    } else {
      emptyBankMsg.style.display = 'none';
      filteredItems.forEach(item => {
        const itemEl = createItemElement(item);
        unrankedItemsContainer.appendChild(itemEl);
      });
    }

    attachDropzoneListeners(unrankedItemsContainer);
  }

  function createItemElement(item) {
    const el = document.createElement('div');
    el.className = 'tier-item';
    el.draggable = true;
    el.dataset.itemId = item.id;

    if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.label || 'Item';
      el.appendChild(img);

      if (item.label) {
        const overlay = document.createElement('div');
        overlay.className = 'item-label-overlay';
        overlay.textContent = item.label;
        el.appendChild(overlay);
      }
    } else if (item.type === 'text') {
      el.classList.add('text-item-style');
      el.style.backgroundColor = item.bgColor || '#2a2d3d';
      el.style.color = item.textColor || '#ffffff';
      el.textContent = item.text || 'Texto';
    }

    // Item actions shown on hover
    const hoverActions = document.createElement('div');
    hoverActions.className = 'item-actions-hover';

    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn-item-action btn-item-edit';
    btnEdit.innerHTML = '&#9998;';
    btnEdit.title = 'Editar item';
    btnEdit.onclick = (e) => {
      e.stopPropagation();
      openEditItemModal(item);
    };

    const btnDelete = document.createElement('button');
    btnDelete.className = 'btn-item-action';
    btnDelete.innerHTML = '&times;';
    btnDelete.title = 'Excluir item';
    btnDelete.onclick = (e) => {
      e.stopPropagation();
      deleteItem(item.id);
    };

    hoverActions.appendChild(btnEdit);
    hoverActions.appendChild(btnDelete);
    el.appendChild(hoverActions);

    // Attach Drag Events
    attachItemDragEvents(el);

    return el;
  }

  // ==========================================
  // DRAG AND DROP ENGINE (HTML5 + TOUCH)
  // ==========================================

  function attachItemDragEvents(itemEl) {
    itemEl.addEventListener('dragstart', (e) => {
      draggedItemId = itemEl.dataset.itemId;
      itemEl.classList.add('dragging');
      e.dataTransfer.setData('text/plain', draggedItemId);
      e.dataTransfer.effectAllowed = 'move';
    });

    itemEl.addEventListener('dragend', () => {
      itemEl.classList.remove('dragging');
      draggedItemId = null;
      document.querySelectorAll('.dropzone').forEach(dz => dz.classList.remove('drag-over'));
    });

    // Touch Support for Mobile
    itemEl.addEventListener('touchstart', (e) => {
      if (e.target.closest('.item-actions-hover')) return;
      handleTouchStart(e);
    }, { passive: false });
  }

  function attachDropzoneListeners(dropzoneEl) {
    dropzoneEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      dropzoneEl.classList.add('drag-over');
    });

    dropzoneEl.addEventListener('dragleave', (e) => {
      if (!dropzoneEl.contains(e.relatedTarget)) {
        dropzoneEl.classList.remove('drag-over');
      }
    });

    dropzoneEl.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzoneEl.classList.remove('drag-over');
      const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
      const targetRowId = dropzoneEl.dataset.rowId;

      if (itemId && targetRowId) {
        moveItemToRow(itemId, targetRowId);
      }
    });
  }

  // Mobile Touch Drag Helpers
  function handleTouchStart(e) {
    const touch = e.touches[0];
    touchDragElement = e.currentTarget;
    draggedItemId = touchDragElement.dataset.itemId;

    // Create visual clone following touch pointer
    touchClone = touchDragElement.cloneNode(true);
    touchClone.style.position = 'fixed';
    touchClone.style.pointerEvents = 'none';
    touchClone.style.zIndex = '9999';
    touchClone.style.opacity = '0.85';
    touchClone.style.transform = 'scale(1.1)';
    touchClone.style.left = `${touch.clientX - 40}px`;
    touchClone.style.top = `${touch.clientY - 40}px`;
    document.body.appendChild(touchClone);

    touchDragElement.classList.add('dragging');

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  }

  function handleTouchMove(e) {
    if (!touchClone) return;
    e.preventDefault(); // Prevent scrolling while dragging
    const touch = e.touches[0];
    touchClone.style.left = `${touch.clientX - 40}px`;
    touchClone.style.top = `${touch.clientY - 40}px`;

    // Highlight hovered dropzone
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    document.querySelectorAll('.dropzone').forEach(dz => dz.classList.remove('drag-over'));
    const dropzone = targetEl ? targetEl.closest('.dropzone') : null;
    if (dropzone) {
      dropzone.classList.add('drag-over');
    }
  }

  function handleTouchEnd(e) {
    if (touchClone) {
      touchClone.remove();
      touchClone = null;
    }
    if (touchDragElement) {
      touchDragElement.classList.remove('dragging');
    }

    const touch = e.changedTouches[0];
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropzone = targetEl ? targetEl.closest('.dropzone') : null;

    if (dropzone && draggedItemId) {
      const targetRowId = dropzone.dataset.rowId;
      moveItemToRow(draggedItemId, targetRowId);
    }

    document.querySelectorAll('.dropzone').forEach(dz => dz.classList.remove('drag-over'));
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
    touchDragElement = null;
    draggedItemId = null;
  }

  // State item mover logic
  function moveItemToRow(itemId, targetRowId) {
    const list = getActiveList();
    let foundItem = null;

    // Remove item from wherever it currently is
    list.unrankedItems = list.unrankedItems.filter(i => {
      if (i.id === itemId) { foundItem = i; return false; }
      return true;
    });

    list.rows.forEach(r => {
      r.items = r.items.filter(i => {
        if (i.id === itemId) { foundItem = i; return false; }
        return true;
      });
    });

    if (!foundItem) return;

    // Place into target row or unranked
    if (targetRowId === 'unranked') {
      list.unrankedItems.push(foundItem);
    } else {
      const targetRow = list.rows.find(r => r.id === targetRowId);
      if (targetRow) {
        targetRow.items.push(foundItem);
        playRowSound(targetRow, list);
      } else {
        list.unrankedItems.push(foundItem);
      }
    }

    saveState();
    renderApp();
  }

  function getSoundIdForRow(row, list) {
    return row.soundId && row.soundId !== 'default' ? row.soundId : list.defaultSoundId;
  }

  function playSound(soundId) {
    const sound = SOUND_LIBRARY[soundId];
    if (!sound) return;

    if (sound.src) {
      const audio = new Audio(sound.src);
      audio.volume = 0.7;
      audio.play().catch(() => {
        // A browser can block sound when it no longer considers the drop a user gesture.
      });
      return;
    }

    playSynthSound(soundId);
  }

  function getAudioContext() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      audioContext = new AudioContextClass();
    }
    if (audioContext.state === 'suspended') audioContext.resume();
    return audioContext;
  }

  function playTone(context, time, frequency, duration, type = 'sine', volume = 0.08, endFrequency = frequency) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), time + duration);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(volume, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.02);
  }

  function playNoise(context, time, duration, volume = 0.05) {
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) samples[index] = Math.random() * 2 - 1;

    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    source.buffer = buffer;
    source.connect(gain).connect(context.destination);
    source.start(time);
  }

  function playSynthSound(soundId) {
    const context = getAudioContext();
    if (!context) return;
    const time = context.currentTime;

    switch (soundId) {
      case 'pop':
        playTone(context, time, 700, 0.13, 'sine', 0.09, 460);
        break;
      case 'achievement':
        [523, 659, 784].forEach((frequency, index) => playTone(context, time + index * 0.09, frequency, 0.16, 'triangle', 0.07));
        break;
      case 'sparkle':
        [1320, 1760, 2093].forEach((frequency, index) => playTone(context, time + index * 0.06, frequency, 0.12, 'sine', 0.045, frequency * 1.15));
        break;
      case 'impact':
        playTone(context, time, 180, 0.25, 'triangle', 0.13, 58);
        playNoise(context, time, 0.08, 0.025);
        break;
      case 'fail':
        [430, 340, 255].forEach((frequency, index) => playTone(context, time + index * 0.1, frequency, 0.15, 'sawtooth', 0.05, frequency * 0.82));
        break;
      case 'applause':
        [0, 0.07, 0.14, 0.22, 0.3].forEach(offset => playNoise(context, time + offset, 0.09, 0.05));
        break;
    }
  }

  function playRowSound(row, list = getActiveList()) {
    playSound(getSoundIdForRow(row, list));
  }

  function deleteItem(itemId) {
    const list = getActiveList();
    list.unrankedItems = list.unrankedItems.filter(i => i.id !== itemId);
    list.rows.forEach(r => {
      r.items = r.items.filter(i => i.id !== itemId);
    });
    saveState();
    renderApp();
  }

  // ==========================================
  // TIER ROWS MANAGEMENT
  // ==========================================

  function moveRow(index, direction) {
    const list = getActiveList();
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= list.rows.length) return;

    const temp = list.rows[index];
    list.rows[index] = list.rows[newIndex];
    list.rows[newIndex] = temp;

    saveState();
    renderApp();
  }

  function openEditRowModal(row) {
    editRowId.value = row.id;
    rowLabelInput.value = row.label;
    rowCustomColor.value = row.color;
    if (rowSoundSelect) {
      rowSoundSelect.value = row.soundId || 'default';
    }

    colorDots.forEach(dot => {
      if (dot.dataset.color.toLowerCase() === row.color.toLowerCase()) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    openModal(modalRow);
  }

  function addNewRow() {
    const list = getActiveList();
    const newRowId = 'row-' + Date.now();
    const presetColors = ['#ff4757', '#ffa502', '#eccc68', '#2ed573', '#1e90ff', '#9b59b6', '#ec4899'];
    const randomColor = presetColors[list.rows.length % presetColors.length];

    list.rows.push({
      id: newRowId,
      label: 'NOVO',
      color: randomColor,
      soundId: 'default',
      items: []
    });

    saveState();
    renderApp();
  }

  // ==========================================
  // ITEM CREATION & IMAGE COMPRESSION
  // ==========================================

  function findItemById(itemId) {
    const list = getActiveList();
    const unrankedItem = list.unrankedItems.find(item => item.id === itemId);
    if (unrankedItem) return unrankedItem;

    for (const row of list.rows) {
      const rowItem = row.items.find(item => item.id === itemId);
      if (rowItem) return rowItem;
    }

    return null;
  }

  function selectItemTab(tabId) {
    tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
    tabContents.forEach(content => content.classList.toggle('active', content.id === tabId));
  }

  function openNewItemModal() {
    resetItemForm();
    document.getElementById('modal-item-title').textContent = 'Adicionar Novo Item ao Tier';
    btnSaveItem.textContent = 'Adicionar Item';
    selectItemTab('tab-image');
    openModal(modalItem);
  }

  function openEditItemModal(item) {
    resetItemForm();
    editingItemId = item.id;
    document.getElementById('modal-item-title').textContent = 'Editar Item';
    btnSaveItem.textContent = 'Salvar Alterações';

    if (item.type === 'image') {
      selectItemTab('tab-image');
      itemImageUrl.value = item.src || '';
      itemImageLabel.value = item.label || '';
    } else {
      selectItemTab('tab-text');
      itemTextTitle.value = item.text || '';
      itemBgColor.value = item.bgColor || '#2a2d3d';
      itemTextColor.value = item.textColor || '#ffffff';
      textCardPreview.textContent = item.text || 'Texto de Exemplo';
      textCardPreview.style.backgroundColor = item.bgColor || '#2a2d3d';
      textCardPreview.style.color = item.textColor || '#ffffff';
    }

    openModal(modalItem);
  }

  function handleSaveItem() {
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    const list = getActiveList();
    const itemBeingEdited = editingItemId ? findItemById(editingItemId) : null;

    if (activeTab === 'tab-image') {
      const urlValue = itemImageUrl.value.trim();
      const labelValue = itemImageLabel.value.trim();

      if (urlValue) {
        if (itemBeingEdited) {
          itemBeingEdited.type = 'image';
          itemBeingEdited.src = urlValue;
          itemBeingEdited.label = labelValue;
          delete itemBeingEdited.text;
          delete itemBeingEdited.bgColor;
          delete itemBeingEdited.textColor;
        } else {
          list.unrankedItems.push({
            id: 'item-' + Date.now(),
            type: 'image',
            src: urlValue,
            label: labelValue
          });
        }
        saveState();
        renderApp();
        closeModal(modalItem);
        resetItemForm();
      } else if (itemImageFile.files.length > 0) {
        processImageFiles(itemBeingEdited ? [itemImageFile.files[0]] : Array.from(itemImageFile.files), labelValue, itemBeingEdited);
        closeModal(modalItem);
        resetItemForm();
      } else {
        alert('Por favor, selecione uma imagem do dispositivo ou informe uma URL.');
      }
    } else if (activeTab === 'tab-text') {
      const textValue = itemTextTitle.value.trim();
      if (!textValue) {
        alert('Por favor, informe o texto do card.');
        return;
      }

      if (itemBeingEdited) {
        itemBeingEdited.type = 'text';
        itemBeingEdited.text = textValue;
        itemBeingEdited.bgColor = itemBgColor.value;
        itemBeingEdited.textColor = itemTextColor.value;
        delete itemBeingEdited.src;
        delete itemBeingEdited.label;
      } else {
        list.unrankedItems.push({
          id: 'item-' + Date.now(),
          type: 'text',
          text: textValue,
          bgColor: itemBgColor.value,
          textColor: itemTextColor.value
        });
      }
      saveState();
      renderApp();
      closeModal(modalItem);
      resetItemForm();
    }
  }

  // Process uploaded images & downscale to Base64 to save storage space
  function processImageFiles(files, customLabel, itemBeingEdited = null) {
    const list = getActiveList();
    let processed = 0;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Downscale canvas
          const canvas = document.createElement('canvas');
          const maxDim = 450;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

          if (itemBeingEdited) {
            itemBeingEdited.type = 'image';
            itemBeingEdited.src = compressedBase64;
            itemBeingEdited.label = customLabel || file.name.replace(/\.[^/.]+$/, "");
            delete itemBeingEdited.text;
            delete itemBeingEdited.bgColor;
            delete itemBeingEdited.textColor;
          } else {
            list.unrankedItems.push({
              id: 'item-' + Date.now() + '-' + index,
              type: 'image',
              src: compressedBase64,
              label: customLabel || file.name.replace(/\.[^/.]+$/, "")
            });
          }

          processed++;
          if (processed === files.length) {
            saveState();
            renderApp();
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function resetItemForm() {
    editingItemId = null;
    itemImageFile.value = '';
    itemImageUrl.value = '';
    itemImageLabel.value = '';
    itemTextTitle.value = '';
    textCardPreview.textContent = 'Texto de Exemplo';
    textCardPreview.style.backgroundColor = '#2a2d3d';
    textCardPreview.style.color = '#ffffff';
  }

  // ==========================================
  // BACKUP JSON IMPORT / EXPORT
  // ==========================================

  function exportBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `tiercraft-backup-${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function importBackupJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.tierLists) {
        state = parsed;
        saveState();
        renderApp();
        alert('Backup importado com sucesso!');
        closeModal(modalBackup);
      } else {
        alert('Arquivo JSON inválido. Estrutura incorreta.');
      }
    } catch (e) {
      alert('Erro ao processar arquivo JSON: ' + e.message);
    }
  }

  // ==========================================
  // EXPORT TO PNG IMAGE ENGINE (CANVAS)
  // ==========================================

  function exportTierListToPNG() {
    const list = getActiveList();
    const ctx = exportCanvas.getContext('2d');

    const boardWidth = 1000;
    const rowHeight = 110;
    const padding = 24;
    const headerHeight = 90;
    const totalHeight = headerHeight + (list.rows.length * (rowHeight + 8)) + padding * 2;

    exportCanvas.width = boardWidth;
    exportCanvas.height = totalHeight;

    // Background
    ctx.fillStyle = '#0b0d14';
    ctx.fillRect(0, 0, boardWidth, totalHeight);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Outfit, sans-serif';
    ctx.fillText(list.title || 'Tier List', padding, padding + 32);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Plus Jakarta Sans, sans-serif';
    ctx.fillText(list.description || '', padding, padding + 54);

    let currentY = padding + headerHeight;

    // Preload image promises for canvas rendering
    const imageLoadPromises = [];

    list.rows.forEach(row => {
      row.items.forEach(item => {
        if (item.type === 'image' && item.src) {
          const p = new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve({ id: item.id, imgObj: img });
            img.onerror = () => resolve({ id: item.id, imgObj: null });
            img.src = item.src;
          });
          imageLoadPromises.push(p);
        }
      });
    });

    Promise.all(imageLoadPromises).then(loadedImages => {
      const imgMap = {};
      loadedImages.forEach(res => {
        if (res.imgObj) imgMap[res.id] = res.imgObj;
      });

      // Draw rows
      list.rows.forEach(row => {
        // Row background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.fillRect(padding, currentY, boardWidth - (padding * 2), rowHeight);

        // Badge Box (Left)
        const badgeWidth = 280;
        ctx.fillStyle = row.color || '#718093';
        ctx.fillRect(padding, currentY, badgeWidth, rowHeight);

        // Label Text
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(row.label || '', padding + (badgeWidth / 2), currentY + (rowHeight / 2));

        // Reset text alignment
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        // Draw items inside row
        let itemX = padding + badgeWidth + 12;
        const itemY = currentY + 15;
        const itemSize = 80;

        row.items.forEach(item => {
          if (itemX + itemSize > boardWidth - padding) return; // Wrap limit preview

          if (item.type === 'image') {
            const imgObj = imgMap[item.id];
            if (imgObj) {
              ctx.drawImage(imgObj, itemX, itemY, itemSize, itemSize);
            } else {
              ctx.fillStyle = '#1c2232';
              ctx.fillRect(itemX, itemY, itemSize, itemSize);
            }
          } else if (item.type === 'text') {
            ctx.fillStyle = item.bgColor || '#2a2d3d';
            ctx.fillRect(itemX, itemY, itemSize, itemSize);

            ctx.fillStyle = item.textColor || '#ffffff';
            ctx.font = 'bold 12px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Simple text truncate for canvas
            let txt = item.text || '';
            if (txt.length > 10) txt = txt.substring(0, 8) + '..';

            ctx.fillText(txt, itemX + (itemSize / 2), itemY + (itemSize / 2));
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
          }

          itemX += itemSize + 8;
        });

        currentY += rowHeight + 8;
      });

      // Watermark / Brand
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Outfit, sans-serif';
      ctx.fillText('Criado com TierCraft - Host no GitHub Pages', padding, totalHeight - 12);

      // Trigger Download
      const link = document.createElement('a');
      link.download = `${(list.title || 'tierlist').toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    });
  }

  // ==========================================
  // EVENT LISTENERS & MODALS LOGIC
  // ==========================================

  function setupEventListeners() {
    // Tierlist selector
    selectTierList.addEventListener('change', (e) => {
      state.activeTierListId = e.target.value;
      saveState();
      renderApp();
    });

    // Editable Title & Desc
    tierListTitle.addEventListener('blur', () => {
      const activeList = getActiveList();
      activeList.title = tierListTitle.textContent.trim() || 'Minha Tier List';
      saveState();
      renderTierListSelector();
    });

    tierListDesc.addEventListener('blur', () => {
      const activeList = getActiveList();
      activeList.description = tierListDesc.textContent.trim();
      saveState();
    });

    // Header buttons
    btnNewTierList.addEventListener('click', () => {
      newListTitle.value = '';
      openModal(modalNewList);
    });

    btnRenameTierList.addEventListener('click', () => {
      const activeList = getActiveList();
      const newTitle = prompt('Novo nome da Tier List:', activeList.title);
      if (newTitle && newTitle.trim()) {
        activeList.title = newTitle.trim();
        saveState();
        renderApp();
      }
    });

    btnDeleteTierList.addEventListener('click', () => {
      const keys = Object.keys(state.tierLists);
      if (keys.length <= 1) {
        alert('Você precisa ter pelo menos uma Tier List.');
        return;
      }
      if (confirm(`Excluir permanentemente "${getActiveList().title}"?`)) {
        delete state.tierLists[state.activeTierListId];
        state.activeTierListId = Object.keys(state.tierLists)[0];
        saveState();
        renderApp();
      }
    });

    btnExportImage.addEventListener('click', exportTierListToPNG);
    btnBackupModal.addEventListener('click', () => openModal(modalBackup));
    if (btnFocusMode) btnFocusMode.addEventListener('click', () => toggleFocusMode(true));
    if (btnExitFocus) btnExitFocus.addEventListener('click', () => toggleFocusMode(false));

    btnResetBoard.addEventListener('click', () => {
      if (confirm('Deseja mover TODOS os itens das fileiras de volta para os não classificados?')) {
        const list = getActiveList();
        list.rows.forEach(r => {
          list.unrankedItems.push(...r.items);
          r.items = [];
        });
        saveState();
        renderApp();
      }
    });

    btnAddRow.addEventListener('click', addNewRow);
    if (btnSoundSettings && listDefaultSound && modalSoundSettings) {
      btnSoundSettings.addEventListener('click', () => {
        listDefaultSound.value = getActiveList().defaultSoundId || 'none';
        openModal(modalSoundSettings);
      });
    }
    btnOpenAddItemModal.addEventListener('click', openNewItemModal);
    searchItemsInput.addEventListener('input', () => renderUnrankedItems(getActiveList()));

    // Tabs inside Add Item Modal
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        selectItemTab(btn.dataset.tab);
      });
    });

    // File drop area inside modal
    fileDropArea.addEventListener('click', () => itemImageFile.click());
    fileDropArea.addEventListener('dragover', (e) => { e.preventDefault(); fileDropArea.style.borderColor = '#6366f1'; });
    fileDropArea.addEventListener('dragleave', () => { fileDropArea.style.borderColor = ''; });
    fileDropArea.addEventListener('drop', (e) => {
      e.preventDefault();
      fileDropArea.style.borderColor = '';
      if (e.dataTransfer.files.length > 0) {
        itemImageFile.files = e.dataTransfer.files;
      }
    });

    // Direct drag & drop images onto unranked bank
    unrankedItemsContainer.addEventListener('dragover', (e) => e.preventDefault());
    unrankedItemsContainer.addEventListener('drop', (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        e.preventDefault();
        processImageFiles(Array.from(e.dataTransfer.files), '');
      }
    });

    // Text Card Live Preview
    itemTextTitle.addEventListener('input', () => {
      textCardPreview.textContent = itemTextTitle.value.trim() || 'Texto de Exemplo';
    });
    itemBgColor.addEventListener('input', () => {
      textCardPreview.style.backgroundColor = itemBgColor.value;
    });
    itemTextColor.addEventListener('input', () => {
      textCardPreview.style.color = itemTextColor.value;
    });

    btnSaveItem.addEventListener('click', handleSaveItem);

    // Color Dots in Row Modal
    colorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        colorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        rowCustomColor.value = dot.dataset.color;
      });
    });

    btnSaveRow.addEventListener('click', () => {
      const list = getActiveList();
      const row = list.rows.find(r => r.id === editRowId.value);
      if (row) {
        row.label = rowLabelInput.value.trim() || 'TIER';
        row.color = rowCustomColor.value;
        if (rowSoundSelect) row.soundId = rowSoundSelect.value;
        saveState();
        renderApp();
        closeModal(modalRow);
      }
    });

    if (btnPreviewRowSound && rowSoundSelect) {
      btnPreviewRowSound.addEventListener('click', () => {
        const list = getActiveList();
        const soundId = rowSoundSelect.value === 'default' ? list.defaultSoundId : rowSoundSelect.value;
        playSound(soundId);
      });
    }

    if (btnPreviewDefaultSound && listDefaultSound) {
      btnPreviewDefaultSound.addEventListener('click', () => playSound(listDefaultSound.value));
    }

    if (btnSaveSoundSettings && listDefaultSound && modalSoundSettings) {
      btnSaveSoundSettings.addEventListener('click', () => {
        getActiveList().defaultSoundId = listDefaultSound.value;
        saveState();
        closeModal(modalSoundSettings);
      });
    }

    btnDeleteRow.addEventListener('click', () => {
      const list = getActiveList();
      const row = list.rows.find(r => r.id === editRowId.value);
      if (!row) return;

      if (confirm(`Excluir a fileira "${row.label}"? Os itens contidos nela retornarão para o banco de itens.`)) {
        list.unrankedItems.push(...row.items);
        list.rows = list.rows.filter(r => r.id !== editRowId.value);
        saveState();
        renderApp();
        closeModal(modalRow);
      }
    });

    // New TierList modal confirmation
    btnConfirmNewList.addEventListener('click', () => {
      const title = newListTitle.value.trim() || 'Nova Tier List';
      const presetKey = newListPreset.value;
      const newId = 'list-' + Date.now();

      const presetRows = PRESETS[presetKey] ? JSON.parse(JSON.stringify(PRESETS[presetKey])) : [];

      state.tierLists[newId] = {
        id: newId,
        title: title,
        description: 'Clique aqui para adicionar uma descrição',
        rows: presetRows,
        unrankedItems: []
      };

      state.activeTierListId = newId;
      saveState();
      renderApp();
      closeModal(modalNewList);
    });

    // Backup actions
    btnDownloadJson.addEventListener('click', exportBackup);
    inputImportJson.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => importBackupJSON(evt.target.result);
        reader.readAsText(file);
      }
    });

    btnApplyJsonText.addEventListener('click', () => {
      const txt = jsonPreview.value.trim();
      if (txt) importBackupJSON(txt);
    });

    // Generic Modal Close handler
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.close;
        closeModal(document.getElementById(modalId));
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal(backdrop);
      });
    });
  }

  function openModal(modalEl) {
    modalEl.classList.add('active');
    if (modalEl === modalBackup) {
      jsonPreview.value = JSON.stringify(state, null, 2);
    }
  }

  function closeModal(modalEl) {
    modalEl.classList.remove('active');
  }

  // Focus / Presentation Mode Elements
  const btnFocusMode = document.getElementById('btn-focus-mode');
  const btnExitFocus = document.getElementById('btn-exit-focus');
  const focusExitToast = document.getElementById('focus-exit-toast');
  let focusToastTimer = null;

  function toggleFocusMode(enable) {
    const isFocus = enable !== undefined ? enable : !document.body.classList.contains('focus-mode');
    if (isFocus) {
      document.body.classList.add('focus-mode');
      if (focusExitToast) {
        focusExitToast.classList.add('toast-show');
        if (focusToastTimer) clearTimeout(focusToastTimer);
        focusToastTimer = setTimeout(() => {
          focusExitToast.classList.remove('toast-show');
        }, 2800);
      }
    } else {
      document.body.classList.remove('focus-mode');
      if (focusExitToast) {
        focusExitToast.classList.remove('toast-show');
      }
      if (focusToastTimer) clearTimeout(focusToastTimer);
    }
  }

  // Keyboard shortcut listener (F for Focus Mode, ESC to Exit)
  document.addEventListener('keydown', (e) => {
    // Ignore hotkeys if user is currently typing in input, textarea, or contenteditable
    const activeEl = document.activeElement;
    const isTyping = activeEl && (
      activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'TEXTAREA' ||
      activeEl.isContentEditable
    );

    if (isTyping) return;

    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleFocusMode();
    } else if (e.key === 'Escape') {
      if (document.body.classList.contains('focus-mode')) {
        e.preventDefault();
        toggleFocusMode(false);
      }
    }
  });

  // Start application
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
