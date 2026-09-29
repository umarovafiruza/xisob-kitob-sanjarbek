/**
 * Oilaviy Xarajatlar Tracker - Mobile App Edition
 * Sof JavaScript (Vanilla JS) yordamida yaratilgan
 */

// Kategoriyalar ro'yxati
const CATEGORIES = [
  "Ta'lim",
  "Transport",
  "Uy-ro'zg'or",
  "Kredit/Qarz",
  "Sog'liq",
  "Boshqa"
];

// LocalStorage kalitlari
const EXPENSES_STORAGE_KEY = 'family_expenses_tracker_data';
const BUDGET_STORAGE_KEY = 'family_expenses_monthly_budget';

// DOM elementlari - Navigatsiya va Tablar
const tabPanes = document.querySelectorAll('.tab-pane');
const navBtns = document.querySelectorAll('.nav-btn');
const goToHistoryLink = document.getElementById('goToHistoryLink');
const quickBudgetBtn = document.getElementById('quickBudgetBtn');
const toastMessage = document.getElementById('toastMessage');
const currentMonthYearEl = document.getElementById('currentMonthYear');

// DOM elementlari - Forma va Ro'yxat
const expenseForm = document.getElementById('expenseForm');
const expenseNameInput = document.getElementById('expenseName');
const expenseAmountInput = document.getElementById('expenseAmount');
const expenseCategorySelect = document.getElementById('expenseCategory');
const categoryGridEl = document.getElementById('categoryGrid');
const expenseListEl = document.getElementById('expenseList');
const recentExpenseListEl = document.getElementById('recentExpenseList');
const clearAllBtn = document.getElementById('clearAllBtn');
const historyCountBadge = document.getElementById('historyCountBadge');

// DOM elementlari - Byudjet va Dashboard
const toggleBudgetBtn = document.getElementById('toggleBudgetBtn');
const budgetEditPanel = document.getElementById('budgetEditPanel');
const monthlyBudgetInput = document.getElementById('monthlyBudgetInput');
const saveBudgetBtn = document.getElementById('saveBudgetBtn');
const cancelBudgetBtn = document.getElementById('cancelBudgetBtn');

const budgetAmountEl = document.getElementById('budgetAmount');
const budgetStatusEl = document.getElementById('budgetStatus');
const totalAmountEl = document.getElementById('totalAmount');
const totalCountEl = document.getElementById('totalCount');
const remainingStatBoxEl = document.getElementById('remainingStatBox');
const remainingLabelEl = document.getElementById('remainingLabel');
const remainingAmountEl = document.getElementById('remainingAmount');
const remainingStatusEl = document.getElementById('remainingStatus');

const progressBarFillEl = document.getElementById('progressBarFill');
const progressPercentageTextEl = document.getElementById('progressPercentageText');
const progressRemainingTextEl = document.getElementById('progressRemainingText');

// Asosiy ilova holati (State)
let expenses = [];
let monthlyBudget = 0;

/**
 * Raqamni so'm formatida chiroyli ko'rsatish (masalan: 125 000 so'm)
 */
function formatCurrency(amount) {
  const formatted = new Intl.NumberFormat('uz-UZ').format(Math.round(amount));
  return `${formatted} so'm`;
}

/**
 * Sana va vaqtni ixcham formatlash
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Joriy oyni ko'rsatish
 */
function updateCurrentMonthHeader() {
  if (!currentMonthYearEl) return;
  const now = new Date();
  const monthsUz = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
  ];
  currentMonthYearEl.textContent = `${monthsUz[now.getMonth()]} oyi xarajatlari`;
}

/**
 * Toast (bildirishnoma) chiqarish
 */
let toastTimeout;
function showToast(msg) {
  if (!toastMessage) return;
  toastMessage.textContent = msg;
  toastMessage.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastMessage.classList.remove('show');
  }, 2200);
}

/**
 * Tablarni almashtirish (Mobile Navigation)
 */
function switchTab(tabId) {
  tabPanes.forEach(pane => {
    pane.classList.remove('active');
  });

  navBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const activePane = document.getElementById(tabId);
  if (activePane) {
    activePane.classList.add('active');
  }

  // Sahifa tepasiga qaytarish
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Agar "Qo'shish" tabiga o'tsa, inputga avtomatik fokus qilish
  if (tabId === 'tab-add') {
    setTimeout(() => {
      expenseNameInput.focus();
    }, 150);
  }
}

/**
 * LocalStorage dan ma'lumotlarni o'qish
 */
function loadData() {
  // Xarajatlarni yuklash
  try {
    const data = localStorage.getItem(EXPENSES_STORAGE_KEY);
    expenses = data ? JSON.parse(data) : [];
    if (!Array.isArray(expenses)) {
      expenses = [];
    }
  } catch (error) {
    console.error("Xarajatlarni yuklashda xatolik:", error);
    expenses = [];
  }

  // Oylik byudjetni yuklash
  try {
    const savedBudget = localStorage.getItem(BUDGET_STORAGE_KEY);
    monthlyBudget = savedBudget ? parseFloat(savedBudget) : 0;
    if (isNaN(monthlyBudget) || monthlyBudget < 0) {
      monthlyBudget = 0;
    }
  } catch (error) {
    console.error("Byudjetni yuklashda xatolik:", error);
    monthlyBudget = 0;
  }
}

/**
 * Xarajatlarni LocalStorage ga saqlash
 */
function saveExpenses() {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error("Xarajatlarni saqlashda xatolik:", error);
  }
}

/**
 * Oylik byudjetni LocalStorage ga saqlash
 */
function saveBudget() {
  try {
    localStorage.setItem(BUDGET_STORAGE_KEY, monthlyBudget.toString());
  } catch (error) {
    console.error("Byudjetni saqlashda xatolik:", error);
  }
}

/**
 * Dashboard va Byudjet statistikasini yangilash
 */
function renderDashboard() {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const count = expenses.length;

  // Jami xarajat ko'rsatkichlari
  totalAmountEl.textContent = formatCurrency(total);
  totalCountEl.textContent = `${count} ta xarajat`;
  if (historyCountBadge) {
    historyCountBadge.textContent = `${count} ta yozuv`;
  }

  // Byudjet va qoldiq hisob-kitoblari
  if (monthlyBudget > 0) {
    budgetAmountEl.textContent = formatCurrency(monthlyBudget);
    budgetStatusEl.textContent = "Oylik reja";
    toggleBudgetBtn.textContent = "O'zgartirish";

    const diff = monthlyBudget - total;
    const spentPercent = (total / monthlyBudget) * 100;

    if (diff >= 0) {
      // Byudjet doirasida
      remainingStatBoxEl.className = 'stat-box success-box';
      remainingLabelEl.textContent = "Qoldiq";
      remainingAmountEl.textContent = formatCurrency(diff);
      remainingStatusEl.textContent = "Rejada";

      progressBarFillEl.style.width = `${Math.min(spentPercent, 100)}%`;
      progressBarFillEl.className = spentPercent >= 80 ? 'progress-fill warning' : 'progress-fill';
      progressPercentageTextEl.textContent = `Sarflanish: ${spentPercent.toFixed(1)}%`;
      progressRemainingTextEl.textContent = `${formatCurrency(diff)} qoldi`;
    } else {
      // Byudjetdan oshib ketdi
      const overspent = Math.abs(diff);
      remainingStatBoxEl.className = 'stat-box danger-box';
      remainingLabelEl.textContent = "Ortiqcha!";
      remainingAmountEl.textContent = `+${formatCurrency(overspent)}`;
      remainingStatusEl.textContent = "Limit buzildi";

      progressBarFillEl.style.width = '100%';
      progressBarFillEl.className = 'progress-fill danger';
      progressPercentageTextEl.textContent = `Sarflanish: ${spentPercent.toFixed(1)}%`;
      progressRemainingTextEl.textContent = `+${formatCurrency(overspent)} oshdi!`;
    }
  } else {
    // Byudjet hali belgilanmagan holat
    budgetAmountEl.textContent = "Belgilanmagan";
    budgetStatusEl.textContent = "Limit yo'q";
    toggleBudgetBtn.textContent = "Belgilash";

    remainingStatBoxEl.className = 'stat-box';
    remainingLabelEl.textContent = "Qoldiq";
    remainingAmountEl.textContent = "—";
    remainingStatusEl.textContent = "Belgilanmagan";

    progressBarFillEl.style.width = '0%';
    progressBarFillEl.className = 'progress-fill';
    progressPercentageTextEl.textContent = "Oylik byudjet yo'q";
    progressRemainingTextEl.textContent = "Limit kiritish uchun bosing";
  }

  // Kategoriyalar bo'yicha yig'indilarni hisoblash
  const categoryTotals = {};
  CATEGORIES.forEach(cat => {
    categoryTotals[cat] = 0;
  });

  expenses.forEach(item => {
    if (categoryTotals.hasOwnProperty(item.category)) {
      categoryTotals[item.category] += item.amount;
    } else {
      categoryTotals[item.category] = item.amount;
    }
  });

  // Kategoriya kartochkalarini chizish
  categoryGridEl.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const sum = categoryTotals[cat] || 0;
    const percentage = total > 0 ? ((sum / total) * 100).toFixed(1) : '0';

    const card = document.createElement('div');
    card.className = 'category-badge-card';
    card.innerHTML = `
      <span class="category-name">${escapeHtml(cat)}</span>
      <span class="category-sum">${formatCurrency(sum)}</span>
      <span class="category-percentage">${percentage}%</span>
    `;
    categoryGridEl.appendChild(card);
  });

  // "Barchasini tozalash" tugmasini ko'rsatish yoki yashirish
  if (count > 0) {
    clearAllBtn.style.display = 'inline-flex';
  } else {
    clearAllBtn.style.display = 'none';
  }
}

/**
 * Oxirgi xarajatlar qisqa ro'yxati (Bosh sahifa uchun)
 */
function renderRecentExpenses() {
  if (!recentExpenseListEl) return;
  recentExpenseListEl.innerHTML = '';

  const recentItems = expenses.slice(0, 3);
  if (recentItems.length === 0) {
    recentExpenseListEl.innerHTML = `
      <div class="empty-state" style="padding: 16px;">
        <div class="empty-state-title">Hozircha xarajat yo'q</div>
        <div class="empty-state-desc">"+" tugmasini bosib qo'shing.</div>
      </div>
    `;
    return;
  }

  recentItems.forEach(item => {
    const itemEl = createExpenseItemElement(item);
    recentExpenseListEl.appendChild(itemEl);
  });
}

/**
 * To'liq xarajatlar ro'yxatini render qilish (Tarix sahifasi)
 */
function renderExpenseList() {
  expenseListEl.innerHTML = '';

  if (expenses.length === 0) {
    expenseListEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-title">Xarajatlar tarixi bo'sh</div>
        <div class="empty-state-desc">Pastdagi "+" (Qo'shish) tugmasi orqali yangi xarajat kiriting.</div>
      </div>
    `;
    return;
  }

  expenses.forEach(item => {
    const itemEl = createExpenseItemElement(item);
    expenseListEl.appendChild(itemEl);
  });
}

/**
 * Xarajat elementi DOM tugunini yaratish
 */
function createExpenseItemElement(item) {
  const itemEl = document.createElement('div');
  itemEl.className = 'expense-item';
  itemEl.innerHTML = `
    <div class="expense-info">
      <div class="expense-title" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
      <div class="expense-meta">
        <span class="expense-category-tag">${escapeHtml(item.category)}</span>
        <span class="expense-date">${formatDate(item.timestamp)}</span>
      </div>
    </div>
    <div class="expense-action-group">
      <div class="expense-amount-tag">${formatCurrency(item.amount)}</div>
      <button 
        type="button" 
        class="btn-delete" 
        data-id="${item.id}"
        title="Ushbu xarajatni o'chirish"
      >
        O'chirish
      </button>
    </div>
  `;
  return itemEl;
}

/**
 * XSS xavfsizligi
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Yangi xarajat qo'shish
 */
function handleAddExpense(e) {
  e.preventDefault();

  const name = expenseNameInput.value.trim();
  const amount = parseFloat(expenseAmountInput.value);
  const category = expenseCategorySelect.value;

  if (!name) {
    alert("Iltimos, xarajat nomini kiriting.");
    expenseNameInput.focus();
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert("Iltimos, to'g'ri summa kiriting.");
    expenseAmountInput.focus();
    return;
  }

  if (!category) {
    alert("Iltimos, kategoriyani tanlang.");
    expenseCategorySelect.focus();
    return;
  }

  const newExpense = {
    id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name,
    amount,
    category,
    timestamp: Date.now()
  };

  expenses.unshift(newExpense);
  saveExpenses();

  // Interfeysni yangilash
  renderDashboard();
  renderRecentExpenses();
  renderExpenseList();

  // Formani tozalash
  expenseForm.reset();

  // Xabarnoma chiqarish va Bosh sahifaga o'tish
  showToast(`"${name}" muvaffaqiyatli qo'shildi!`);
  switchTab('tab-dashboard');
}

/**
 * Alohida xarajatni o'chirish
 */
function handleDeleteExpense(id) {
  const expenseToDelete = expenses.find(item => item.id === id);
  const itemName = expenseToDelete ? `"${expenseToDelete.name}"` : "ushbu";

  if (confirm(`${itemName} xarajatini o'chirasizmi?`)) {
    expenses = expenses.filter(item => item.id !== id);
    saveExpenses();
    renderDashboard();
    renderRecentExpenses();
    renderExpenseList();
    showToast("Xarajat o'chirildi");
  }
}

/**
 * Barcha xarajatlarni tozalash
 */
function handleClearAll() {
  if (expenses.length === 0) return;

  if (confirm("Haqiqatan ham barcha xarajatlar tarixini tozalaysizmi?")) {
    expenses = [];
    saveExpenses();
    renderDashboard();
    renderRecentExpenses();
    renderExpenseList();
    showToast("Barcha xarajatlar o'chirildi");
  }
}

/**
 * Byudjet panelini ochish yoki yopish
 */
function toggleBudgetPanel() {
  const isHidden = budgetEditPanel.style.display === 'none' || !budgetEditPanel.style.display;
  if (isHidden) {
    budgetEditPanel.style.display = 'block';
    monthlyBudgetInput.value = monthlyBudget > 0 ? monthlyBudget : '';
    monthlyBudgetInput.focus();
  } else {
    budgetEditPanel.style.display = 'none';
  }
}

/**
 * Yangi oylik byudjetni saqlash
 */
function handleSaveBudget() {
  const rawValue = monthlyBudgetInput.value.trim();

  if (rawValue === '') {
    monthlyBudget = 0;
  } else {
    const parsed = parseFloat(rawValue);
    if (isNaN(parsed) || parsed < 0) {
      alert("Iltimos, to'g'ri byudjet miqdorini kiriting.");
      monthlyBudgetInput.focus();
      return;
    }
    monthlyBudget = parsed;
  }

  saveBudget();
  budgetEditPanel.style.display = 'none';
  renderDashboard();
  showToast(monthlyBudget > 0 ? "Oylik byudjet saqlandi!" : "Byudjet bekor qilindi");
}

/**
 * Byudjet tahrirlashni bekor qilish
 */
function handleCancelBudget() {
  budgetEditPanel.style.display = 'none';
}

// ==========================================================
// Hodisalarni tinglash (Event Listeners)
// ==========================================================

// Navigatsiya tugmalari (Bottom Nav)
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.getAttribute('data-tab');
    if (targetTab) {
      switchTab(targetTab);
    }
  });
});

// Tezkor havolalar
if (goToHistoryLink) {
  goToHistoryLink.addEventListener('click', () => {
    switchTab('tab-history');
  });
}

if (quickBudgetBtn) {
  quickBudgetBtn.addEventListener('click', () => {
    switchTab('tab-dashboard');
    toggleBudgetPanel();
  });
}

// Xarajat formasi
expenseForm.addEventListener('submit', handleAddExpense);

// Byudjet boshqaruvi
toggleBudgetBtn.addEventListener('click', toggleBudgetPanel);
saveBudgetBtn.addEventListener('click', handleSaveBudget);
cancelBudgetBtn.addEventListener('click', handleCancelBudget);

monthlyBudgetInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleSaveBudget();
  } else if (e.key === 'Escape') {
    handleCancelBudget();
  }
});

// O'chirish tugmalari uchun event delegation (ikkala ro'yxat uchun)
document.addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('.btn-delete');
  if (deleteBtn) {
    const id = deleteBtn.getAttribute('data-id');
    if (id) {
      handleDeleteExpense(id);
    }
  }
});

clearAllBtn.addEventListener('click', handleClearAll);

// Ilovani ishga tushirish (Init)
function init() {
  loadData();
  updateCurrentMonthHeader();
  renderDashboard();
  renderRecentExpenses();
  renderExpenseList();
}

init();
