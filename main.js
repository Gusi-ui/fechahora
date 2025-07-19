// --- CONFIGURACIÓN ---
const MATARO_HOLIDAYS_URL =
  "https://corsproxy.io/?https://www.mataro.cat/es/la-ciudad/festivos-locales";
const LOCAL_STORAGE_KEY = "customHolidays";
const MATARO_CACHE_KEY = "mataroHolidaysCache";
const MATARO_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas en ms

// --- ESTADO DE LA APLICACIÓN ---
let holidaysMataro = [];
let customHolidays = [];
let holidays = [];
let calculationTimeout = null;

// --- UTILIDADES DE RENDIMIENTO ---
function debounce(func, wait) {
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(calculationTimeout);
      func(...args);
    };
    clearTimeout(calculationTimeout);
    calculationTimeout = setTimeout(later, wait);
  };
}

// --- ELEMENTOS DEL DOM ---
const yearSelect = document.getElementById("year");
const monthSelect = document.getElementById("month");
const assignedHoursInput = document.getElementById("totalHours");
const calculateBtn = document.getElementById("calculateBtn");
const resultsContainer = document.getElementById("results-container");
const loadingEl = document.getElementById("loading");
const errorContainer = document.getElementById("error-container");
const includeOffdaysToggle = document.getElementById("includeOffdays");
const totalMonthHours = document.getElementById("totalMonthHours");
const hoursSoFar = document.getElementById("hoursSoFar");
const totalMonthHoursTitle = document.getElementById("totalMonthHoursTitle");
const monthNameTitle = document.getElementById("monthNameTitle");
const yearTitle = document.getElementById("yearTitle");
const workdaysEl = document.getElementById("workdays");
const offDaysEl = document.getElementById("offDays");
const balanceValueEl = document.getElementById("balanceValue");
const balanceTextEl = document.getElementById("balanceText");
const resetBtn = document.getElementById("resetBtn");
const clearCacheBtn = document.getElementById("clearCacheBtn");

// Festivos personalizados
const holidayListEl = document.getElementById("holidayList");
const addHolidayForm = document.getElementById("addHolidayForm");
const customHolidayDate = document.getElementById("customHolidayDate");
const customHolidayName = document.getElementById("customHolidayName");
const holidayListContainer = document.getElementById("holidayListContainer");
const toggleHolidayListBtn = document.getElementById("toggleHolidayListBtn");

// --- NUEVO: DÍAS DE LA SEMANA ---
const weekdayIds = [
  { key: 'mon', label: 'Lunes', jsDay: 1 },
  { key: 'tue', label: 'Martes', jsDay: 2 },
  { key: 'wed', label: 'Miércoles', jsDay: 3 },
  { key: 'thu', label: 'Jueves', jsDay: 4 },
  { key: 'fri', label: 'Viernes', jsDay: 5 },
  { key: 'sat', label: 'Sábado', jsDay: 6 },
  { key: 'sun', label: 'Domingo', jsDay: 0 },
];
const weekdaySwitches = {};
const weekdayHoursInputs = {};
const slimSelectInstances = {};

// Inicializar días de la semana de forma optimizada
function initializeWeekdays() {
  weekdayIds.forEach(({ key }) => {
    weekdaySwitches[key] = document.getElementById(`weekday-${key}`);
    weekdayHoursInputs[key] = document.getElementById(`hours-${key}`);
    weekdayHoursInputs[key].classList.add('slim-square');
    
    // Mostrar/ocultar input de horas según el interruptor
    weekdaySwitches[key].addEventListener('change', () => {
      const input = weekdayHoursInputs[key];
      
      if (weekdaySwitches[key].checked) {
        // Mostrar el campo
        input.style.display = 'block';
        input.classList.remove('hidden');
        input.removeAttribute('inert');
        input.removeAttribute('aria-hidden');
        
        // Reinicializar SlimSelect si no existe
        if (!slimSelectInstances[key]) {
          slimSelectInstances[key] = new SlimSelect({ 
            select: `#hours-${key}`, 
            settings: { showSearch: false } 
          });
        }
        
        // Forzar que SlimSelect se muestre
        requestAnimationFrame(() => {
          const slimElement = input.nextElementSibling;
          if (slimElement && slimElement.classList.contains('ss-main')) {
            slimElement.style.display = 'block';
            slimElement.style.visibility = 'visible';
            slimElement.style.opacity = '1';
            slimElement.style.height = 'auto';
            slimElement.style.overflow = 'visible';
            slimElement.removeAttribute('inert');
          }
        });
        
      } else {
        // Ocultar el campo
        input.style.display = 'none';
        input.classList.add('hidden');
        input.setAttribute('inert', '');
        input.value = '';
        
        // Destruir SlimSelect si existe
        if (slimSelectInstances[key]) {
          slimSelectInstances[key].destroy();
          slimSelectInstances[key] = null;
        }
        
        // Ocultar elementos SlimSelect
        const slimElements = document.querySelectorAll(`#hours-${key} + .ss-main, #hours-${key} ~ .ss-main`);
        slimElements.forEach(el => {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
          el.style.height = '0';
          el.style.overflow = 'hidden';
          el.setAttribute('inert', '');
        });
      }
      
      debouncedCalculateBalance();
    });
    
    // Recalcular al cambiar horas
    weekdayHoursInputs[key].addEventListener('change', debouncedCalculateBalance);
  });
}

const festivoHoursGroup = document.getElementById('festivo-hours-group');
const festivoHoursInput = document.getElementById('hours-festivo');
festivoHoursInput.classList.add('slim-square');

// Mostrar/ocultar input de horas de festivo según el interruptor
includeOffdaysToggle.addEventListener('change', () => {
  if (includeOffdaysToggle.checked) {
    // Mostrar el campo
    festivoHoursGroup.style.display = 'block';
    festivoHoursGroup.classList.remove('hidden');
    festivoHoursGroup.removeAttribute('inert');
    festivoHoursInput.removeAttribute('inert');
    festivoHoursInput.removeAttribute('aria-hidden');
    
    // Reinicializar SlimSelect si no existe
    if (!slimSelectInstances['festivo']) {
      slimSelectInstances['festivo'] = new SlimSelect({ 
        select: '#hours-festivo', 
        settings: { showSearch: false } 
      });
    }
    
    // Forzar que SlimSelect se muestre
    requestAnimationFrame(() => {
      const slimElement = festivoHoursGroup.querySelector('.ss-main');
      if (slimElement) {
        slimElement.style.display = 'block';
        slimElement.style.visibility = 'visible';
        slimElement.style.opacity = '1';
        slimElement.style.height = 'auto';
        slimElement.style.overflow = 'visible';
        slimElement.removeAttribute('inert');
      }
    });
    
  } else {
    // Ocultar el campo
    festivoHoursGroup.style.display = 'none';
    festivoHoursGroup.classList.add('hidden');
    festivoHoursGroup.setAttribute('inert', '');
    festivoHoursInput.setAttribute('inert', '');
    festivoHoursInput.value = '';
    
    // Destruir SlimSelect si existe
    if (slimSelectInstances['festivo']) {
      slimSelectInstances['festivo'].destroy();
      slimSelectInstances['festivo'] = null;
    }
    
    // Ocultar elementos SlimSelect
    const slimElements = festivoHoursGroup.querySelectorAll('.ss-main');
    slimElements.forEach(el => {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.opacity = '0';
      el.style.height = '0';
      el.style.overflow = 'hidden';
      el.setAttribute('inert', '');
    });
  }
  
  debouncedCalculateBalance();
});

// Mostrar/ocultar lista de festivos
let holidayListVisible = false;
toggleHolidayListBtn.addEventListener("click", () => {
  holidayListVisible = !holidayListVisible;
  if (holidayListVisible) {
    holidayListContainer.classList.add("active");
  } else {
    holidayListContainer.classList.remove("active");
  }
  toggleHolidayListBtn.textContent = holidayListVisible
    ? "Ocultar festivos"
    : "Mostrar festivos";
});

// --- FUNCIONES DE PERSISTENCIA ---
function saveCustomHolidays() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customHolidays));
}

function loadCustomHolidays() {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      customHolidays = JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error cargando festivos personalizados:", error);
    customHolidays = [];
  }
}

// --- RENDERIZADO DE FESTIVOS OPTIMIZADO ---
function renderHolidayList() {
  // Usar DocumentFragment para mejor rendimiento
  const fragment = document.createDocumentFragment();
  const all = [
    ...holidaysMataro.map((d) => ({ ...d, type: "Mataró" })),
    ...customHolidays.map((d) => ({ ...d, type: "Personalizado" })),
  ];
  all.sort((a, b) => a.date.localeCompare(b.date));
  const today = new Date().toISOString().split('T')[0];
  
  for (const h of all) {
    const card = document.createElement("div");
    card.className = "festivo-card";
    
    // Si la fecha ya ha pasado, atenuar
    if (h.date < today) {
      card.classList.add("festivo-pasado");
    }
    
    // Formatear fecha de manera más amigable
    const dateObj = new Date(h.date);
    const formattedDate = dateObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Fecha
    const fecha = document.createElement("div");
    fecha.className = "festivo-fecha";
    fecha.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    card.appendChild(fecha);
    
    // Nombre
    const nombre = document.createElement("div");
    nombre.className = "festivo-nombre";
    nombre.textContent = h.name;
    card.appendChild(nombre);
    
    // Tipo de festivo (solo para festivos personalizados)
    if (h.type === "Personalizado") {
      const tipo = document.createElement("div");
      tipo.className = "festivo-tipo";
      tipo.textContent = "🎯 Personalizado";
      tipo.style.fontSize = "0.8rem";
      tipo.style.color = "var(--accent-color)";
      tipo.style.fontWeight = "600";
      tipo.style.marginBottom = "0.5rem";
      card.appendChild(tipo);
    } else {
      const tipo = document.createElement("div");
      tipo.className = "festivo-tipo";
      tipo.textContent = "🏛️ Oficial";
      tipo.style.fontSize = "0.8rem";
      tipo.style.color = "var(--secondary-color)";
      tipo.style.fontWeight = "600";
      tipo.style.marginBottom = "0.5rem";
      card.appendChild(tipo);
    }
    
    // Acción eliminar solo para festivos personalizados
    if (h.type === "Personalizado") {
      const actions = document.createElement("div");
      actions.className = "festivo-actions";
      const btn = document.createElement("button");
      btn.textContent = "🗑️ Eliminar";
      btn.className = "btn btn-secondary";
      btn.onclick = () => {
        customHolidays = customHolidays.filter((ch) => ch.date !== h.date);
        saveCustomHolidays();
        updateHolidays();
      };
      actions.appendChild(btn);
      card.appendChild(actions);
    }
    
    fragment.appendChild(card);
  }
  
  // Limpiar y añadir todo de una vez
  holidayListEl.innerHTML = "";
  holidayListEl.appendChild(fragment);
}

function updateHolidays() {
  const all = [...holidaysMataro, ...customHolidays];
  const map = new Map();
  for (const h of all) {
    map.set(h.date, h);
  }
  holidays = Array.from(map.values()).map((h) => h.date);
  renderHolidayList();
  debouncedCalculateBalance();
}

// --- MANEJO DE FORMULARIOS ---
addHolidayForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const date = customHolidayDate.value;
  const name = customHolidayName.value.trim() || "Personalizado";
  if (!date) return;
  if (customHolidays.some((h) => h.date === date)) return;
  customHolidays.push({ date, name });
  saveCustomHolidays();
  customHolidayDate.value = "";
  customHolidayName.value = "";
  updateHolidays();
});

// --- CARGA DE FESTIVOS DE MATARÓ OPTIMIZADA ---
async function loadMataroHolidays() {
  holidaysMataro = [];
  const year = parseInt(yearSelect.value);
  console.log("Cargando festivos para año:", year);
  
  // Verificar caché primero
  let cache = localStorage.getItem(MATARO_CACHE_KEY);
  if (cache) {
    try {
      cache = JSON.parse(cache);
    } catch {
      cache = {};
    }
  } else {
    cache = {};
  }
  
  const now = Date.now();
  if (cache[year] && now - cache[year].timestamp < MATARO_CACHE_TTL) {
    holidaysMataro = cache[year].holidays;
    console.log("Usando caché para año", year, ":", holidaysMataro);
    return;
  }
  
  try {
    console.log("Intentando cargar festivos desde:", MATARO_HOLIDAYS_URL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log("Timeout alcanzado, abortando request");
    }, 8000); // 8 segundos timeout
    
    const response = await fetch(MATARO_HOLIDAYS_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CalculadoraFestivos/1.0)'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const html = await response.text();
    console.log("HTML recibido, longitud:", html.length);
    
    // Verificar que el HTML contiene contenido útil
    if (html.length < 1000) {
      throw new Error("Respuesta HTML demasiado corta");
    }
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    // Buscar tabla de festivos
    let table = null;
    const headers = Array.from(doc.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    console.log("Encontrados", headers.length, "headers");
    
    for (const h of headers) {
      if (h.textContent.includes(year.toString())) {
        console.log("Encontrado header para año", year, ":", h.textContent);
        let el = h.nextElementSibling;
        while (el && el.tagName !== "TABLE") {
          el = el.nextElementSibling;
        }
        if (el && el.tagName === "TABLE") {
          table = el;
          console.log("Encontrada tabla de festivos");
          break;
        }
      }
    }
    
    if (!table) {
      console.log("No se encontró tabla de festivos, usando festivos básicos");
      // Usar festivos básicos si no se encuentra la tabla
      holidaysMataro = getBasicHolidays(year);
    } else {
      const rows = Array.from(table.querySelectorAll("tbody tr"));
      console.log("Encontradas", rows.length, "filas en la tabla");
      
      for (const row of rows) {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 1) {
          const rawDate = cells[0].textContent.trim();
          const name = cells[1] ? cells[1].textContent.trim() : "Mataró";
          const date = parseSpanishDate(rawDate, year);
          console.log(`Procesando festivo: "${rawDate}" -> "${name}" -> ${date}`);
          if (date) {
            holidaysMataro.push({ date, name });
            console.log(`Festivo añadido: ${date} - ${name}`);
          }
        }
      }
    }
    
    // Guardar en caché
    cache[year] = { timestamp: now, holidays: holidaysMataro };
    localStorage.setItem(MATARO_CACHE_KEY, JSON.stringify(cache));
    
    console.log("Festivos cargados exitosamente:", holidaysMataro.length, "festivos");
    
  } catch (error) {
    console.error("Error cargando festivos de Mataró:", error);
    holidaysMataro = [];
    
    // Usar festivos básicos como fallback
    holidaysMataro = getBasicHolidays(year);
    console.log("Usando festivos básicos como fallback:", holidaysMataro);
    
    if (error.name === 'AbortError') {
      displayError("Timeout al cargar festivos de Mataró. Usando festivos básicos.");
    } else {
      displayError("No se pudieron cargar los festivos de Mataró. Usando festivos básicos.");
    }
  }
}

// Función para obtener festivos básicos como fallback
function getBasicHolidays(year) {
  const basicHolidays = [
    { date: `${year}-01-01`, name: "Año Nuevo" },
    { date: `${year}-01-06`, name: "Epifanía" },
    { date: `${year}-05-01`, name: "Día del Trabajo" },
    { date: `${year}-08-15`, name: "Asunción" },
    { date: `${year}-10-12`, name: "Día de la Hispanidad" },
    { date: `${year}-11-01`, name: "Todos los Santos" },
    { date: `${year}-12-06`, name: "Día de la Constitución" },
    { date: `${year}-12-08`, name: "Inmaculada Concepción" },
    { date: `${year}-12-25`, name: "Navidad" }
  ];
  
  // Añadir festivos móviles (aproximación)
  const easter = getEasterDate(year);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  
  basicHolidays.push(
    { date: formatDate(easter), name: "Jueves Santo" },
    { date: formatDate(easterMonday), name: "Lunes de Pascua" }
  );
  
  return basicHolidays;
}

// Función para calcular la fecha de Pascua (algoritmo de Meeus/Jones/Butcher)
function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
}

// Función para formatear fecha como YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseSpanishDate(str, year) {
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  const match = str.match(/(\d{1,2}) de ([a-záéíóúñ]+)/i);
  if (!match) return null;
  const day = match[1].padStart(2, "0");
  let month = months.findIndex((m) => m === match[2].toLowerCase());
  if (month === -1) return null;
  month = (month + 1).toString().padStart(2, "0");
  const result = `${year}-${month}-${day}`;
  return result;
}

function displayError(message) {
  errorContainer.innerHTML = `<p class="error-message">${message}</p>`;
}

function isHoliday(date, holidayList) {
  // Usar fecha local en lugar de UTC para evitar problemas de zona horaria
  const yearStr = date.getFullYear();
  const monthStr = String(date.getMonth() + 1).padStart(2, '0');
  const dayStr = String(date.getDate()).padStart(2, '0');
  const dateString = `${yearStr}-${monthStr}-${dayStr}`;
  
  const isHoliday = holidayList.includes(dateString);
  return isHoliday;
}

// --- RELLENAR SELECTS DE HORAS OPTIMIZADO ---
function fillHourSelect(select, max, step) {
  const fragment = document.createDocumentFragment();
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '--';
  fragment.appendChild(defaultOption);
  
  for (let h = step; h <= max; h += step) {
    const value = h.toFixed(2).replace(/\.00$/, '');
    let label = value;
    // Etiqueta amigable: 0.25 = 15 min, 0.5 = 30 min, etc.
    const intPart = Math.floor(h);
    const minPart = Math.round((h - intPart) * 60);
    if (intPart > 0 && minPart > 0) {
      label = `${intPart}h ${minPart}min`;
    } else if (intPart > 0) {
      label = `${intPart}h`;
    } else {
      label = `${minPart}min`;
    }
    
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    fragment.appendChild(option);
  }
  
  select.innerHTML = '';
  select.appendChild(fragment);
}

// --- CÁLCULO DE BALANCE OPTIMIZADO ---
const debouncedCalculateBalance = debounce(calculateBalance, 300);

function calculateBalance() {
  // Validar días de la semana personalizados
  let atLeastOneDay = false;
  let totalWeekdayHours = 0;
  const weekdayConfig = {};
  
  weekdayIds.forEach(({ key, jsDay }) => {
    const isEnabled = weekdaySwitches[key].checked;
    const hours = parseFloat(weekdayHoursInputs[key].value) || 0;
    
    weekdayConfig[jsDay] = { enabled: isEnabled, hours };
    
    if (isEnabled && hours > 0) {
      atLeastOneDay = true;
      totalWeekdayHours += hours;
    }
  });
  
  if (!atLeastOneDay) {
    resultsContainer.style.display = "none";
    return;
  }
  
  const year = parseInt(yearSelect.value);
  const month = parseInt(monthSelect.value);
  const assignedHours = parseFloat(assignedHoursInput.value) || 0;
  const includeOffdays = includeOffdaysToggle.checked;
  const offdayHours = parseFloat(festivoHoursInput.value) || 0;
  
  if (assignedHours <= 0) {
    resultsContainer.style.display = "none";
    return;
  }
  
  // Calcular días del mes
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const currentDay = isCurrentMonth ? today.getDate() : totalDays;
  
  let workdays = 0;
  let offDays = 0;
  let totalMonthHours = 0;
  let hoursSoFar = 0;
  
  // Calcular días laborables y festivos
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHolidayDay = isHoliday(date, holidays);
    
    if (isWeekend || isHolidayDay) {
      offDays++;
      if (includeOffdays && offdayHours > 0) {
        totalMonthHours += offdayHours;
        if (day <= currentDay) {
          hoursSoFar += offdayHours;
        }
      }
    } else {
      const weekdayConfig = weekdayConfig[dayOfWeek];
      if (weekdayConfig && weekdayConfig.enabled && weekdayConfig.hours > 0) {
        workdays++;
        totalMonthHours += weekdayConfig.hours;
        if (day <= currentDay) {
          hoursSoFar += weekdayConfig.hours;
        }
      }
    }
  }
  
  // Calcular balance
  const balance = hoursSoFar - assignedHours;
  
  // Actualizar UI
  totalMonthHoursTitle.textContent = `🗓️ Horas para ${getMonthName(month)} ${year}`;
  monthNameTitle.textContent = getMonthName(month);
  yearTitle.textContent = year;
  totalMonthHours.textContent = `${totalMonthHours.toFixed(2)} horas`;
  hoursSoFar.textContent = `${hoursSoFar.toFixed(2)} horas`;
  workdaysEl.textContent = `${workdays} días`;
  offDaysEl.textContent = `${offDays} días`;
  
  // Formatear balance
  const absBalance = Math.abs(balance);
  balanceValueEl.textContent = `${balance >= 0 ? '+' : '-'}${absBalance.toFixed(2)} horas`;
  
  if (balance > 0) {
    balanceTextEl.textContent = "¡Estás por delante! 🎉";
    balanceValueEl.style.color = "var(--success-color)";
  } else if (balance < 0) {
    balanceTextEl.textContent = "Te faltan horas por completar 📈";
    balanceValueEl.style.color = "var(--danger-color)";
  } else {
    balanceTextEl.textContent = "¡Perfecto! Estás al día ✅";
    balanceValueEl.style.color = "var(--secondary-color)";
  }
  
  resultsContainer.style.display = "block";
}

function getMonthName(month) {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return months[month];
}

// --- POBLAR SELECTOR DE AÑOS ---
function populateYearSelector() {
  const currentYear = new Date().getFullYear();
  yearSelect.innerHTML = "";
  for (let year = currentYear - 2; year <= currentYear + 2; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    if (year === currentYear) option.selected = true;
    yearSelect.appendChild(option);
  }
}

// --- MANEJO DE LOADING ---
function showLoading(show) {
  loadingEl.style.display = show ? "block" : "none";
  if (show) {
    resultsContainer.style.display = "none";
  }
}

// --- INICIALIZACIÓN DE LA APLICACIÓN ---
async function initializeApp() {
  try {
    console.log('🚀 Inicializando aplicación...');
    
    // Verificar que SlimSelect esté disponible
    if (typeof SlimSelect === 'undefined') {
      console.warn('⚠️ SlimSelect no está disponible, usando selects nativos');
    }
    
    populateYearSelector();
    loadCustomHolidays();
    
    // Rellenar selects de horas
    fillHourSelect(assignedHoursInput, 24, 0.25);
    fillHourSelect(festivoHoursInput, 24, 0.25);
    weekdayIds.forEach(({ key }) => {
      fillHourSelect(weekdayHoursInputs[key], 24, 0.25);
    });
    
    // Inicializar días de la semana
    initializeWeekdays();
    
    // Inicializar SlimSelect para los selects principales si está disponible
    if (typeof SlimSelect !== 'undefined') {
      try {
        new SlimSelect({ select: "#year", settings: { showSearch: false } });
        new SlimSelect({ select: "#month", settings: { showSearch: false } });
        new SlimSelect({ select: "#totalHours", settings: { showSearch: false } });
        console.log('✅ SlimSelect inicializado correctamente');
      } catch (slimError) {
        console.warn('⚠️ Error inicializando SlimSelect:', slimError);
      }
    }
    
    // Cargar festivos básicos inmediatamente (sin esperar a Mataró)
    console.log('📅 Cargando festivos básicos...');
    const year = parseInt(yearSelect.value);
    holidaysMataro = getBasicHolidays(year);
    console.log('✅ Festivos básicos cargados:', holidaysMataro.length, 'festivos');
    
    // Ocultar loading inmediatamente
    showLoading(false);
    
    // Actualizar festivos y calcular balance inicial
    updateHolidays();
    
    // Event listeners para controles principales
    yearSelect.addEventListener("change", async () => {
      const selectedYear = parseInt(yearSelect.value);
      holidaysMataro = getBasicHolidays(selectedYear);
      updateHolidays();
    });
    
    monthSelect.addEventListener("change", debouncedCalculateBalance);
    assignedHoursInput.addEventListener("change", debouncedCalculateBalance);
    festivoHoursInput.addEventListener("change", debouncedCalculateBalance);
    
    // Event listeners para botones
    calculateBtn.addEventListener("click", calculateBalance);
    resetBtn.addEventListener("click", resetApp);
    clearCacheBtn.addEventListener("click", () => {
      localStorage.removeItem(MATARO_CACHE_KEY);
      alert("Caché limpiado. Los festivos se recargarán en la próxima consulta.");
    });
    
    console.log('🎉 Aplicación inicializada correctamente');
    
  } catch (error) {
    console.error("❌ Error inicializando la aplicación:", error);
    showLoading(false);
    displayError(`Error al inicializar la aplicación: ${error.message}`);
  }
}

async function resetApp() {
  if (confirm("¿Estás seguro de que quieres resetear toda la configuración?")) {
    // Resetear switches
    includeOffdaysToggle.checked = false;
    weekdayIds.forEach(({ key }) => {
      weekdaySwitches[key].checked = false;
      weekdayHoursInputs[key].value = "";
      weekdayHoursInputs[key].style.display = "none";
      weekdayHoursInputs[key].classList.add("hidden");
    });
    
    // Resetear festivos personalizados
    customHolidays = [];
    saveCustomHolidays();
    
    // Resetear controles principales
    assignedHoursInput.value = "";
    festivoHoursInput.value = "";
    festivoHoursGroup.style.display = "none";
    
    // Ocultar resultados
    resultsContainer.style.display = "none";
    
    // Limpiar errores
    errorContainer.innerHTML = "";
    
    // Actualizar
    updateHolidays();
  }
}

// --- INICIALIZAR CUANDO EL DOM ESTÉ LISTO ---
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // Si el DOM ya está listo, inicializar inmediatamente
  initializeApp();
}
