// Quotes array
let quotes = [
  { text: "Life is a circle", category: "Philosophy" },
  { text: "Code is poetry", category: "Programming" },
  { text: "Persistence beats resistance", category: "Motivation" }
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuote");
const categoryFilter = document.getElementById("categoryFilter");

// Show a random quote
function showRandomQuote() {
  let filteredQuotes = quotes;

  // Apply category filter
  const selectedCategory = categoryFilter.value;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    quoteDisplay.innerHTML = `"${quote.text}" — <em>${quote.category}</em>`;
  } else {
    quoteDisplay.innerHTML = "No quotes available in this category.";
  }
}

// Add a new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);

    // Update category filter dynamically
    if (![...categoryFilter.options].some(opt => opt.value === category)) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    }

    alert("Quote added successfully!");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please enter both quote and category.");
  }
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
