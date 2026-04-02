// js/main.js — 완전 수정본
import { initDomRefs } from './state.js';
import { resetView, toggleGrid } from './transform.js';
import { initLayout } from './layout.js';
import { setTool, setToolOrPanel, setColor, setStroke, activatePending, revertToPan } from './tools.js';
import { initPenPanel } from './penPanel.js';
import { initMouseEvents } from './mouse.js';
import { initTouchEvents } from './touch.js';
import { initKeyboard } from './keyboard.js';
import { initContextMenu } from './contextMenu.js';
import { initImageInput } from './image.js';
import { initPersistence, saveBoard, clearAll, autoSave, persistence, restoreBoard } from './persistence.js';
import { addSticky } from './sticky.js';
import { addCardWindow } from './card.js';       // ★ FIX: 누락된 card.js import 추가
import { createStartupWindow } from './startup.js';
import { mkSvg, setAttrs } from './svg.js';
import { initToolbar, updateSatellitePositions } from './toolbar.js';
import { initHistory, undo, redo } from './history.js';
import { initToolOrb, notifyToolChanged } from './toolOrb.js';
import { registerToolFunctions, registerNotifyToolChanged } from './toolBridge.js';

persistence._svg = { mkSvg, setAttrs };

function init() {
  initDomRefs();

  registerToolFunctions(setTool, activatePending, revertToPan);
  registerNotifyToolChanged(notifyToolChanged);

  initLayout();
  initPenPanel();
  initMouseEvents();
  initTouchEvents();
  initKeyboard();
  initContextMenu();
  initImageInput();
  initPersistence();
  initToolbar();
  requestAnimationFrame(() => updateSatellitePositions());
  initToolOrb();

  document.getElementById('zoom-pill').addEventListener('click', resetView);

  document.querySelectorAll('#toolbar [data-tool], #mode-bar [data-tool]').forEach(btn => {
    btn.addEventListener('click', () => setTool(btn.dataset.tool));
  });

  document.querySelectorAll('#toolbar [data-tool-or-panel]').forEach(btn => {
    btn.addEventListener('click', () => setToolOrPanel(btn.dataset.toolOrPanel));
  });

  const actions = {
    addSticky:   () => addSticky(),
    addCard:     () => addCardWindow(),
    addImage:    () => document.getElementById('img-in').click(),
    toggleGrid:  () => toggleGrid(),
    save:        () => saveBoard(),
    load:        () => document.getElementById('load-in').click(),
    clearAll:    () => clearAll(),
    undo:        () => undo(),
    redo:        () => redo(),
  };
  document.querySelectorAll('[data-action]').forEach(btn => {
    const fn = actions[btn.dataset.action];
    if (fn) btn.addEventListener('click', fn);
  });

  document.querySelectorAll('#color-tray .cdot').forEach(el => {
    el.addEventListener('click', () => setColor(el));
  });

  document.querySelectorAll('#color-tray .sbtn').forEach(el => {
    el.addEventListener('click', () => setStroke(el, parseInt(el.dataset.sw)));
  });

  autoSave();

  let hasAutosave = false;
  try {
    const saved = localStorage.getItem('canvas-autosave');
    if (saved) {
      const data = JSON.parse(saved);
      if ((data.elements && data.elements.length > 0) || (data.strokes && data.strokes.length > 0)) {
        restoreBoard(data);
        hasAutosave = true;
      }
    }
  } catch (e) { /* ignore */ }

  if (!hasAutosave) {
    createStartupWindow();
  }

  setTimeout(() => initHistory(), 100);

  console.log('∞ Canvas 0.01 — Modular loaded');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
