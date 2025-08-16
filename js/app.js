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
  }

  setupEventListeners() {
    console.log("🎧 Setting up event listeners...");

    const form = document.getElementById("transactionForm");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmission();
    });
  }

  handleFormSubmission() {
    console.log("Form submitted");
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

    // Update the UI
    this.updateStats();
    this.updateTransactionTable();
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

    this.updateStats();
    this.updateTransactionTable();

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
      const raw = localStorage.getItem("STORAGE_KEY");
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
}
let app;
document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 HTML loaded, starting MoneyFlow App...");
  app = new MoneyFlowApp();
});
