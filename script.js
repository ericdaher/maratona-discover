const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },
  set(transactions) {
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transactions)
    );
  },
};

const Modal = {
  toggle() {
    document.querySelector(".modal-overlay").classList.toggle("active");
  },
};

const transactions = [
  {
    description: "Luz",
    amount: -50000,
    date: "23/01/2021",
  },
  {
    description: "Criação website",
    amount: 500000,
    date: "23/01/2021",
  },
  {
    description: "Internet",
    amount: -20000,
    date: "23/01/2021",
  },
];

const Transaction = {
  all: Storage.get(),
  add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },
  remove(index) {
    Transaction.all.splice(index, 1);
    App.reload();
  },
  incomes() {
    return Transaction.all
      .filter((t) => t.amount > 0)
      .map((t) => t.amount)
      .reduce((acc, t) => acc + t, 0);
  },
  expenses() {
    return Transaction.all
      .filter((t) => t.amount < 0)
      .map((t) => t.amount)
      .reduce((acc, t) => acc + t, 0);
  },
  total() {
    return Transaction.all.map((t) => t.amount).reduce((acc, t) => acc + t, 0);
  },
};

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),
  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = this.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;
    DOM.transactionsContainer.appendChild(tr);
  },
  innerHTMLTransaction(transaction, index) {
    const cssClass = transaction.amount > 0 ? "income" : "expense";

    const html = `
        <td class="description">${transaction.description}</td>
        <td class="${cssClass}">${Utils.formatCurrency(transaction.amount)}</td>
        <td class="date">${transaction.date}</td>
        <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" /></td>
      `;

    return html;
  },
  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    );
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    );
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    );
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const Utils = {
  formatAmount(value) {
    value = value * 100;
    return Math.round(value);
  },
  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";
    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),
  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },
  formatValues() {
    let { description, amount, date } = Form.getValues();
    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);
    return {
      description,
      amount,
      date,
    };
  },
  validateFields() {
    const { description, amount, date } = Form.getValues();
    if (
      !description.trim().length ||
      !amount.trim().length ||
      !date.trim().length
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },
  saveTransaction(transaction) {
    Transaction.add(transaction);
  },
  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },
  submit(event) {
    event.preventDefault();

    try {
      Form.validateFields();
      const transaction = Form.formatValues();
      Form.saveTransaction(transaction);
      Form.clearFields();
      Modal.toggle();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach((t, index) => {
      DOM.addTransaction(t, index);
    });

    DOM.updateBalance();
    Storage.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
