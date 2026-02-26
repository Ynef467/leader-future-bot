// Универсальный хелпер для "кнопок" с поддержкой мыши и клавиатуры
const makeAccessibleButton = (element, handler, options = {}) => {

  if (!element || element.__lfbAccessibleBound) return;

  const { once = false } = options;

  element.setAttribute('role', 'button');
  element.setAttribute('tabindex', '0');

  const onClick = (event) => {
    event.preventDefault();
    handler(event);
  };

  const onKeydown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handler(event);
    }
  };

  element.addEventListener('click', onClick, { once });
  element.addEventListener('keydown', onKeydown, { once });
  element.__lfbAccessibleBound = true;
};

window.addEventListener('DOMContentLoaded', () => {
  // Находим все аккордеоны на странице
  const accordions = document.querySelectorAll('.plan__accordion');

  if (!accordions.length) {
    console.error('[LPC Warning]: Аккордеоны не найдены на странице');
    return;
  }

  accordions.forEach(accordion => {
    // Находим элементы внутри текущего аккордеона
    const arrow = accordion.querySelector('.plan__arrow svg');
    const cards = accordion.querySelector('.plan__cards');

    if (!arrow || !cards) {
      console.error('[LPC Warning]: Не найдены необходимые элементы в аккордеоне');
      return;
    }

    // Изначально скрываем карточки
    cards.style.display = 'none';

    // Добавляем ARIA атрибуты для доступности
    accordion.setAttribute('aria-expanded', 'false');
    accordion.setAttribute('aria-controls', `cards-${Math.random().toString(36).substr(2, 9)}`);
    cards.setAttribute('id', accordion.getAttribute('aria-controls'));
    cards.setAttribute('role', 'region');
    cards.setAttribute('aria-labelledby', accordion.querySelector('.plan__accordion-title').id || `title-${Math.random().toString(36).substr(2, 9)}`);

    // Добавляем ID к заголовку если его нет
    const title = accordion.querySelector('.plan__accordion-title');
    if (title && !title.id) {
      title.id = cards.getAttribute('aria-labelledby');
    }

    const toggleAccordion = () => {
      const isExpanded = accordion.classList.contains('active');

      if (isExpanded) {
        accordion.classList.remove('active');
        accordion.setAttribute('aria-expanded', 'false');
        cards.style.display = 'none';
      } else {
        accordion.classList.add('active');
        accordion.setAttribute('aria-expanded', 'true');
        cards.style.display = 'flex';
      }
    };

    makeAccessibleButton(accordion, toggleAccordion);

  });
});

window.addEventListener("DOMContentLoaded", () => {
  const tabsWrappers = document.querySelectorAll(".plan__tabs");

  if (!tabsWrappers.length) {
    console.error("[LPC Warning]: Табы не найдены на странице");
    return;
  }

  tabsWrappers.forEach((wrapper) => {
    const tabButtons = wrapper.querySelectorAll(".plan__tab-btn");
    const tabPanels = wrapper.querySelectorAll(".plan__days");

    if (!tabButtons.length || !tabPanels.length) {
      console.error("[LPC Warning]: Кнопки или панели табов не найдены");
      return;
    }

    // ===== ARIA roles =====
    wrapper.setAttribute("role", "tablist");

    tabButtons.forEach((btn, index) => {
      const tabId = `tab-${index}-${Math.random().toString(36).slice(2, 7)}`;
      const panel = wrapper.querySelector(`.plan__days[data-tab-id="${index + 1}"]`);

      if (!panel) {
        console.error(`[LPC Warning]: Панель для таба ${index + 1} не найдена`);
        return;
      }

      const panelId = `panel-${index}-${Math.random().toString(36).slice(2, 7)}`;

      // roles
      btn.setAttribute("role", "tab");
      panel.setAttribute("role", "tabpanel");

      // ids
      btn.id = tabId;
      panel.id = panelId;

      btn.setAttribute("aria-controls", panelId);
      panel.setAttribute("aria-labelledby", tabId);

      const isActive = btn.classList.contains("active");

      btn.setAttribute("aria-selected", isActive);
      btn.setAttribute("tabindex", isActive ? "-1" : "0");

      panel.hidden = !isActive;
    });

    // ===== переключение =====
    const activateTab = (clickedBtn) => {
      tabButtons.forEach((btn, index) => {
        const panel = wrapper.querySelector(`.plan__days[data-tab-id="${index + 1}"]`);

        const isCurrent = btn === clickedBtn;

        btn.classList.toggle("active", isCurrent);
        btn.setAttribute("aria-selected", isCurrent);
        btn.setAttribute("tabindex", isCurrent ? "-1" : "0");

        if (panel) {
          panel.hidden = !isCurrent;
        }
      });
    };

    // ===== events =====
    tabButtons.forEach((btn) => {
      // mouse
      btn.addEventListener("click", () => activateTab(btn));

      // keyboard accessibility
      btn.addEventListener("keydown", (e) => {
        const currentIndex = [...tabButtons].indexOf(btn);

        let newIndex = null;

        if (e.key === "ArrowRight") {
          newIndex = (currentIndex + 1) % tabButtons.length;
        }

        if (e.key === "ArrowLeft") {
          newIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
        }

        if (newIndex !== null) {
          e.preventDefault();
          tabButtons[newIndex].focus();
          activateTab(tabButtons[newIndex]);
        }
      });
    });
  });
});

window.addEventListener('DOMContentLoaded', () => {
  const checkboxes = document.querySelectorAll('.checklist__checkbox');

  if (!checkboxes.length) {
    console.error('[LPC Warning]: Чекбоксы не найдены');
    return;
  }

  const STORAGE_KEY = 'checklist-state';
  const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

  checkboxes.forEach(checkbox => {
    const id = checkbox.dataset.checkboxId;

    if (!id) {
      console.error('[LPC Warning]: Нет data-checkbox-id');
      return;
    }

    // восстановление состояния
    const isChecked = Boolean(savedState[id]);

    checkbox.classList.toggle('checked', isChecked);
    checkbox.setAttribute('aria-checked', isChecked);

    const toggleCheckbox = () => {
      const newState = checkbox.getAttribute('aria-checked') !== 'true';

      checkbox.classList.toggle('checked', newState);
      checkbox.setAttribute('aria-checked', newState);

      savedState[id] = newState;

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(savedState)
      );
    };

    checkbox.addEventListener('click', toggleCheckbox);

    // SPACE = toggle (checkbox behaviour)
    checkbox.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleCheckbox();
      }
    });

  });

});

window.addEventListener('DOMContentLoaded', () => {
  const screens = document.querySelectorAll('.screen');

  if (!screens.length) {
    console.error('[LPC Warning]: Экраны с классом .screen не найдены');
    return;
  }

  const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const STORAGE_KEY = 'lfb_state_v1';
  const MAX_POINTS = 8;

  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { currentScreen: 'start', currentTaskId: null, completed: {} };
      const parsed = JSON.parse(raw);
      return {
        currentScreen: parsed.currentScreen || 'start',
        currentTaskId: parsed.currentTaskId || null,
        completed: parsed.completed && typeof parsed.completed === 'object' ? parsed.completed : {}
      };
    } catch (e) {
      console.warn('[LPC Warning]: Ошибка чтения localStorage');
      return { currentScreen: 'start', currentTaskId: null, completed: {} };
    }
  };

  const saveState = (s) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch (e) {
      console.warn('[LPC Warning]: Не удалось сохранить состояние в localStorage');
    }
  };

  let state = loadState();

  // taskId -> элемент карточки на карте, чтобы помечать выполненные задачи
  const taskItemById = {};

  const setTaskItemCollected = (taskId, collected) => {
    const el = taskItemById[taskId];
    if (!el) return;
    el.classList.toggle('collect', !!collected);
  };

  const syncCollectedTaskItems = () => {
    Object.keys(taskItemById).forEach((taskId) => {
      setTaskItemCollected(taskId, !!state.completed[taskId]);
    });
  };

  const resetScroll = () => {
    if (window.scrollTo) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } else {
      window.scroll(0, 0);
    }
  };

  const getCompletedCount = () => Object.values(state.completed).filter(Boolean).length;

  const getTaskEl = (taskId) => {
    return taskScreen ? taskScreen.querySelector(`.task[id="${taskId}"]`) : null;
  };

  const getOrAttachResultContainer = (taskId) => {
    const taskEl = getTaskEl(taskId);
    if (!taskEl) return null;
    let container = taskEl.querySelector('.result');
    if (container) return container;
    const globalRes = taskScreen ? taskScreen.querySelector('.result') : null;
    if (globalRes && (!globalRes.closest('.task') || globalRes.closest('.task') !== taskEl)) {
      taskEl.appendChild(globalRes);
      return globalRes;
    }
    console.warn('[LPC Warning]: Контейнер .result не найден в DOM');
    return null;

  };

  const renderPlane = (count, container) => {
    if (!container) return;
    for (let i = 1; i <= MAX_POINTS; i++) {
      const seg = container.querySelector(`.result__plane-segment-${i}`);
      if (!seg) continue;
      seg.style.opacity = i <= count ? '1' : '0.2';
    }
  };

  const setTitleCount = (container, count) => {
    if (!container) return;
    const title = container.querySelector('.result__title');
    if (!title) return;
    title.textContent = `Суперсила ${Math.min(count, MAX_POINTS)}/${MAX_POINTS} ваша!`;
  };

  const updateTitleByCount = (container) => {
    if (!container) return;
    const title = container.querySelector('.result__title');
    if (!title) return;
    const count = getCompletedCount();
    title.textContent = `Суперсила ${Math.min(count, MAX_POINTS)}/${MAX_POINTS} ваша!`;
  };

  const updatePlaneByCount = (container) => {
    if (!container) return;
    const count = getCompletedCount();
    renderPlane(count, container);
  };

  const updateResultUIForTask = (taskId) => {
    const container = getOrAttachResultContainer(taskId);
    if (!container) return;
    const collect = container.querySelector('.result__collect');
    const ready = container.querySelector('.result__ready');
    if (!collect || !ready) {
      console.warn('[LPC Warning]: Не найдены .result__collect или .result__ready');
      return;
    }

    const backBtn = container.querySelector('.result__button');
    if (backBtn && !backBtn.dataset.backBound) {
      const handleBack = (event) => {
        event.preventDefault();
        showScreen('maps');
        state.currentScreen = 'maps';
        saveState(state);
      };
      makeAccessibleButton(backBtn, handleBack);
      backBtn.dataset.backBound = '1';
    }

    const isCompleted = !!state.completed[taskId];

    const clone = collect.cloneNode(true);
    collect.parentNode.replaceChild(clone, collect);

    const award = (e) => {
      if (e) e.preventDefault();
      const wasCompleted = !!state.completed[taskId];
      const prevCount = getCompletedCount();
      if (!wasCompleted) {
        state.completed[taskId] = true;
        saveState(state);
        setTaskItemCollected(taskId, true);
      }
      const newCount = getCompletedCount();

      if (typeof gsap !== 'undefined' && !reduceMotion) {
        renderPlane(prevCount, container);
        setTitleCount(container, prevCount);
        // Подготавливаем стили заранее, не снимая hidden, чтобы исключить мерцание двух элементов
        try { gsap.set(ready, { autoAlpha: 0, opacity: 0, scale: 0.7, transformOrigin: '50% 50%' }); } catch (_) { }
        try {
          const tl = gsap.timeline();
          tl.to(clone, {
            duration: 0.35,
            ease: 'power2.out',
            opacity: 0,
            scale: 0.7
          });
          tl.add(() => { clone.setAttribute('hidden', 'true'); });
          tl.add(() => { ready.removeAttribute('hidden'); });
          tl.to(ready, {
            duration: 0.45,
            ease: 'power2.out',
            opacity: 1,
            scale: 1,
            autoAlpha: 1
          });
        } catch (_) {
          clone.setAttribute('hidden', 'true');
          ready.removeAttribute('hidden');
          ready.style.opacity = '1';
        }

        const targetIndex = Math.min(newCount, MAX_POINTS);
        if (!wasCompleted && targetIndex > prevCount) {
          const animateNewSegment = () => {
            const seg = container.querySelector(`.result__plane-segment-${targetIndex}`);
            if (seg) {
              try {
                setTitleCount(container, newCount);
                const titleEl = container.querySelector('.result__title');
                if (titleEl) {
                  gsap.set(titleEl, { opacity: 0.6, scale: 0.95, transformOrigin: '50% 50%' });
                }
                const tl2 = gsap.timeline({
                  onComplete: () => {
                    updatePlaneByCount(container);
                  }
                });
                if (titleEl) {
                  tl2.to(titleEl, {
                    duration: 0.5,
                    ease: 'power2.out',
                    opacity: 1,
                    scale: 1
                  }, 0);
                }
                tl2.fromTo(
                  seg,
                  { opacity: 0.2 },
                  {
                    duration: 0.5,
                    ease: 'power2.out',
                    opacity: 1
                  },
                  0
                );
              } catch (_) {
                setTitleCount(container, newCount);
                seg.style.opacity = '1';
                updatePlaneByCount(container);
              }
            } else {
              setTitleCount(container, newCount);
              updatePlaneByCount(container);
            }
          };
          if (typeof gsap !== 'undefined' && gsap.delayedCall) {
            try { gsap.delayedCall(1.0, animateNewSegment); } catch (_) { setTimeout(animateNewSegment, 1000); }
          } else {
            setTimeout(animateNewSegment, 1000);
          }
        } else {
          updateTitleByCount(container);
          updatePlaneByCount(container);
        }
      } else {
        ready.removeAttribute('hidden');
        renderPlane(prevCount, container);
        clone.setAttribute('hidden', 'true');
        setTimeout(() => {
          updateTitleByCount(container);
          updatePlaneByCount(container);
        }, 1000);
      }
    };

    makeAccessibleButton(clone, award, { once: true });

    if (isCompleted) {
      clone.setAttribute('hidden', 'true');
      ready.removeAttribute('hidden');
    } else {
      ready.setAttribute('hidden', 'true');
      clone.removeAttribute('hidden');
    }

    updateTitleByCount(container);
    updatePlaneByCount(container);
  };

  const showScreen = (targetId) => {
    const target = Array.from(screens).find((s) => s.id === targetId);
    const current = document.querySelector('.screen.active');

    if (!target) {
      console.error(`[LPC Warning]: Экран с id "${targetId}" не найден`);
      return;
    }

    const hideNonTarget = () => {
      screens.forEach((screen) => {
        if (screen !== target) {
          screen.classList.remove('active');
          screen.setAttribute('hidden', 'true');
        }
      });
      target.classList.add('active');
      target.removeAttribute('hidden');
      target.style.display = '';
    };

    if (typeof gsap !== 'undefined' && !reduceMotion) {
      // Если уже на целевом экране — просто спрятать остальные без анимации
      if (current && current === target) {
        hideNonTarget();
        resetScroll();
        gsap.set(target, { autoAlpha: 1 });
        return;
      }

      // Подготовка целевого экрана
      target.removeAttribute('hidden');
      target.classList.add('active');
      target.style.display = '';
      gsap.set(target, { autoAlpha: 0 });

      // Мгновенно скрыть все, кроме текущего и целевого
      screens.forEach((screen) => {
        if (screen !== target && screen !== current) {
          screen.classList.remove('active');
          screen.setAttribute('hidden', 'true');
        }
      });

      if (current) {
        gsap.to(current, {
          duration: 0.3,
          ease: 'power1.out',
          autoAlpha: 0,
          onComplete: () => {
            current.classList.remove('active');
            current.setAttribute('hidden', 'true');
          }
        });
      }

      resetScroll();
      gsap.to(target, {
        duration: 0.35,
        ease: 'power2.out',
        autoAlpha: 1
      });
      state.currentScreen = targetId;
      saveState(state);
      if (targetId === 'task' && state.currentTaskId) {
        updateResultUIForTask(state.currentTaskId);
      }
      return;
    }

    hideNonTarget();
    resetScroll();
    state.currentScreen = targetId;
    saveState(state);
    if (targetId === 'task' && state.currentTaskId) {
      updateResultUIForTask(state.currentTaskId);
    }
  };

  const taskScreen = document.getElementById('task');
  const tasks = taskScreen ? taskScreen.querySelectorAll('.task') : [];

  const showTask = (taskId) => {
    if (!tasks.length) {
      console.error('[LPC Warning]: Блоки задач .task не найдены');
      return;
    }

    const target = Array.from(tasks).find((t) => t.id === taskId);
    const current = taskScreen ? taskScreen.querySelector('.task.active') : null;

    if (!target) {
      console.error(`[LPC Warning]: Задача с id "${taskId}" не найдена`);
      return;
    }

    const hideNonTargetTasks = () => {
      tasks.forEach((task) => {
        if (task !== target) {
          task.classList.remove('active');
          task.setAttribute('hidden', 'true');
        }
      });
      target.classList.add('active');
      target.removeAttribute('hidden');
      target.style.display = '';
    };

    if (typeof gsap !== 'undefined' && !reduceMotion) {
      // Если уже на целевой задаче — просто спрятать остальные без анимации
      if (current && current === target) {
        hideNonTargetTasks();
        resetScroll();
        gsap.set(target, { autoAlpha: 1 });
        return;
      }

      // Подготовить целевую задачу
      target.removeAttribute('hidden');
      target.classList.add('active');
      target.style.display = '';
      gsap.set(target, { autoAlpha: 0 });

      // Мгновенно скрыть все задачи, кроме текущей и целевой
      tasks.forEach((task) => {
        if (task !== target && task !== current) {
          task.classList.remove('active');
          task.setAttribute('hidden', 'true');
        }
      });

      if (current) {
        gsap.to(current, {
          duration: 0.25,
          ease: 'power1.out',
          autoAlpha: 0,
          onComplete: () => {
            current.classList.remove('active');
            current.setAttribute('hidden', 'true');
          }
        });
      }

      resetScroll();
      gsap.to(target, {
        duration: 0.3,
        ease: 'power2.out',
        autoAlpha: 1
      });
      state.currentTaskId = taskId;
      state.currentScreen = 'task';
      saveState(state);
      updateResultUIForTask(taskId);
      return;
    }

    hideNonTargetTasks();
    resetScroll();
    state.currentTaskId = taskId;
    state.currentScreen = 'task';
    saveState(state);
    updateResultUIForTask(taskId);
  };

  const initInitialScreen = () => {
    if (state.currentScreen && document.getElementById(state.currentScreen)) {
      showScreen(state.currentScreen);
      if (state.currentScreen === 'task' && state.currentTaskId) {
        showTask(state.currentTaskId);
        updateResultUIForTask(state.currentTaskId);
      }
      return;
    }

    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen) {
      showScreen(activeScreen.id);
      return;
    }

    const startScreen = document.getElementById('start');
    if (startScreen) {
      showScreen('start');
    } else {
      showScreen(screens[0].id);
    }
  };

  const initStartButton = () => {
    const startButton = document.querySelector('.hero__button');

    if (!startButton) {
      console.error('[LPC Warning]: Кнопка запуска игры .hero__button не найдена');
      return;
    }

    const handleStart = (event) => {
      event.preventDefault();
      showScreen('maps');
      state.currentScreen = 'maps';
      saveState(state);
    };

    makeAccessibleButton(startButton, handleStart);
  };

  const initTaskItems = () => {
    const taskItems = document.querySelectorAll('.task-item');

    if (!taskItems.length) {
      console.error('[LPC Warning]: Карточки заданий .task-item не найдены');
      return;
    }

    const taskMapping = {
      'task-item--1': 'ai',
      'task-item--2': 'antifragility',
      'task-item--3': 'self-skills',
      'task-item--4': 'growth-mindset',
      'task-item--5': 'working-with-generations',
      'task-item--6': 'effective-feedback',
      'task-item--7': 'biohacking',
      'task-item--8': 'crisis-leadership'
    };

    const setActiveTaskItem = (currentItem) => {
      taskItems.forEach((item) => {
        item.classList.remove('active');
      });

      if (currentItem) {
        currentItem.classList.add('active');
      }
    };

    taskItems.forEach((item) => {
      const modifierClass = Array.from(item.classList).find((className) =>
        className.startsWith('task-item--')
      );

      if (!modifierClass) {
        console.error('[LPC Warning]: Для .task-item не найден модификатор task-item--N');
        return;
      }

      const taskId = taskMapping[modifierClass];

      if (!taskId) {
        console.error(
          `[LPC Warning]: Для модификатора "${modifierClass}" нет соответствующего id задачи`
        );
        return;
      }

      // сохраняем ссылку и сразу синхронизируем класс collect из сохранённого состояния
      taskItemById[taskId] = item;
      setTaskItemCollected(taskId, !!state.completed[taskId]);

      const handleOpenTask = (event) => {
        event.preventDefault();
        showScreen('task');
        showTask(taskId);
        setActiveTaskItem(item);
        state.currentScreen = 'task';
        state.currentTaskId = taskId;
        saveState(state);
        updateResultUIForTask(taskId);
      };

      makeAccessibleButton(item, handleOpenTask);
    });

    // на случай если DOM менялся/часть карточек добавилась позже
    syncCollectedTaskItems();
  };

  const initBackButtons = () => {
    const backButtons = [];

    const back = document.querySelector('.back');
    if (back) {
      backButtons.push(back);
    } else {
      console.error('[LPC Warning]: Кнопка возврата .back не найдена');
    }
    if (!backButtons.length) {
      return;
    }

    backButtons.forEach((button) => {
      const handleBack = (event) => {
        event.preventDefault();
        showScreen('maps');
        state.currentScreen = 'maps';
        saveState(state);
      };

      makeAccessibleButton(button, handleBack);
    });
  };

  initTaskItems();
  initInitialScreen();
  initStartButton();
  initBackButtons();
});
