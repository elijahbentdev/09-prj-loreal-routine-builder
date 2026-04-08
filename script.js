const WORKER_URL = "https://gcabot2.elijah-bent.workers.dev";
const STORAGE_KEY = "loreal_selected_ids";
const SYSTEM_PROMPT = `You are a luxury beauty advisor for L'Oréal and its family of brands (CeraVe, La Roche-Posay, Garnier, L'Oréal Paris, Lancôme, Kérastase, etc.). 

Your role is to:
1. Create personalized, step-by-step skincare, haircare, and beauty routines using ONLY the products the user has selected
2. Explain WHY each product is used at that step (key ingredients, benefits)
3. Specify AM vs PM usage where relevant
4. Give professional-sounding but approachable advice
5. For follow-up questions, ONLY answer questions about the generated routine, skincare, haircare, makeup, fragrance, or beauty topics. Politely redirect off-topic questions.
6. Format routines using clear steps with emojis for visual appeal (e.g., ☀️ Morning Routine, 🌙 Evening Routine, Step 1:, Step 2:, etc.)
7. Keep responses concise but thorough — under 400 words for routine generation, under 200 words for follow-ups.

Important: Always ground your routine in the specific products selected. Never recommend products not in the user's selection. Be warm, encouraging, and expert.`;

/* DOM Elements */
const categoryFilter = document.getElementById("categoryFilter");
const productSearch = document.getElementById("productSearch");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateRoutineBtn = document.getElementById("generateRoutine");
const clearAllBtn = document.getElementById("clearAllSelections");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const rtlToggleBtn = document.getElementById("rtlToggle");
const webSearchToggleBtn = document.getElementById("webSearchToggle");

/* State Variables */
let allProducts = [];
let selectedIds = new Set();
let conversationHistory = [];
let searchDebounceTimeout = null;
let useWebSearch = false;

/* --- Local Storage Persistence --- */
function saveSelections() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...selectedIds]));
}

function loadSelections() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  } catch {
    return new Set();
  }
}

/* --- Initialization --- */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

async function init() {
  allProducts = await loadProducts();
  selectedIds = loadSelections();

  // RTL initialization
  if (localStorage.getItem("loreal_rtl") === "rtl") {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  }

  restoreChips();
  renderProducts(); // Initial empty state or default render based on empty filters
}

/* --- Rendering Products --- */
function getFilteredProducts(category, searchTerm) {
  return allProducts.filter((p) => {
    const matchCat = !category || p.category === category;
    const matchSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });
}

function renderProducts() {
  const category = categoryFilter.value;
  const searchTerm = productSearch.value.trim();

  if (!category && !searchTerm) {
    productsContainer.innerHTML = `<div class="placeholder-message">Select a category or search for products</div>`;
    return;
  }

  const filteredProducts = getFilteredProducts(category, searchTerm);

  if (filteredProducts.length === 0) {
    productsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-face-meh"></i>
        <p>No products match your search.</p>
      </div>`;
    return;
  }

  productsContainer.innerHTML = filteredProducts
    .map((product) => {
      const isSelected = selectedIds.has(product.id);
      return `
      <div class="product-card" data-id="${product.id}" data-selected="${isSelected}">
        <div class="product-img-wrapper">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <button class="desc-toggle-btn" aria-label="Show description">
            <i class="fa-solid fa-circle-info"></i>
          </button>
          <div class="product-desc-overlay" role="tooltip" aria-hidden="true">
            <p>${product.description}</p>
          </div>
        </div>
        <div class="product-info">
          <span class="product-brand">${product.brand}</span>
          <h3 class="product-name">${product.name}</h3>
          <span class="product-category-tag">${product.category}</span>
        </div>
        <div class="card-select-indicator">
          <i class="fa-solid fa-check"></i>
        </div>
      </div>
    `;
    })
    .join("");
}

/* --- Listeners for Filtering --- */
categoryFilter.addEventListener("change", () => {
  productSearch.value = ""; // Clear search when category changes
  renderProducts();
});

productSearch.addEventListener("input", () => {
  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    renderProducts();
  }, 150);
});

/* --- Interactions: Cards and Overlays --- */
productsContainer.addEventListener("click", (e) => {
  const card = e.target.closest(".product-card");
  if (!card) return;

  const infoBtn = e.target.closest(".desc-toggle-btn");
  if (infoBtn) {
    e.stopPropagation(); // prevent card selection
    const overlay = card.querySelector(".product-desc-overlay");
    overlay.classList.toggle("visible");
    const isVisible = overlay.classList.contains("visible");
    overlay.setAttribute("aria-hidden", !isVisible);
    return;
  }

  // Toggle selection
  const productId = parseInt(card.dataset.id, 10);
  const isSelected = card.dataset.selected === "true";

  if (isSelected) {
    selectedIds.delete(productId);
    card.dataset.selected = "false";
  } else {
    selectedIds.add(productId);
    card.dataset.selected = "true";
  }

  saveSelections();
  restoreChips();
});

/* --- Chips Management --- */
function restoreChips() {
  if (selectedIds.size === 0) {
    selectedProductsList.innerHTML = `
      <p class="no-selection-msg">
        <i class="fa-regular fa-hand-pointer"></i> 
        Click products above to add them to your routine.
      </p>
    `;
    clearAllBtn.style.display = "none";
    return;
  }

  const selectedProducts = allProducts.filter((p) => selectedIds.has(p.id));

  selectedProductsList.innerHTML = selectedProducts
    .map(
      (p) => `
    <div class="selected-chip" data-id="${p.id}">
      <img src="${p.image}" alt="${p.name}" />
      <span>${p.name}</span>
      <button class="remove-chip-btn" aria-label="Remove product">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  `,
    )
    .join("");

  clearAllBtn.style.display = "inline-block";
}

selectedProductsList.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".remove-chip-btn");
  if (!removeBtn) return;

  const chip = removeBtn.closest(".selected-chip");
  const productId = parseInt(chip.dataset.id, 10);

  selectedIds.delete(productId);
  saveSelections();
  restoreChips();

  // Re-render UI to update card styling if it's currently visible
  renderProducts();
});

clearAllBtn.addEventListener("click", () => {
  selectedIds.clear();
  saveSelections();
  restoreChips();
  renderProducts(); // Update visual state of all cards
});

/* --- UI Utilities --- */
function shakeButton() {
  generateRoutineBtn.classList.remove("shake");
  void generateRoutineBtn.offsetWidth; // trigger reflow
  generateRoutineBtn.classList.add("shake");
}

function showToast(message) {
  // Remove existing toast if any
  const existing = document.querySelector(".toast-msg");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast-msg";
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function displayMessage(role, text) {
  const placeholder = chatWindow.querySelector(".placeholder-message");
  if (placeholder) placeholder.remove();

  const msgDiv = document.createElement("div");
  msgDiv.classList.add("chat-message", `chat-message--${role}`);

  // Convert markdown to simple HTML bold + breaks
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

  msgDiv.innerHTML = `
    <div class="message-bubble">
      ${role === "assistant" ? '<span class="ai-label">AI Advisor</span>' : ""}
      <div class="message-text">${formatted}</div>
    </div>
  `;

  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: "smooth" });
}

function showTypingIndicator() {
  const indicator = document.createElement("div");
  indicator.id = "typingIndicator";
  indicator.className = "chat-message chat-message--assistant typing";
  indicator.innerHTML = `
    <div class="message-bubble">
      <span class="ai-label">AI Advisor</span>
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  chatWindow.appendChild(indicator);
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: "smooth" });
}

function removeTypingIndicator() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

/* --- API Communication --- */
async function callOpenAI(messages, webSearch = false) {
  const body = { messages };
  if (webSearch) {
    body.tools = [{ type: "web_search_preview" }];
  }

  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();

  // Handle tool-use response which may differ from standard choice
  if (
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content
  ) {
    return data.choices[0].message.content;
  }
  // Fallback: extract text from tool-augmented response
  if (data.output) {
    return data.output
      .filter((b) => b.type === "message")
      .flatMap((b) => b.content || [])
      .filter((c) => c && c.type === "output_text")
      .map((c) => c.text)
      .join("\n");
  }
  return "I couldn't retrieve current information at this time. Please try again.";
}

/* --- Routine Generation --- */
generateRoutineBtn.addEventListener("click", async () => {
  if (selectedIds.size === 0) {
    shakeButton();
    showToast("Please select at least one product first!");
    return;
  }

  const selected = allProducts.filter((p) => selectedIds.has(p.id));
  const productList = selected
    .map((p) => `- ${p.name} by ${p.brand} (${p.category}): ${p.description}`)
    .join("\n");

  const userMessage = `Please create a personalized beauty routine using these products I've selected:\n\n${productList}\n\nCreate a step-by-step routine that tells me exactly when and how to use each product.`;

  conversationHistory = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];

  displayMessage("assistant", "Crafting your personalized routine…");
  showTypingIndicator();

  try {
    const reply = await callOpenAI(conversationHistory, useWebSearch);

    const allMsgs = chatWindow.querySelectorAll(".chat-message--assistant");
    if (allMsgs.length > 0) {
      allMsgs[allMsgs.length - 1].remove();
    }
    removeTypingIndicator();

    conversationHistory.push({ role: "assistant", content: reply });
    displayMessage("assistant", reply);
  } catch (err) {
    removeTypingIndicator();
    displayMessage("assistant", "Something went wrong. Please try again.");
    console.error(err);
  }
});

/* --- Follow-Up Chat interaction --- */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("userInput");
  const userText = input.value.trim();
  if (!userText) return;

  input.value = "";
  displayMessage("user", userText);

  conversationHistory.push({ role: "user", content: userText });

  showTypingIndicator();

  try {
    const reply = await callOpenAI(conversationHistory, useWebSearch);
    conversationHistory.push({ role: "assistant", content: reply });
    removeTypingIndicator();
    displayMessage("assistant", reply);
  } catch (err) {
    removeTypingIndicator();
    displayMessage("assistant", "Something went wrong. Please try again.");
    console.error(err);
  }
});

/* --- Bonus Features: Web Search Toggle --- */
webSearchToggleBtn.addEventListener("click", () => {
  useWebSearch = !useWebSearch;
  webSearchToggleBtn.classList.toggle("active", useWebSearch);
  webSearchToggleBtn.innerHTML = useWebSearch
    ? '<i class="fa-solid fa-globe"></i> Search Web: On'
    : '<i class="fa-solid fa-globe"></i> Search Web: Off';
});

/* --- Bonus Features: RTL Toggle --- */
rtlToggleBtn.addEventListener("click", () => {
  const isRTL = document.documentElement.dir === "rtl";
  document.documentElement.dir = isRTL ? "ltr" : "rtl";
  document.documentElement.lang = isRTL ? "en" : "ar";
  localStorage.setItem("loreal_rtl", isRTL ? "" : "rtl");
});

/* Initialize application */
init();
