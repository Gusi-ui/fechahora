// --- CONFIGURACIÓN ---
const MATARO_HOLIDAYS_URL = 'https://corsproxy.io/?https://www.mataro.cat/es/la-ciudad/festivos-locales';
const LOCAL_STORAGE_KEY = 'customHolidays';
const MATARO_CACHE_KEY = 'mataroHolidaysCache';
const MATARO_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas en ms

// --- ESTADO DE LA APLICACIÓN ---
let holidaysMataro = [];
let customHolidays = [];
let holidays = [];

// --- ELEMENTOS DEL DOM ---
const yearSelect = document.getElementById('year');
const monthSelect = document.getElementById('month');
const assignedHoursInput = document.getElementById('totalHours');
const calculateBtn = document.getElementById('calculateBtn');
const resultsContainer = document.getElementById('results-container');
const loadingEl = document.getElementById('loading');
const errorContainer = document.getElementById('error-container');
const hoursWeekdayInput = document.getElementById('hoursWeekday');
const hoursOffdayInput = document.getElementById('hoursOffday');
const includeOffdaysToggle = document.getElementById('includeOffdays');
const totalMonthHours = document.getElementById('totalMonthHours');
const hoursSoFar = document.getElementById('hoursSoFar');
const totalMonthHoursTitle = document.getElementById('totalMonthHoursTitle');
const monthNameTitle = document.getElementById('monthNameTitle');
const yearTitle = document.getElementById('yearTitle');
const workdaysEl = document.getElementById('workdays');
const offDaysEl = document.getElementById('offDays');
const balanceValueEl = document.getElementById('balanceValue');
const balanceTextEl = document.getElementById('balanceText');

// Festivos personalizados
const holidayListEl = document.getElementById('holidayList');
const addHolidayForm = document.getElementById('addHolidayForm');
const customHolidayDate = document.getElementById('customHolidayDate');
const customHolidayName = document.getElementById('customHolidayName');
const holidayListContainer = document.getElementById('holidayListContainer');
const toggleHolidayListBtn = document.getElementById('toggleHolidayListBtn');

// Mostrar/ocultar lista de festivos
let holidayListVisible = false;
toggleHolidayListBtn.addEventListener('click', () => {
    holidayListVisible = !holidayListVisible;
    if (holidayListVisible) {
        holidayListContainer.classList.add('active');
    } else {
        holidayListContainer.classList.remove('active');
    }
    toggleHolidayListBtn.textContent = holidayListVisible ? 'Ocultar festivos' : 'Mostrar festivos';
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
    holidayListEl.innerHTML = '';
    const all = [
        ...holidaysMataro.map(d => ({...d, type: 'Mataró'})),
        ...customHolidays.map(d => ({...d, type: 'Personalizado'})),
    ];
    all.sort((a, b) => a.date.localeCompare(b.date));
    for (const h of all) {
        const li = document.createElement('li');
        li.textContent = `${h.date} - ${h.name} (${h.type})`;
        if (h.type === 'Personalizado') {
            const btn = document.createElement('button');
            btn.textContent = 'Eliminar';
            btn.style.marginLeft = '1rem';
            btn.onclick = () => {
                customHolidays = customHolidays.filter(ch => ch.date !== h.date);
                saveCustomHolidays();
                updateHolidays();
            };
            li.appendChild(btn);
        }
        holidayListEl.appendChild(li);
    }
}

function updateHolidays() {
    const all = [
        ...holidaysMataro,
        ...customHolidays
    ];
    const map = new Map();
    for (const h of all) {
        map.set(h.date, h);
    }
    holidays = Array.from(map.values()).map(h => h.date);
    renderHolidayList();
    calculateBalance();
}

addHolidayForm.addEventListener('submit', e => {
    e.preventDefault();
    const date = customHolidayDate.value;
    const name = customHolidayName.value.trim() || 'Personalizado';
    if (!date) return;
    if (customHolidays.some(h => h.date === date)) return;
    customHolidays.push({date, name});
    saveCustomHolidays();
    customHolidayDate.value = '';
    customHolidayName.value = '';
    updateHolidays();
});

async function loadMataroHolidays() {
    holidaysMataro = [];
    const year = parseInt(yearSelect.value);
    let cache = localStorage.getItem(MATARO_CACHE_KEY);
    if (cache) {
        try {
            cache = JSON.parse(cache);
        } catch { cache = {}; }
    } else {
        cache = {};
    }
    const now = Date.now();
    if (cache[year] && (now - cache[year].timestamp < MATARO_CACHE_TTL)) {
        holidaysMataro = cache[year].holidays;
        return;
    }
    try {
        const response = await fetch(MATARO_HOLIDAYS_URL);
        if (!response.ok) throw new Error('Error de red');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        let table = null;
        const headers = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        for (const h of headers) {
            if (h.textContent.includes(year)) {
                let el = h.nextElementSibling;
                while (el && el.tagName !== 'TABLE') el = el.nextElementSibling;
                if (el && el.tagName === 'TABLE') {
                    table = el;
                    break;
                }
            }
        }
        if (!table) return;
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 1) {
                const rawDate = cells[0].textContent.trim();
                const name = cells[1] ? cells[1].textContent.trim() : 'Mataró';
                const date = parseSpanishDate(rawDate, year);
                if (date) holidaysMataro.push({date, name});
            }
        }
        cache[year] = { timestamp: now, holidays: holidaysMataro };
        localStorage.setItem(MATARO_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
        holidaysMataro = [];
        displayError('No se pudieron cargar los festivos de Mataró.');
    }
}

function parseSpanishDate(str, year) {
    const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const match = str.match(/(\d{1,2}) de ([a-záéíóúñ]+)/i);
    if (!match) return null;
    const day = match[1].padStart(2, '0');
    let month = months.findIndex(m => m === match[2].toLowerCase());
    if (month === -1) return null;
    month = (month+1).toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function displayError(message) {
    errorContainer.innerHTML = `<p class="error-message">${message}</p>`;
}

function isHoliday(date, holidayList) {
    const dateString = date.toISOString().split('T')[0];
    return holidayList.includes(dateString);
}

function calculateBalance() {
    const hoursWeekday = parseFloat(hoursWeekdayInput.value);
    const hoursOffday = parseFloat(hoursOffdayInput.value);
    const includeOffdays = includeOffdaysToggle.checked;
    const totalAssignedHours = parseFloat(assignedHoursInput.value);
    if (isNaN(totalAssignedHours) || totalAssignedHours <= 0) {
        balanceValueEl.textContent = '--';
        balanceTextEl.textContent = 'Introduce horas asignadas válidas';
        return;
    }
    if (isNaN(hoursWeekday) || isNaN(hoursOffday)) {
        balanceValueEl.textContent = '--';
        balanceTextEl.textContent = 'Introduce valores numéricos para las horas';
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
        const isOffDay = isHoliday(currentDate, holidays) || dayOfWeek === 0 || dayOfWeek === 6;
        if (isOffDay) {
            if (includeOffdays) {
                consumed += hoursOffday;
            }
            offDaysCount++;
        } else {
            consumed += hoursWeekday;
            workdaysCount++;
        }
    }
    const balance = totalAssignedHours - consumed;
    // Actualizar UI con los resultados
    totalMonthHours.textContent = `${consumed.toFixed(2)} h`;
    // Calcular horas realizadas hasta hoy
    const now = new Date();
    const today = (year === now.getFullYear() && month === now.getMonth()) ? now.getDate() : daysInMonth;
    let consumedSoFar = 0;
    for (let day = 1; day <= today; day++) {
        const currentDate = new Date(year, month, day);
        const dayOfWeek = currentDate.getDay();
        const isOffDay = isHoliday(currentDate, holidays) || dayOfWeek === 0 || dayOfWeek === 6;
        if (isOffDay) {
            if (includeOffdays) {
                consumedSoFar += hoursOffday;
            }
        } else {
            consumedSoFar += hoursWeekday;
        }
    }
    hoursSoFar.textContent = `${consumedSoFar.toFixed(2)} h`;
    workdaysEl.textContent = `${workdaysCount} (x${hoursWeekday}h)`;
    offDaysEl.textContent = `${offDaysCount} ${includeOffdays ? `(x${hoursOffday}h)`: '(0h)'}`;
    balanceValueEl.textContent = `${balance.toFixed(2)} h`;
    if (balance >= 0) {
        balanceValueEl.style.color = '#28a745';
        balanceTextEl.textContent = 'Horas a tu favor este mes';
    } else {
        balanceValueEl.style.color = '#dc3545';
        balanceTextEl.textContent = 'Horas en contra este mes';
    }
    // Títulos dinámicos
    const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    monthNameTitle.textContent = monthNames[month];
    yearTitle.textContent = year;
    resultsContainer.style.display = 'block';
}

function populateYearSelector() {
    yearSelect.innerHTML = '';
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }
}

function showLoading(show) {
    if (show) {
        loadingEl.style.display = '';
    } else {
        loadingEl.style.display = 'none';
    }
}

async function initializeApp() {
    populateYearSelector();
    const now = new Date();
    yearSelect.value = now.getFullYear();
    monthSelect.value = now.getMonth();
    loadCustomHolidays();
    showLoading(true);
    errorContainer.innerHTML = '';
    await loadMataroHolidays();
    updateHolidays();
    showLoading(false);
}

calculateBtn.addEventListener('click', calculateBalance);
assignedHoursInput.addEventListener('input', calculateBalance);
yearSelect.addEventListener('change', async () => {
    showLoading(true);
    await loadMataroHolidays();
    updateHolidays();
    showLoading(false);
});
monthSelect.addEventListener('change', calculateBalance);
hoursWeekdayInput.addEventListener('input', calculateBalance);
hoursOffdayInput.addEventListener('input', calculateBalance);
includeOffdaysToggle.addEventListener('change', calculateBalance);

document.addEventListener('DOMContentLoaded', initializeApp); 