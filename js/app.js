const STORAGE_KEY = "moneyflow-transactions-v1";
class Transaction {
  constructor(amount, type, category, date, description) {
    this.amount = parseFloat(amount);
    this.type = type;
    this.category = category;
    this.date = new Date(date);
    this.description = description;
    this.id = Date.now() + Math.random();
  }

  formatAmount() {
    return `$${this.amount.toFixed(2)}`;
  }
  isIncome() {
    return this.type === "income";
  }
  isExpense() {
    return this.type === "expense";
  }
  formatDate() {
    return this.date.toLocaleDateString();
  }
  getCategory() {
    return this.category;
  }
}

class MoneyFlowApp {
  constructor() {
    this.transactions = [];
    this.init();
  }

  init() {
    console.log("🚀 MoneyFlow App starting...");
    this.setupEventListeners();
    this.loadFromStorage();
    this.loadTheme(); // 🌙 Load saved theme
    this.updateStats();
    this.updateTransactionTable();
    this.initializeChart();
  }

  setupEventListeners() {
    console.log("🎧 Setting up event listeners...");

    // Form submission listener
    const form = document.getElementById("transactionForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmission();
    });

    // 🌙 Theme toggle listener (NEW!)
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        this.toggleTheme();
      });
    }
  }

  handleFormSubmission() {
    const typeSelect = document.getElementById("transactionType");
    const amountInput = document.getElementById("transactionAmount");
    const categorySelect = document.getElementById("transactionCategory");
    const dateInput = document.getElementById("transactionDate");
    const descriptionInput = document.getElementById("transactionDescription");

    const type = typeSelect.value;
    const amount = amountInput.value;
    const category = categorySelect.value;
    const date = dateInput.value;
    const description = descriptionInput.value;

    if (!type || !amount || !category || !date || !description) {
      alert("Please fill in all fields");
      return;
    }

    const newTransaction = new Transaction(
      amount,
      type,
      category,
      date,
      description
    );
    this.transactions.push(newTransaction);
    alert("Transaction added successfully");
    document.getElementById("transactionForm").reset();
    console.log("All transactions", this.transactions);

    this.saveToStorage();
    this.updateStats();
    this.updateTransactionTable();
    this.updateCharts();
  }

  updateStats() {
    const totalIncome = this.transactions
      .filter((t) => t.isIncome())
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = this.transactions
      .filter((t) => t.isExpense())
      .reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpenses;

    document.getElementById(
      "totalBalance"
    ).textContent = `$${netSavings.toFixed(2)}`;
    document.getElementById(
      "totalIncome"
    ).textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById(
      "totalExpenses"
    ).textContent = `$${totalExpenses.toFixed(2)}`;
    document.getElementById("netSavings").textContent = `$${netSavings.toFixed(
      2
    )}`;
  }

  updateTransactionTable() {
    const tableBody = document.querySelector("#transactionTable tbody");

    tableBody.innerHTML = "";

    this.transactions.forEach((transaction) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${transaction.formatDate()}</td>
        <td>
          <span class="transaction-type ${transaction.type}">
            ${transaction.type === "income" ? "📈" : "📉"} ${transaction.type}
          </span>
        </td>
        <td>${transaction.category}</td>
        <td class="${transaction.isIncome() ? "text-success" : "text-danger"}">
          ${transaction.isIncome() ? "+" : "-"}${transaction.formatAmount()}
        </td>
        <td>${transaction.description}</td>
        <td>
          <button class="btn btn-sm" onclick="app.deleteTransaction('${
            transaction.id
          }')">🗑️</button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  deleteTransaction(id) {
    console.log("Trying to delete ID:", id, "Type:", typeof id);
    console.log(
      "Available IDs:",
      this.transactions.map((t) => ({ id: t.id, type: typeof t.id }))
    );

    const numericId = parseFloat(id);

    this.transactions = this.transactions.filter((t) => {
      console.log(
        "Comparing:",
        t.id,
        "!==",
        numericId,
        "Result:",
        t.id !== numericId
      );
      return t.id !== numericId;
    });
    this.saveToStorage();
    this.updateStats();
    this.updateTransactionTable();
    this.updateCharts();

    alert("Transaction deleted successfully!");
  }
  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.transactions));
    } catch (err) {
      console.error("Failed to save transactions", err);
    }
  }
  loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      this.transactions = parsed.map(
        (t) =>
          new Transaction(t.amount, t.type, t.category, t.date, t.description)
      );
      this.transactions.forEach((tx, idx) => {
        const original = parsed[idx];
        if (original && original.id != null) {
          tx.id = original.id;
        }
      });
    } catch (err) {
      console.error("Failed to load transactions", err);
    }
  }
  prepareChartData() {
    const labels = [];
    const data = [];

    this.transactions.forEach((t) => {
      if (!labels.includes(t.category)) {
        labels.push(t.category);
      }
    });

    labels.forEach((category) => {
      const total = this.transactions
        .filter((t) => t.category === category)
        .reduce((sum, t) => sum + t.amount, 0);
      data.push(total);
    });

    return { labels, data };
  }

  // 📊 Get data for expense chart
  prepareExpenseChartData() {
    // Create empty arrays to store our chart data
    const categories = []; // Names like "Food", "Bills"
    const amounts = []; // Money amounts like 50, 100
    const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];

    // Find all expense transactions
    const expenses = this.transactions.filter((t) => t.type === "expense");

    // Get unique categories
    expenses.forEach((transaction) => {
      if (!categories.includes(transaction.category)) {
        categories.push(transaction.category);
      }
    });

    // Calculate total for each category
    categories.forEach((category) => {
      let total = 0;

      // Add up all expenses in this category
      expenses.forEach((transaction) => {
        if (transaction.category === category) {
          total = total + transaction.amount;
        }
      });

      amounts.push(total);
    });

    return {
      labels: categories,
      data: amounts,
      colors: colors,
    };
  }

  // 📊 Get income vs expense data
  prepareIncomeVsExpenseData() {
    // Calculate total income
    let totalIncome = 0;
    this.transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome = totalIncome + transaction.amount;
      }
    });

    // Calculate total expenses
    let totalExpenses = 0;
    this.transactions.forEach((transaction) => {
      if (transaction.type === "expense") {
        totalExpenses = totalExpenses + transaction.amount;
      }
    });

    return {
      labels: ["Income", "Expenses"],
      data: [totalIncome, totalExpenses],
      colors: ["#4CAF50", "#F44336"],
    };
  }

  prepareExpenseTrendData() {
    const months = [];
    const expenseData = [];

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(monthNames[date.getMonth()]);
    }

    months.forEach((month, index) => {
      const monthDate = new Date(
        today.getFullYear(),
        today.getMonth() - (5 - index),
        1
      );
      let monthExpenses = 0;

      this.transactions.forEach((transaction) => {
        if (transaction.type === "expense") {
          const transactionDate = new Date(transaction.date);
          if (
            transactionDate.getMonth() === monthDate.getMonth() &&
            transactionDate.getFullYear() === monthDate.getFullYear()
          ) {
            monthExpenses += transaction.amount;
          }
        }
      });

      expenseData.push(monthExpenses);
    });

    return {
      labels: months,
      data: expenseData,
      borderColor: "#ef4444",
      backgroundColor: "rgba(239, 68, 68, 0.1)",
    };
  }

  prepareSavingsProgressData() {
    let totalIncome = 0;
    let totalExpenses = 0;

    this.transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome += transaction.amount;
      } else if (transaction.type === "expense") {
        totalExpenses += transaction.amount;
      }
    });

    const savings = totalIncome - totalExpenses;
    const savingsGoal = 5000;
    const progress = Math.min((savings / savingsGoal) * 100, 100);

    return {
      labels: ["Saved", "Remaining"],
      data: [savings, Math.max(savingsGoal - savings, 0)],
      colors: ["#059669", "#e5e7eb"],
      progress: progress,
    };
  }

  getChartTextColor() {
    const isDarkMode =
      document.documentElement.getAttribute("data-theme") === "dark";
    return isDarkMode ? "#ffffff" : "#374151";
  }

  getChartGridColor() {
    const isDarkMode =
      document.documentElement.getAttribute("data-theme") === "dark";
    return isDarkMode ? "#374151" : "#e5e7eb"; //
  }

  initializeChart() {
    this.initializeCategoryChart();
    this.initializeMonthlyChart();
    this.initializeExpenseTrendChart();
    this.initializeSavingsChart();
  }

  // 🍩 Create the pie chart
  initializeCategoryChart() {
    // Get the canvas element and prepare data
    const canvas = document.getElementById("categoryChart");
    const ctx = canvas.getContext("2d");
    const chartData = this.prepareExpenseChartData();
    const textColor = this.getChartTextColor();
    this.categoryChart = new Chart(ctx, {
      type: "doughnut", // This makes a donut/pie chart
      data: {
        labels: chartData.labels, // Category names like "Food", "Bills"
        datasets: [
          {
            label: "Expenses by Category",
            data: chartData.data, // Money amounts like [50, 100, 75]
            backgroundColor: chartData.colors, // Colors for each slice
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: textColor, // Theme-aware text color
            },
          },
        },
      },
    });
  }

  // 📊 Create the bar chart
  initializeMonthlyChart() {
    // Get the canvas element and prepare data
    const canvas = document.getElementById("monthlyChart");
    const ctx = canvas.getContext("2d");
    const chartData = this.prepareIncomeVsExpenseData();
    const textColor = this.getChartTextColor();
    const gridColor = this.getChartGridColor();
    this.monthlyChart = new Chart(ctx, {
      type: "bar", // This makes a bar chart
      data: {
        labels: chartData.labels, // ["Income", "Expenses"]
        datasets: [
          {
            label: "Amount ($)",
            data: chartData.data, // [totalIncome, totalExpenses]
            backgroundColor: chartData.colors, // Green for income, red for expenses
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            ticks: {
              color: textColor, // Theme-aware axis text
            },
            grid: {
              color: gridColor, // Theme-aware grid lines
            },
          },
          y: {
            beginAtZero: true, // Start chart at $0
            ticks: {
              color: textColor, // Theme-aware axis text
            },
            grid: {
              color: gridColor, // Theme-aware grid lines
            },
          },
        },
        plugins: {
          legend: {
            display: false, // Hide the legend
          },
        },
      },
    });
  }

  // 📈 Create expense trend line chart
  initializeExpenseTrendChart() {
    // Get the canvas element and prepare data
    const canvas = document.getElementById("expenseChart");
    const ctx = canvas.getContext("2d");
    const chartData = this.prepareExpenseTrendData();
    const textColor = this.getChartTextColor();
    const gridColor = this.getChartGridColor();
    this.expenseChart = new Chart(ctx, {
      type: "line", // This makes a line chart
      data: {
        labels: chartData.labels, // Month names
        datasets: [
          {
            label: "Monthly Expenses ($)",
            data: chartData.data, // Expense amounts per month
            borderColor: chartData.borderColor, // Red line
            backgroundColor: chartData.backgroundColor, // Light red fill
            borderWidth: 3,
            fill: true, // Fill area under line
            tension: 0.4, // Smooth line curves
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            ticks: {
              color: textColor, // Theme-aware axis text
            },
            grid: {
              color: gridColor, // Theme-aware grid lines
            },
          },
          y: {
            beginAtZero: true, // Start chart at $0
            ticks: {
              color: textColor, // Theme-aware axis text
            },
            grid: {
              color: gridColor, // Theme-aware grid lines
            },
          },
        },
        plugins: {
          legend: {
            display: false, // Hide the legend
          },
        },
      },
    });
  }

  // 💰 Create savings progress chart
  initializeSavingsChart() {
    // Get the canvas element and prepare data
    const canvas = document.getElementById("savingsChart");
    const ctx = canvas.getContext("2d");
    const chartData = this.prepareSavingsProgressData();
    const textColor = this.getChartTextColor();
    this.savingsChart = new Chart(ctx, {
      type: "doughnut", // This makes a donut chart for progress
      data: {
        labels: chartData.labels, // ["Saved", "Remaining"]
        datasets: [
          {
            label: "Savings Progress",
            data: chartData.data, // [saved amount, remaining amount]
            backgroundColor: chartData.colors, // Green for saved, gray for remaining
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "70%", // Makes the donut hole bigger for progress look
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: textColor, // Theme-aware text color
            },
          },
        },
      },
    });
  }

  // 🔄 Update charts when data changes
  updateCharts() {
    // If no transactions, don't update charts
    if (this.transactions.length === 0) {
      return;
    }

    // Update the pie chart
    if (this.categoryChart) {
      // Get fresh data
      const newData = this.prepareExpenseChartData();

      // Put new data into the chart
      this.categoryChart.data.labels = newData.labels;
      this.categoryChart.data.datasets[0].data = newData.data;
      this.categoryChart.data.datasets[0].backgroundColor = newData.colors;

      // Tell the chart to redraw
      this.categoryChart.update();
    }

    // Update the bar chart
    if (this.monthlyChart) {
      // Get fresh data
      const newData = this.prepareIncomeVsExpenseData();

      // Put new data into the chart
      this.monthlyChart.data.labels = newData.labels;
      this.monthlyChart.data.datasets[0].data = newData.data;
      this.monthlyChart.data.datasets[0].backgroundColor = newData.colors;

      // Tell the chart to redraw
      this.monthlyChart.update();
    }

    // Update the new charts too
    if (this.expenseChart) {
      const expenseData = this.prepareExpenseTrendData();
      this.expenseChart.data.labels = expenseData.labels;
      this.expenseChart.data.datasets[0].data = expenseData.data;
      this.expenseChart.update();
    }

    if (this.savingsChart) {
      const savingsData = this.prepareSavingsProgressData();
      this.savingsChart.data.labels = savingsData.labels;
      this.savingsChart.data.datasets[0].data = savingsData.data;
      this.savingsChart.data.datasets[0].backgroundColor = savingsData.colors;
      this.savingsChart.update();
    }
  }

  // 🎨 UPDATE CHARTS THEME (when switching dark/light mode)
  updateChartsTheme() {
    const textColor = this.getChartTextColor();
    const gridColor = this.getChartGridColor();

    // Update category chart theme
    if (this.categoryChart) {
      this.categoryChart.options.plugins.legend.labels.color = textColor;
      this.categoryChart.update();
    }

    // Update monthly chart theme
    if (this.monthlyChart) {
      this.monthlyChart.options.scales.x.ticks.color = textColor;
      this.monthlyChart.options.scales.x.grid.color = gridColor;
      this.monthlyChart.options.scales.y.ticks.color = textColor;
      this.monthlyChart.options.scales.y.grid.color = gridColor;
      this.monthlyChart.update();
    }

    // Update expense chart theme
    if (this.expenseChart) {
      this.expenseChart.options.scales.x.ticks.color = textColor;
      this.expenseChart.options.scales.x.grid.color = gridColor;
      this.expenseChart.options.scales.y.ticks.color = textColor;
      this.expenseChart.options.scales.y.grid.color = gridColor;
      this.expenseChart.update();
    }

    // Update savings chart theme
    if (this.savingsChart) {
      this.savingsChart.options.plugins.legend.labels.color = textColor;
      this.savingsChart.update();
    }
  }

  // 🌙 THEME METHODS

  // Load theme from browser storage
  loadTheme() {
    // Get saved theme from localStorage (like a browser cookie)
    const savedTheme = localStorage.getItem("moneyflow-theme");

    // If no saved theme, use light mode as default
    const theme = savedTheme || "light";

    // Apply the theme
    this.applyTheme(theme);

    console.log(`🌙 Loaded theme: ${theme}`);
  }

  // Switch between light and dark mode
  toggleTheme() {
    // Get current theme from the HTML
    const currentTheme = document.documentElement.getAttribute("data-theme");

    // Switch to opposite theme
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    // Apply the new theme
    this.applyTheme(newTheme);

    console.log(`🌙 Switched to ${newTheme} mode`);
  }

  // Apply theme to the webpage
  applyTheme(theme) {
    // Set the theme on the HTML element
    document.documentElement.setAttribute("data-theme", theme);

    // Save theme to localStorage so it remembers next time
    localStorage.setItem("moneyflow-theme", theme);

    this.updateThemeIcon(theme);

    this.updateChartsTheme();
  }

  updateThemeIcon(theme) {
    const themeIcon = document.querySelector(".theme-icon");

    if (themeIcon) {
      themeIcon.textContent = theme === "light" ? "🌙" : "☀️";
    }
  }
}

let app;
document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 HTML loaded, starting MoneyFlow App...");
  app = new MoneyFlowApp();
});
