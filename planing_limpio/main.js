// --- CONFIGURACIÓN ---
const MATARO_HOLIDAYS_URL =
  "https://corsproxy.io/?https://www.mataro.cat/es/la-ciudad/festivos-locales";
const LOCAL_STORAGE_KEY = "customHolidays";
const MATARO_CACHE_KEY = "mataroHolidaysCache";
const MATARO_CACHE_TTL = 0; // Forzar recarga inmediata (0 ms)

// --- ESTADO DE LA APLICACIÓN ---
let holidaysMataro = [];
let customHolidays = [];
let holidays = [];

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
      setTimeout(() => {
        const slimElement = input.nextElementSibling;
        if (slimElement && slimElement.classList.contains('ss-main')) {
          slimElement.style.display = 'block';
          slimElement.style.visibility = 'visible';
          slimElement.style.opacity = '1';
          slimElement.style.height = 'auto';
          slimElement.style.overflow = 'visible';
          slimElement.removeAttribute('inert');
        }
      }, 10);
      
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
    
    calculateBalance();
  });
  
  // Recalcular al cambiar horas
  weekdayHoursInputs[key].addEventListener('change', calculateBalance);
});

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
    setTimeout(() => {
      const slimElement = festivoHoursGroup.querySelector('.ss-main');
      if (slimElement) {
        slimElement.style.display = 'block';
        slimElement.style.visibility = 'visible';
        slimElement.style.opacity = '1';
        slimElement.style.height = 'auto';
        slimElement.style.overflow = 'visible';
        slimElement.removeAttribute('inert');
      }
    }, 10);
    
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
  
  calculateBalance();
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

function saveCustomHolidays() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customHolidays));
}

function loadCustomHolidays() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (data) {
    try {
      customHolidays = JSON.parse(data);
    } catch {
      customHolidays = [];
    }
  } else {
    customHolidays = [];
  }
}

function renderHolidayList() {
  holidayListEl.innerHTML = "";
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
    // Fecha
    const fecha = document.createElement("div");
    fecha.className = "festivo-fecha";
    fecha.textContent = h.date;
    card.appendChild(fecha);
    // Nombre
    const nombre = document.createElement("div");
    nombre.className = "festivo-nombre";
    nombre.textContent = h.name;
    card.appendChild(nombre);
    // Acción eliminar
    if (h.type === "Personalizado") {
      const actions = document.createElement("div");
      actions.className = "festivo-actions";
      const btn = document.createElement("button");
      btn.textContent = "Eliminar";
      btn.className = "btn btn-secondary";
      btn.onclick = () => {
        customHolidays = customHolidays.filter((ch) => ch.date !== h.date);
        saveCustomHolidays();
        updateHolidays();
      };
      actions.appendChild(btn);
      card.appendChild(actions);
    }
    holidayListEl.appendChild(card);
  }
}

function updateHolidays() {
  const all = [...holidaysMataro, ...customHolidays];
  const map = new Map();
  for (const h of all) {
    map.set(h.date, h);
  }
  holidays = Array.from(map.values()).map((h) => h.date);
  renderHolidayList();
  calculateBalance();
}

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

async function loadMataroHolidays() {
  holidaysMataro = [];
  const year = parseInt(yearSelect.value);
  console.log("Cargando festivos para año:", year);
  
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
    const response = await fetch(MATARO_HOLIDAYS_URL);
    if (!response.ok) throw new Error("Error de red");
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    let table = null;
    const headers = Array.from(doc.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    for (const h of headers) {
      if (h.textContent.includes(year)) {
        let el = h.nextElementSibling;
        while (el && el.tagName !== "TABLE") el = el.nextElementSibling;
        if (el && el.tagName === "TABLE") {
          table = el;
          break;
        }
      }
    }
    if (!table) return;
    const rows = Array.from(table.querySelectorAll("tbody tr"));
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
    cache[year] = { timestamp: now, holidays: holidaysMataro };
    localStorage.setItem(MATARO_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    holidaysMataro = [];
    displayError("No se pudieron cargar los festivos de Mataró.");
  }
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

// --- Rellenar selects de horas ---
function fillHourSelect(select, max, step) {
  select.innerHTML = '<option value="">--</option>';
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
    select.innerHTML += `<option value="${value}">${label}</option>`;
  }
}

function calculateBalance() {
  // Validar días de la semana personalizados
  let atLeastOneDay = false;
  let error = '';
  const daysConfig = {};
  weekdayIds.forEach(({ key, jsDay, label }) => {
    if (weekdaySwitches[key].checked) {
      atLeastOneDay = true;
      const hours = parseFloat(weekdayHoursInputs[key].value);
      if (isNaN(hours) || hours <= 0) {
        error = `Selecciona las horas para ${label}`;
      }
      daysConfig[jsDay] = hours;
    }
  });
  // Validar si hay servicio en festivos
  const includeOffdays = includeOffdaysToggle.checked;
  let festivoHours = 0;
  if (includeOffdays) {
    festivoHours = parseFloat(festivoHoursInput.value);
    if (isNaN(festivoHours) || festivoHours <= 0) {
      error = 'Selecciona las horas para festivos';
    }
  }
  if (!atLeastOneDay && !includeOffdays) {
    balanceValueEl.textContent = '--';
    balanceTextEl.textContent = 'Selecciona al menos un día de la semana o servicio en festivos';
    resultsContainer.style.display = 'none';
    return;
  }
  if (error) {
    balanceValueEl.textContent = '--';
    balanceTextEl.textContent = error;
    resultsContainer.style.display = 'none';
    return;
  }
  // Validar horas asignadas al mes
  const totalAssignedHours = parseFloat(assignedHoursInput.value);
  if (isNaN(totalAssignedHours) || totalAssignedHours <= 0) {
    balanceValueEl.textContent = '--';
    balanceTextEl.textContent = 'Selecciona las horas asignadas al mes';
    resultsContainer.style.display = 'none';
    return;
  }
  const year = parseInt(yearSelect.value);
  const month = parseInt(monthSelect.value);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let consumed = 0;
  let workdaysCount = 0;
  let offDaysCount = 0;

  
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dayOfWeek = currentDate.getDay();
    const isHolidayDay = isHoliday(currentDate, holidays);
    
      // Usar fecha local en lugar de UTC para evitar problemas de zona horaria
  const yearStr = currentDate.getFullYear();
  const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
  const dayStr = String(currentDate.getDate()).padStart(2, '0');
  const dateString = `${yearStr}-${monthStr}-${dayStr}`;
  
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    if (isHolidayDay && includeOffdays) {
      consumed += festivoHours;
      offDaysCount++;

    } else if (!isHolidayDay && daysConfig.hasOwnProperty(dayOfWeek)) {
      consumed += daysConfig[dayOfWeek];
      workdaysCount++;

    } else if (isHolidayDay && !includeOffdays) {
      offDaysCount++;

    } else {
      // Días que no son festivos y no están en la configuración (fines de semana normales)
      offDaysCount++;

    }
  }
  // Calcular balance
  const balance = totalAssignedHours - consumed;
  // Actualizar UI con los resultados
  totalMonthHours.textContent = `${consumed.toFixed(2)} h`;
  // Calcular horas realizadas hasta hoy
  const now = new Date();
  const today =
    year === now.getFullYear() && month === now.getMonth()
      ? now.getDate()
      : daysInMonth;
  let consumedSoFar = 0;
  for (let day = 1; day <= today; day++) {
    const currentDate = new Date(year, month, day);
    const dayOfWeek = currentDate.getDay();
    const isHolidayDay = isHoliday(currentDate, holidays);
    if (isHolidayDay && includeOffdays) {
      consumedSoFar += festivoHours;
    } else if (!isHolidayDay && daysConfig.hasOwnProperty(dayOfWeek)) {
      consumedSoFar += daysConfig[dayOfWeek];
    }
  }
  hoursSoFar.textContent = `${consumedSoFar.toFixed(2)} h`;
  workdaysEl.textContent = `${workdaysCount}`;
  offDaysEl.textContent = `${offDaysCount}`;
  balanceValueEl.textContent = `${balance.toFixed(2)} h`;
  if (balance >= 0) {
    balanceValueEl.style.color = '#28a745';
    balanceTextEl.textContent = 'Horas a tu favor este mes';
  } else {
    balanceValueEl.style.color = '#dc3545';
    balanceTextEl.textContent = 'Horas en contra este mes';
  }
  // Títulos dinámicos
  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  monthNameTitle.textContent = monthNames[month];
  yearTitle.textContent = year;
  resultsContainer.style.display = 'block';
}

function populateYearSelector() {
  yearSelect.innerHTML = "";
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    yearSelect.appendChild(option);
  }
}

function showLoading(show) {
  if (show) {
    loadingEl.style.display = "";
  } else {
    loadingEl.style.display = "none";
  }
}

async function initializeApp() {
  populateYearSelector();
  const now = new Date();
  yearSelect.value = now.getFullYear();
  monthSelect.value = now.getMonth();
  loadCustomHolidays();
  showLoading(true);
  errorContainer.innerHTML = "";
  await loadMataroHolidays();
  updateHolidays();
  showLoading(false);
  
  // Asegurar que los campos de horas estén ocultos por defecto
  weekdayIds.forEach(({ key }) => {
    weekdayHoursInputs[key].style.display = 'none';
  });
  festivoHoursGroup.style.display = 'none';
}

calculateBtn.addEventListener("click", calculateBalance);
assignedHoursInput.addEventListener("input", calculateBalance);
yearSelect.addEventListener("change", async () => {
  showLoading(true);
  await loadMataroHolidays();
  updateHolidays();
  showLoading(false);
});
monthSelect.addEventListener("change", calculateBalance);
includeOffdaysToggle.addEventListener("change", calculateBalance);

// Guardar referencias a SlimSelect para año y mes
let slimYear = null;
let slimMonth = null;

const mainForm = document.getElementById("mainForm");

async function resetApp() {
  // Limpiar localStorage
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  localStorage.removeItem(MATARO_CACHE_KEY);
  // Limpiar arrays en memoria
  holidaysMataro = [];
  customHolidays = [];
  holidays = [];
  // Rellenar el selector de año
  populateYearSelector();
  // Seleccionar año y mes actuales (asegurando que existen en el selector)
  const now = new Date();
  if ([...yearSelect.options].some(opt => opt.value == now.getFullYear())) {
    yearSelect.value = now.getFullYear();
  }
  if ([...monthSelect.options].some(opt => opt.value == now.getMonth())) {
    monthSelect.value = now.getMonth();
  }
  // Limpiar los campos de horas (poner a vacío)
  assignedHoursInput.value = "";
  // Checkbox desactivado por defecto
  includeOffdaysToggle.checked = false;
  includeOffdaysToggle.defaultChecked = false;
  // Limpiar campos de festivos personalizados
  if (customHolidayDate) customHolidayDate.value = "";
  if (customHolidayName) customHolidayName.value = "";
  // Limpiar días de la semana
  weekdayIds.forEach(({ key }) => {
    weekdaySwitches[key].checked = false;
    weekdayHoursInputs[key].value = '';
    weekdayHoursInputs[key].style.display = 'none';
    weekdayHoursInputs[key].classList.add('hidden');
    weekdayHoursInputs[key].setAttribute('inert', '');
    // Destruir SlimSelect si existe
    if (slimSelectInstances[key]) {
      slimSelectInstances[key].destroy();
      slimSelectInstances[key] = null;
    }
    // Forzar ocultación de elementos SlimSelect
    const slimElements = document.querySelectorAll(`#hours-${key} + .ss-main, #hours-${key} ~ .ss-main`);
    slimElements.forEach(el => {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
      el.style.opacity = '0';
      el.style.height = '0';
      el.style.overflow = 'hidden';
      el.setAttribute('inert', '');
    });
  });
  // Limpiar campo de horas de festivo
  festivoHoursInput.value = '';
  festivoHoursGroup.style.display = 'none';
  festivoHoursGroup.classList.add('hidden');
  festivoHoursGroup.setAttribute('inert', '');
  festivoHoursInput.setAttribute('inert', '');
  // Destruir SlimSelect de festivo si existe
  if (slimSelectInstances['festivo']) {
    slimSelectInstances['festivo'].destroy();
    slimSelectInstances['festivo'] = null;
  }
  // Forzar ocultación de elementos SlimSelect de festivo
  const slimElements = festivoHoursGroup.querySelectorAll('.ss-main');
  slimElements.forEach(el => {
    el.style.display = 'none';
    el.style.visibility = 'hidden';
    el.style.opacity = '0';
    el.style.height = '0';
    el.style.overflow = 'hidden';
    el.setAttribute('inert', '');
  });
  // Recargar festivos y refrescar UI
  loadCustomHolidays();
  showLoading(true);
  errorContainer.innerHTML = "";
  await loadMataroHolidays();
  updateHolidays();
  showLoading(false);
  // Ocultar resultados y limpiar textos
  resultsContainer.style.display = "none";
  balanceValueEl.textContent = "--";
  balanceTextEl.textContent = "Introduce horas asignadas válidas";
  totalMonthHours.textContent = "--";
  hoursSoFar.textContent = "--";
  workdaysEl.textContent = "--";
  offDaysEl.textContent = "--";
  monthNameTitle.textContent = "";
  yearTitle.textContent = "";
}

resetBtn.addEventListener("click", resetApp);
clearCacheBtn.addEventListener("click", async () => {
  // Limpiar todo el localStorage relacionado con festivos
  localStorage.removeItem(MATARO_CACHE_KEY);
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  
  // Limpiar arrays en memoria
  holidaysMataro = [];
  customHolidays = [];
  holidays = [];
  
  showLoading(true);
  await loadMataroHolidays();
  updateHolidays();
  showLoading(false);
  
  console.log("Festivos cargados:", holidaysMataro);
  console.log("Festivos totales:", holidays);
  
  // Mostrar mensaje en la consola en lugar de alerta
  console.log("✅ Caché de festivos limpiado completamente. Los festivos se han recargado desde la web de Mataró.");
});

document.addEventListener('DOMContentLoaded', () => {
  // Horas asignadas al mes: hasta 300h
  fillHourSelect(document.getElementById('totalHours'), 300, 0.25);
  // Horas de festivo: hasta 12h
  fillHourSelect(document.getElementById('hours-festivo'), 12, 0.25);
  // Horas de cada día: hasta 12h
  ['mon','tue','wed','thu','fri','sat','sun'].forEach(key => {
    fillHourSelect(document.getElementById(`hours-${key}`), 12, 0.25);
  });
  
  // Asegurar que los campos estén ocultos por defecto
  weekdayIds.forEach(({ key }) => {
    weekdayHoursInputs[key].style.display = 'none';
    weekdayHoursInputs[key].classList.add('hidden');
    weekdayHoursInputs[key].setAttribute('inert', '');
  });
  festivoHoursGroup.style.display = 'none';
  festivoHoursGroup.classList.add('hidden');
  festivoHoursGroup.setAttribute('inert', '');
  festivoHoursInput.setAttribute('inert', '');
  
  // Inicializar la app solo después de rellenar los selects
  resetApp();
});
