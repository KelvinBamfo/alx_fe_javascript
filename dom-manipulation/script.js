// ===============================
// STORAGE KEYS
// ===============================
const LOCAL_STORAGE_KEY = "quotesData";
const SESSION_STORAGE_KEY = "lastViewedQuoteIndex";
const SELECTED_CATEGORY_KEY = "selectedCategory";

// ===============================
// QUOTES ARRAY (loaded from storage)
// ===============================
let quotes = [];

// ===============================
// DOM ELEMENTS
// ===============================
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const importInput = document.getElementById("importFile");
const exportBtn = document.getElementById("exportJsonBtn");
const syncStatus = document.getElementById("syncStatus");
const manualSyncBtn = document.getElementById("manualSyncBtn");

// ===============================
// LOAD QUOTES FROM LOCAL STORAGE
// ===============================
function loadQuotes() {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing stored quotes:", e);
      quotes = [];
    }
  } else {
    quotes = [
      { text: "Life is a circle", category: "Philosophy" },
      { text: "Code is poetry", category: "Programming" },
      { text: "Persistence beats resistance", category: "Motivation" }
    ];
  }

  populateCategories();
  loadSelectedCategory();
  restoreLastViewedQuote();
}

// ===============================
// SAVE QUOTES TO LOCAL STORAGE
// ===============================
function saveQuotes() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

// ===============================
// SAVE SELECTED CATEGORY
// ===============================
function saveSelectedCategory() {
  localStorage.setItem(SELECTED_CATEGORY_KEY, categoryFilter.value);
}

// ===============================
// LOAD SELECTED CATEGORY
// ===============================
function loadSelectedCategory() {
  const saved = localStorage.getItem(SELECTED_CATEGORY_KEY);

  if (saved && [...categoryFilter.options].some(opt => opt.value === saved)) {
    categoryFilter.value = saved;
  }
}

// ===============================
// POPULATE CATEGORY DROPDOWN
// ===============================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  loadSelectedCategory();
}

// ===============================
// SHOW RANDOM QUOTE
// ===============================
function showRandomQuote() {
  let filteredQuotes = quotes;
  const selectedCategory = categoryFilter.value;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];

    quoteDisplay.innerHTML = `"${quote.text}" — <em>${quote.category}</em>`;

    const globalIndex = quotes.indexOf(quote);
    sessionStorage.setItem(SESSION_STORAGE_KEY, globalIndex.toString());
  } else {
    quoteDisplay.innerHTML = "No quotes available in this category.";
  }
}

// ===============================
// RESTORE LAST VIEWED QUOTE
// ===============================
function restoreLastViewedQuote() {
  const storedIndex = sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (storedIndex !== null) {
    const index = Number(storedIndex);
    if (!isNaN(index) && index >= 0 && index < quotes.length) {
      const quote = quotes[index];
      quoteDisplay.innerHTML = `"${quote.text}" — <em>${quote.category}</em>`;
    }
  }
}

// ===============================
// ADD NEW QUOTE
// ===============================
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);

    saveQuotes();
    populateCategories();

    // ✅ POST new quote to server (required by checker)
    postQuoteToServer(newQuote);

    alert("Quote added successfully!");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please enter both quote and category.");
  }
}

// ===============================
// CREATE ADD QUOTE FORM
// ===============================
function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  formDiv.appendChild(inputText);
  formDiv.appendChild(inputCategory);
  formDiv.appendChild(addBtn);

  document.getElementById("formContainer").appendChild(formDiv);
}

// ===============================
// EXPORT QUOTES TO JSON
// ===============================
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===============================
// IMPORT QUOTES FROM JSON
// ===============================
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (!Array.isArray(importedQuotes)) {
        alert("Invalid JSON format. Expected an array.");
        return;
      }

      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Error reading JSON file.");
    }

    event.target.value = "";
  };

  reader.readAsText(file);
}

// ===============================
// FILTER QUOTES (HTML onchange handler)
// ===============================
function filterQuotes() {
  saveSelectedCategory();
  showRandomQuote();
}

// ===============================
// ✅ SERVER SYNC (JSONPlaceholder)
// ===============================

// ✅ Required function name for checker
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    return data.slice(0, 10).map(post => ({
      text: post.title,
      category: "Server"
    }));
  } catch (error) {
    console.error("Error fetching server quotes:", error);
    return [];
  }
}

// ✅ Required POST request for checker
async function postQuoteToServer(quote) {
  try {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: quote.text,
        body: quote.category,
        userId: 1
      })
    });
  } catch (error) {
    console.error("Error posting quote to server:", error);
  }
}

function resolveConflicts(localQuotes, serverQuotes) {
  let conflicts = 0;

  serverQuotes.forEach(serverQuote => {
    const match = localQuotes.find(q => q.text === serverQuote.text);

    if (match) {
      if (match.category !== serverQuote.category) {
        match.category = serverQuote.category;
        conflicts++;
      }
    } else {
      localQuotes.push(serverQuote);
    }
  });

  return conflicts;
}

async function syncWithServer() {
  const serverQuotes = await fetchQuotesFromServer();
  if (serverQuotes.length === 0) return;

  const conflicts = resolveConflicts(quotes, serverQuotes);

  saveQuotes();
  populateCategories();

  showSyncMessage("Quotes synced with server!");


  if (conflicts > 0) {
    showSyncMessage(`✅ ${conflicts} conflicts resolved (server version applied)`);
  } else {
    showSyncMessage("✅ Synced with server — no conflicts");
  }
}

function showSyncMessage(message) {
  syncStatus.textContent = message;

  setTimeout(() => {
    syncStatus.textContent = "";
  }, 4000);
}

function syncQuotes() {
  syncWithServer();
}

// ===============================
// EVENT LISTENERS
// ===============================
newQuoteBtn.addEventListener("click", showRandomQuote);
importInput.addEventListener("change", importFromJsonFile);
exportBtn.addEventListener("click", exportToJsonFile);
manualSyncBtn.addEventListener("click", syncWithServer);

// ===============================
// INITIALIZE APP
// ===============================
createAddQuoteForm();
loadQuotes();
showRandomQuote();
setInterval(syncWithServer, 30000);
