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
    this.updateStats();
    this.updateTransactionTable();
    this.initializeChart();
  }

  setupEventListeners() {
    const form = document.getElementById("transactionForm");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmission();
    });
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

  // 📊 STEP 1: Get data for expense chart (simple version)
  prepareExpenseChartData() {
    // Create empty arrays to store our chart data
    const categories = []; // Names like "Food", "Bills"
    const amounts = []; // Money amounts like 50, 100
    const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];

    // Step 1: Find all expense transactions
    const expenses = this.transactions.filter((t) => t.type === "expense");

    // Step 2: Get unique categories
    expenses.forEach((transaction) => {
      if (!categories.includes(transaction.category)) {
        categories.push(transaction.category);
      }
    });

    // Step 3: Calculate total for each category
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

  // 📊 STEP 2: Get income vs expense data (simple version)
  prepareIncomeVsExpenseData() {
    // Calculate total income (simple way)
    let totalIncome = 0;
    this.transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        totalIncome = totalIncome + transaction.amount;
      }
    });

    // Calculate total expenses (simple way)
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

  initializeChart() {
    this.initializeCategoryChart();
    this.initializeMonthlyChart();
  }

  // 🍩 STEP 3: Create the pie chart (simple version)
  initializeCategoryChart() {
    // Step 1: Get the canvas element where chart will show
    const canvas = document.getElementById("categoryChart");
    const ctx = canvas.getContext("2d");

    // Step 2: Get our prepared data
    const chartData = this.prepareExpenseChartData();

    // Step 3: Create the chart with basic settings
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
          },
        },
      },
    });
  }

  // 📊 STEP 4: Create the bar chart (simple version)
  initializeMonthlyChart() {
    // Step 1: Get the canvas element
    const canvas = document.getElementById("monthlyChart");
    const ctx = canvas.getContext("2d");

    // Step 2: Get our prepared data
    const chartData = this.prepareIncomeVsExpenseData();

    // Step 3: Create the bar chart with basic settings
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
          y: {
            beginAtZero: true, // Start chart at $0
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

  // 🔄 STEP 5: Update charts when data changes (simple version)
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
  }
}

let app;
document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 HTML loaded, starting MoneyFlow App...");
  app = new MoneyFlowApp();
});
