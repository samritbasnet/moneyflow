class Transaction {
  constructor(amount, type, category, date, description) {
    this.amount = amount;
    this.type = type;
    this.category = category;
    this.date = date;
    this.description = description;
    this.id = Date.now();
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
  getDate() {}
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
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 HTML loaded, starting MoneyFlow App...");
  new MoneyFlowApp();
});
