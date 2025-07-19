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

// --- VARIABLES GLOBALES PARA ELEMENTOS DEL DOM ---
let yearSelect, monthSelect, assignedHoursInput, calculateBtn, resultsContainer, loadingEl;
let errorContainer, includeOffdaysToggle, totalMonthHours, hoursSoFar;
let totalMonthHoursTitle, monthNameTitle, yearTitle, workdaysEl, offDaysEl;
let balanceValueEl, balanceTextEl, resetBtn, clearCacheBtn;
let holidayListEl, addHolidayForm, customHolidayDate, customHolidayName;
let holidayListContainer, toggleHolidayListBtn, festivoHoursGroup, festivoHoursInput;

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

// --- FESTIVOS BÁSICOS ---
function getBasicHolidays(year) {
  const easterDate = getEasterDate(year);
  const easterMonday = new Date(easterDate);
  easterMonday.setDate(easterDate.getDate() + 1);
  
  return [
    { date: `${year}-01-01`, name: "Año Nuevo" },
    { date: `${year}-01-06`, name: "Epifanía" },
    { date: formatDate(easterDate), name: "Pascua" },
    { date: formatDate(easterMonday), name: "Lunes de Pascua" },
    { date: `${year}-05-01`, name: "Día del Trabajo" },
    { date: `${year}-08-15`, name: "Asunción" },
    { date: `${year}-10-12`, name: "Día de la Hispanidad" },
    { date: `${year}-11-01`, name: "Todos los Santos" },
    { date: `${year}-12-06`, name: "Día de la Constitución" },
    { date: `${year}-12-08`, name: "Inmaculada Concepción" },
    { date: `${year}-12-25`, name: "Navidad" },
  ];
}

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

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function displayError(message) {
  if (errorContainer) {
    errorContainer.innerHTML = `<div class="error">${message}</div>`;
  }
}

function isHoliday(date, holidayList) {
  const dateStr = formatDate(date);
  return holidayList.includes(dateStr);
}

function fillHourSelect(select, max, step) {
  if (!select) return;
  
  select.innerHTML = '<option value="">--</option>';
  for (let i = 0; i <= max; i += step) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i.toFixed(2);
    select.appendChild(option);
  }
}

// --- CÁLCULO DE BALANCE ---
const debouncedCalculateBalance = debounce(calculateBalance, 300);

function calculateBalance() {
  if (!yearSelect || !monthSelect || !assignedHoursInput) return;
  
  const year = parseInt(yearSelect.value);
  const month = parseInt(monthSelect.value);
  const assignedHours = parseFloat(assignedHoursInput.value) || 0;
  const offdayHours = parseFloat(festivoHoursInput?.value) || 0;
  
  const totalDays = new Date(year, month + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  let totalMonthHours = 0;
  let hoursSoFar = 0;
  let workdays = 0;
  let offDays = 0;
  
  // Configuración de días de la semana
  const weekdayConfig = {};
  weekdayIds.forEach(({ key, jsDay }) => {
    const switchEl = weekdaySwitches[key];
    const inputEl = weekdayHoursInputs[key];
    if (switchEl && inputEl) {
      weekdayConfig[jsDay] = {
        enabled: switchEl.checked,
        hours: parseFloat(inputEl.value) || 0
      };
    }
  });
  
  // Calcular días laborables y festivos
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHolidayDay = isHoliday(date, holidays);
    
    if (isWeekend || isHolidayDay) {
      offDays++;
      if (includeOffdaysToggle?.checked && offdayHours > 0) {
        totalMonthHours += offdayHours;
        if (day <= currentDay && month === currentMonth && year === currentYear) {
          hoursSoFar += offdayHours;
        }
      }
    } else {
      const weekdayConfig = weekdayConfig[dayOfWeek];
      if (weekdayConfig && weekdayConfig.enabled && weekdayConfig.hours > 0) {
        workdays++;
        totalMonthHours += weekdayConfig.hours;
        if (day <= currentDay && month === currentMonth && year === currentYear) {
          hoursSoFar += weekdayConfig.hours;
        }
      }
    }
  }
  
  // Calcular balance
  const balance = hoursSoFar - assignedHours;
  
  // Actualizar UI
  if (totalMonthHoursTitle) totalMonthHoursTitle.textContent = `🗓️ Horas para ${getMonthName(month)} ${year}`;
  if (monthNameTitle) monthNameTitle.textContent = getMonthName(month);
  if (yearTitle) yearTitle.textContent = year;
  if (totalMonthHours) totalMonthHours.textContent = `${totalMonthHours.toFixed(2)} horas`;
  if (hoursSoFar) hoursSoFar.textContent = `${hoursSoFar.toFixed(2)} horas`;
  if (workdaysEl) workdaysEl.textContent = `${workdays} días`;
  if (offDaysEl) offDaysEl.textContent = `${offDays} días`;
  
  // Formatear balance
  const absBalance = Math.abs(balance);
  if (balanceValueEl) balanceValueEl.textContent = `${balance >= 0 ? '+' : '-'}${absBalance.toFixed(2)} horas`;
  
  if (balanceTextEl) {
    if (balance > 0) {
      balanceTextEl.textContent = "¡Estás por delante! 🎉";
      if (balanceValueEl) balanceValueEl.style.color = "var(--success-color)";
    } else if (balance < 0) {
      balanceTextEl.textContent = "Te faltan horas por completar 📈";
      if (balanceValueEl) balanceValueEl.style.color = "var(--danger-color)";
    } else {
      balanceTextEl.textContent = "¡Perfecto! Estás al día ✅";
      if (balanceValueEl) balanceValueEl.style.color = "var(--secondary-color)";
    }
  }
  
  if (resultsContainer) resultsContainer.style.display = "block";
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
  if (!yearSelect) return;
  
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
  if (loadingEl) loadingEl.style.display = show ? "block" : "none";
  if (show && resultsContainer) {
    resultsContainer.style.display = "none";
  }
}

// --- INICIALIZACIÓN DE DÍAS DE LA SEMANA ---
function initializeWeekdays() {
  weekdayIds.forEach(({ key }) => {
    weekdaySwitches[key] = document.getElementById(`weekday-${key}`);
    weekdayHoursInputs[key] = document.getElementById(`hours-${key}`);
    
    if (weekdayHoursInputs[key]) {
      weekdayHoursInputs[key].classList.add('slim-square');
      
      if (weekdaySwitches[key]) {
        weekdaySwitches[key].addEventListener('change', () => {
          const input = weekdayHoursInputs[key];
          
          if (weekdaySwitches[key].checked) {
            input.style.display = 'block';
            input.classList.remove('hidden');
            input.removeAttribute('inert');
            input.removeAttribute('aria-hidden');
            
            if (!slimSelectInstances[key]) {
              slimSelectInstances[key] = new SlimSelect({ 
                select: `#hours-${key}`, 
                settings: { showSearch: false } 
              });
            }
          } else {
            input.style.display = 'none';
            input.classList.add('hidden');
            input.setAttribute('inert', '');
            input.value = '';
            
            if (slimSelectInstances[key]) {
              slimSelectInstances[key].destroy();
              slimSelectInstances[key] = null;
            }
          }
          
          debouncedCalculateBalance();
        });
        
        weekdayHoursInputs[key].addEventListener('change', debouncedCalculateBalance);
      }
    }
  });
}

// --- RENDERIZADO DE FESTIVOS ---
function renderHolidayList() {
  if (!holidayListEl) return;
  
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
    
    if (h.date < today) {
      card.classList.add("festivo-pasado");
    }
    
    const dateObj = new Date(h.date);
    const formattedDate = dateObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const fecha = document.createElement("div");
    fecha.className = "festivo-fecha";
    fecha.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    card.appendChild(fecha);
    
    const nombre = document.createElement("div");
    nombre.className = "festivo-nombre";
    nombre.textContent = h.name;
    card.appendChild(nombre);
    
    if (h.type === "Personalizado") {
      const tipo = document.createElement("div");
      tipo.className = "festivo-tipo";
      tipo.textContent = "🎯 Personalizado";
      tipo.style.fontSize = "0.8rem";
      tipo.style.color = "var(--accent-color)";
      tipo.style.fontWeight = "600";
      tipo.style.marginBottom = "0.5rem";
      card.appendChild(tipo);
      
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
    
    fragment.appendChild(card);
  }
  
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

// --- INICIALIZACIÓN DE LA APLICACIÓN ---
async function initializeApp() {
  try {
    console.log('🚀 Inicializando aplicación...');
    
    // Asignar elementos del DOM
    yearSelect = document.getElementById("year");
    monthSelect = document.getElementById("month");
    assignedHoursInput = document.getElementById("totalHours");
    calculateBtn = document.getElementById("calculateBtn");
    resultsContainer = document.getElementById("results-container");
    loadingEl = document.getElementById("loading");
    errorContainer = document.getElementById("error-container");
    includeOffdaysToggle = document.getElementById("includeOffdays");
    totalMonthHours = document.getElementById("totalMonthHours");
    hoursSoFar = document.getElementById("hoursSoFar");
    totalMonthHoursTitle = document.getElementById("totalMonthHoursTitle");
    monthNameTitle = document.getElementById("monthNameTitle");
    yearTitle = document.getElementById("yearTitle");
    workdaysEl = document.getElementById("workdays");
    offDaysEl = document.getElementById("offDays");
    balanceValueEl = document.getElementById("balanceValue");
    balanceTextEl = document.getElementById("balanceText");
    resetBtn = document.getElementById("resetBtn");
    clearCacheBtn = document.getElementById("clearCacheBtn");
    holidayListEl = document.getElementById("holidayList");
    addHolidayForm = document.getElementById("addHolidayForm");
    customHolidayDate = document.getElementById("customHolidayDate");
    customHolidayName = document.getElementById("customHolidayName");
    holidayListContainer = document.getElementById("holidayListContainer");
    toggleHolidayListBtn = document.getElementById("toggleHolidayListBtn");
    festivoHoursGroup = document.getElementById('festivo-hours-group');
    festivoHoursInput = document.getElementById('hours-festivo');
    
    // Verificar elementos críticos
    if (!yearSelect || !monthSelect || !assignedHoursInput) {
      throw new Error("No se pudieron encontrar elementos críticos del DOM");
    }
    
    // Verificar que SlimSelect esté disponible
    if (typeof SlimSelect === 'undefined') {
      console.warn('⚠️ SlimSelect no está disponible, usando selects nativos');
    }
    
    populateYearSelector();
    loadCustomHolidays();
    
    // Rellenar selects de horas
    fillHourSelect(assignedHoursInput, 24, 0.25);
    if (festivoHoursInput) {
      fillHourSelect(festivoHoursInput, 24, 0.25);
      festivoHoursInput.classList.add('slim-square');
    }
    
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
    
    // Cargar festivos básicos inmediatamente
    console.log('📅 Cargando festivos básicos...');
    const year = parseInt(yearSelect.value);
    holidaysMataro = getBasicHolidays(year);
    console.log('✅ Festivos básicos cargados:', holidaysMataro.length, 'festivos');
    
    // Ocultar loading inmediatamente
    showLoading(false);
    
    // Actualizar festivos y calcular balance inicial
    updateHolidays();
    
    // Event listeners para controles principales
    yearSelect.addEventListener("change", () => {
      const selectedYear = parseInt(yearSelect.value);
      holidaysMataro = getBasicHolidays(selectedYear);
      updateHolidays();
    });
    
    if (monthSelect) monthSelect.addEventListener("change", debouncedCalculateBalance);
    if (assignedHoursInput) assignedHoursInput.addEventListener("change", debouncedCalculateBalance);
    if (festivoHoursInput) festivoHoursInput.addEventListener("change", debouncedCalculateBalance);
    
    // Event listeners para botones
    if (calculateBtn) calculateBtn.addEventListener("click", calculateBalance);
    if (resetBtn) resetBtn.addEventListener("click", resetApp);
    if (clearCacheBtn) clearCacheBtn.addEventListener("click", () => {
      localStorage.removeItem(MATARO_CACHE_KEY);
      alert("Caché limpiado. Los festivos se recargarán en la próxima consulta.");
    });
    
    // Event listeners para festivos
    if (includeOffdaysToggle && festivoHoursGroup && festivoHoursInput) {
      includeOffdaysToggle.addEventListener('change', () => {
        if (includeOffdaysToggle.checked) {
          festivoHoursGroup.style.display = 'block';
          festivoHoursGroup.classList.remove('hidden');
        } else {
          festivoHoursGroup.style.display = 'none';
          festivoHoursGroup.classList.add('hidden');
          festivoHoursInput.value = '';
        }
        debouncedCalculateBalance();
      });
    }
    
    if (toggleHolidayListBtn && holidayListContainer) {
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
    }
    
    if (addHolidayForm) {
      addHolidayForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!customHolidayDate || !customHolidayName) return;
        
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
    }
    
    console.log('🎉 Aplicación inicializada correctamente');
    
  } catch (error) {
    console.error("❌ Error inicializando la aplicación:", error);
    showLoading(false);
    displayError(`Error al inicializar la aplicación: ${error.message}`);
  }
}

async function resetApp() {
  if (confirm("¿Estás seguro de que quieres resetear toda la configuración?")) {
    if (includeOffdaysToggle) includeOffdaysToggle.checked = false;
    
    weekdayIds.forEach(({ key }) => {
      if (weekdaySwitches[key]) {
        weekdaySwitches[key].checked = false;
      }
      if (weekdayHoursInputs[key]) {
        weekdayHoursInputs[key].value = "";
        weekdayHoursInputs[key].style.display = "none";
        weekdayHoursInputs[key].classList.add("hidden");
      }
    });
    
    customHolidays = [];
    saveCustomHolidays();
    
    if (assignedHoursInput) assignedHoursInput.value = "";
    if (festivoHoursInput) festivoHoursInput.value = "";
    if (festivoHoursGroup) festivoHoursGroup.style.display = "none";
    if (resultsContainer) resultsContainer.style.display = "none";
    if (errorContainer) errorContainer.innerHTML = "";
    
    updateHolidays();
  }
}

// --- INICIALIZAR CUANDO EL DOM ESTÉ LISTO ---
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

