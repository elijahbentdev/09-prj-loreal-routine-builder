# PRD: L'Oréal Product-Aware Routine Builder Chatbot
**Project 9 — Global Career Accelerator**
**Prepared for:** AI Coding Agent
**Cloudflare Worker URL:** `https://fluxbotcca.elijah-bent.workers.dev`
**Deploy Target:** GitHub Pages (`https://elijahbentdev.github.io/<repo-name>`)

---

## 1. Project Overview

Transform the existing L'Oréal chatbot starter code into a fully-featured, product-aware AI Routine Builder that earns full marks across all rubric criteria — including all three Level Up bonuses (Web Search, Product Search, RTL Language Support). The app lets users browse real L'Oréal brand products by category and keyword, select products, generate a personalized AI skincare/beauty routine using those products, and continue the conversation with follow-up questions. Selections persist via localStorage. The UI should look high-end, polished, and feel like a real luxury brand product.

**Total possible points: 105 (80 base + 25 bonus)**

---

## 2. Tech Stack & Constraints

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5 + CSS3 + ES6+ JavaScript (no frameworks) |
| Data | `products.json` (local file, already provided) |
| AI API | OpenAI `gpt-4o` via existing Cloudflare Worker proxy |
| Web Search (LevelUp) | OpenAI `gpt-4o` with `web_search_preview` tool via Cloudflare Worker |
| Persistence | `localStorage` |
| Fonts | Google Fonts — keep Montserrat from starter |
| Icons | Font Awesome 6.4.2 (already linked) |
| Deploy | GitHub Pages — static site, no build step |

**Do NOT modify the Cloudflare Worker.** It already handles CORS, API key injection, and proxying to OpenAI. All `fetch` calls go to `https://fluxbotcca.elijah-bent.workers.dev`.

---

## 3. File Structure

The final repo must look exactly like this — no extra build tools, no package.json needed:

```
/
├── index.html
├── style.css
├── script.js
├── products.json
└── img/
    └── loreal-logo.png   ← already exists in starter
```

---

## 4. Design System

Use these exact CSS custom properties at the top of `style.css`. The visual style should be **luxury editorial** — think Vogue meets a modern beauty counter. Clean whites, bold L'Oréal red accents, gold secondary accents, refined typography.

```css
:root {
  --brand-red: #ff003b;
  --brand-gold: #e3a535;
  --brand-black: #0a0a0a;
  --brand-white: #ffffff;
  --surface-1: #fafafa;
  --surface-2: #f3f3f3;
  --border-light: #e8e8e8;
  --border-dark: #1a1a1a;
  --text-primary: #0a0a0a;
  --text-secondary: #6b6b6b;
  --text-muted: #a0a0a0;
  --selected-glow: rgba(255, 0, 59, 0.15);
  --card-shadow: 0 2px 12px rgba(0,0,0,0.07);
  --card-shadow-hover: 0 8px 32px rgba(0,0,0,0.13);
  --transition-fast: 0.18s ease;
  --transition-med: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --font-display: 'Montserrat', Arial, sans-serif;
}
```

### Color Usage Rules
- `--brand-red` → primary CTAs (Generate Routine button), selected state borders, active highlights
- `--brand-gold` → secondary accents, hover states, price-adjacent UI, tag chips
- `--brand-black` → headings, borders, footer, dark elements
- All interactive elements must have hover transitions using `var(--transition-med)`

---

## 5. Complete Feature Specifications

### 5.1 Header

The header must include:
- The L'Oréal logo image (`img/loreal-logo.png`) — 200px wide max
- Page title: **"Smart Routine Builder"** in Montserrat 700, ~28px
- A thin horizontal red line (`2px solid var(--brand-red)`) beneath the title as a brand accent
- The title text should be centered

### 5.2 Category Filter Dropdown

Keep the existing `<select id="categoryFilter">` with all existing `<option>` values. Style it:
- Full width, 16px padding, Montserrat 500
- `2px solid var(--border-dark)` border, `--radius-md` border radius
- On focus: border transitions to `var(--brand-red)`
- Custom dropdown arrow using CSS `appearance: none` + background SVG arrow in red

### 5.3 Product Search Bar (LevelUp — 10 pts)

**Add a new `<input id="productSearch">` directly above or below the category filter.** This enables real-time keyword search.

HTML to add:
```html
<div class="search-bar-wrapper">
  <i class="fa-solid fa-magnifying-glass search-icon"></i>
  <input 
    type="text" 
    id="productSearch" 
    placeholder="Search products by name or keyword…"
    autocomplete="off"
  />
</div>
```

Behavior:
- As the user types, filter the currently visible products by `product.name` and `product.description` (case-insensitive substring match)
- Works **in combination with** the category filter — both filters apply simultaneously
- If no products match, show: `<div class="empty-state"><i class="fa-solid fa-face-meh"></i><p>No products match your search.</p></div>`
- Debounce the input listener by 150ms for smoothness (use `setTimeout`/`clearTimeout`)
- The search input should clear when the category changes

JavaScript filter logic (pseudo):
```js
function getFilteredProducts(allProducts, category, searchTerm) {
  return allProducts.filter(p => {
    const matchCat = !category || p.category === category;
    const matchSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });
}
```

### 5.4 Product Cards & Grid

**Grid layout:**
```css
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin: 24px 0;
}
```

**Each card HTML (generated in JS, replacing `displayProducts()`):**
```html
<div class="product-card" data-id="1" data-selected="false">
  <div class="product-img-wrapper">
    <img src="..." alt="..." loading="lazy" />
    <button class="desc-toggle-btn" aria-label="Show description">
      <i class="fa-solid fa-circle-info"></i>
    </button>
    <div class="product-desc-overlay" role="tooltip" aria-hidden="true">
      <p>Product description text here...</p>
    </div>
  </div>
  <div class="product-info">
    <span class="product-brand">CeraVe</span>
    <h3 class="product-name">Foaming Facial Cleanser</h3>
    <span class="product-category-tag">Cleanser</span>
  </div>
  <div class="card-select-indicator">
    <i class="fa-solid fa-check"></i>
  </div>
</div>
```

**Card CSS behavior:**
- Default: `1px solid var(--border-light)`, `var(--card-shadow)`, white background
- Hover: `var(--card-shadow-hover)`, slight `translateY(-2px)` transform
- Selected state (`data-selected="true"`): `2px solid var(--brand-red)`, `background: var(--selected-glow)`, `.card-select-indicator` becomes visible (a small red circle with white checkmark in top-right corner)
- Cursor: `pointer` on the whole card

**Product Description Reveal (5 pts):**
The info button (ⓘ) in the top-right of the image wrapper toggles `.product-desc-overlay` visible. The overlay should:
- Be absolutely positioned, covering the image area
- Have `background: rgba(10,10,10,0.88)`, `color: white`, `padding: 16px`, `font-size: 13px`, `line-height: 1.6`
- Slide in with a CSS transition: `opacity 0.2s ease, transform 0.2s ease`
- Hidden by default: `opacity: 0; transform: translateY(4px); pointer-events: none`
- Visible state: `opacity: 1; transform: translateY(0); pointer-events: auto`

**Clicking the card itself** (not the ⓘ button) toggles selection. Clicking ⓘ toggles the description overlay without toggling selection (use `e.stopPropagation()`).

### 5.5 Selected Products Section (10 pts)

The `<div class="selected-products">` section must:

**Display chips for each selected product:**
```html
<div class="selected-chip" data-id="1">
  <img src="..." alt="..." />
  <span>Foaming Facial Cleanser</span>
  <button class="remove-chip-btn" aria-label="Remove product">
    <i class="fa-solid fa-xmark"></i>
  </button>
</div>
```

Chip styles:
- `display: inline-flex; align-items: center; gap: 8px`
- `background: var(--surface-2); border: 1px solid var(--border-light); border-radius: 24px; padding: 6px 12px`
- Small product thumbnail: `32px × 32px`, `object-fit: contain`
- The ✕ button removes the chip AND un-selects the corresponding card
- A **"Clear All"** button appears when ≥1 product is selected; clicking it deselects all cards, clears chips, and clears localStorage

**Empty state when nothing selected:**
```html
<p class="no-selection-msg">
  <i class="fa-regular fa-hand-pointer"></i> 
  Click products above to add them to your routine.
</p>
```

### 5.6 localStorage Persistence (10 pts)

Selected product IDs are saved as a JSON array in localStorage under the key `loreal_selected_ids`.

```js
const STORAGE_KEY = 'loreal_selected_ids';

function saveSelections(selectedIds) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...selectedIds]));
}

function loadSelections() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  } catch {
    return new Set();
  }
}
```

On page load:
1. Load saved IDs from localStorage into a `Set` called `selectedIds`
2. After products load for a category, re-apply visual selected state to any cards whose IDs are in `selectedIds`
3. Re-render the chips in the Selected Products section from `selectedIds` (requires keeping all loaded products in memory — use an `allProducts` array loaded once at startup)
4. **Critical:** Load ALL products at startup into `allProducts` so chip names/images can be restored even if a user switches categories

```js
let allProducts = [];
let selectedIds = loadSelections(); // Set of numeric IDs

async function init() {
  allProducts = await loadProducts(); // fetch products.json once
  restoreChips(); // rebuild chips from localStorage
  renderProducts(); // initial render based on current filter state
}

init();
```

### 5.7 Generate Routine (10 pts)

When `#generateRoutine` is clicked:

1. If `selectedIds.size === 0`, show an animated shake on the button and a toast message: `"Please select at least one product first!"`
2. Collect the full product objects for all selected IDs from `allProducts`
3. Construct the OpenAI messages array with a system prompt and the selected product data
4. POST to the Cloudflare Worker
5. Display the response in the chat window
6. Add the exchange to `conversationHistory` for follow-up support

**System Prompt (paste this exactly into your JS):**
```js
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
```

**Fetch call to Cloudflare Worker:**
```js
const WORKER_URL = "https://fluxbotcca.elijah-bent.workers.dev";

async function callOpenAI(messages) {
  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}
```

**Routine generation call:**
```js
async function generateRoutine() {
  if (selectedIds.size === 0) {
    shakeButton();
    showToast("Please select at least one product first!");
    return;
  }

  const selected = allProducts.filter(p => selectedIds.has(p.id));
  const productList = selected.map(p =>
    `- ${p.name} by ${p.brand} (${p.category}): ${p.description}`
  ).join('\n');

  const userMessage = `Please create a personalized beauty routine using these products I've selected:\n\n${productList}\n\nCreate a step-by-step routine that tells me exactly when and how to use each product.`;

  conversationHistory = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage }
  ];

  showLoadingInChat("Crafting your personalized routine…");
  
  try {
    const reply = await callOpenAI(conversationHistory);
    conversationHistory.push({ role: "assistant", content: reply });
    displayMessage("assistant", reply);
  } catch (err) {
    displayMessage("error", "Something went wrong. Please try again.");
  }
}
```

### 5.8 Follow-Up Chat (10 pts)

After the routine is generated, the chat form allows follow-up questions. `conversationHistory` is maintained for the entire session.

```js
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
    const reply = await callOpenAI(conversationHistory);
    conversationHistory.push({ role: "assistant", content: reply });
    removeTypingIndicator();
    displayMessage("assistant", reply);
  } catch (err) {
    removeTypingIndicator();
    displayMessage("error", "Something went wrong. Please try again.");
  }
});
```

### 5.9 Chat Window UI

Messages are rendered with distinct visual styles for user vs assistant.

```js
function displayMessage(role, text) {
  // Remove placeholder if present
  const placeholder = chatWindow.querySelector('.placeholder-message');
  if (placeholder) placeholder.remove();

  const msgDiv = document.createElement('div');
  msgDiv.classList.add('chat-message', `chat-message--${role}`);
  
  // Convert markdown-style formatting to HTML
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  msgDiv.innerHTML = `
    <div class="message-bubble">
      ${role === 'assistant' ? '<span class="ai-label">AI Advisor</span>' : ''}
      <div class="message-text">${formatted}</div>
    </div>
  `;
  
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
}
```

**Typing indicator:**
```js
function showTypingIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'typingIndicator';
  indicator.className = 'chat-message chat-message--assistant typing';
  indicator.innerHTML = `
    <div class="message-bubble">
      <span class="ai-label">AI Advisor</span>
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  chatWindow.appendChild(indicator);
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
}

function removeTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}
```

### 5.10 RTL Language Support (LevelUp — 5 pts)

**Add a language toggle button to the header:**
```html
<button id="rtlToggle" class="rtl-toggle-btn" aria-label="Toggle RTL layout">
  <i class="fa-solid fa-language"></i> RTL
</button>
```

**JavaScript:**
```js
document.getElementById('rtlToggle').addEventListener('click', () => {
  const isRTL = document.documentElement.dir === 'rtl';
  document.documentElement.dir = isRTL ? 'ltr' : 'rtl';
  document.documentElement.lang = isRTL ? 'en' : 'ar';
  localStorage.setItem('loreal_rtl', isRTL ? '' : 'rtl');
});

// Restore on load
if (localStorage.getItem('loreal_rtl') === 'rtl') {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
}
```

**CSS for RTL support** — these rules ensure all major layout components flip correctly:
```css
[dir="rtl"] .search-bar-wrapper .search-icon { right: 16px; left: auto; }
[dir="rtl"] .search-bar-wrapper input { padding-right: 44px; padding-left: 16px; }
[dir="rtl"] .selected-chip { flex-direction: row-reverse; }
[dir="rtl"] .chat-message--user { flex-direction: row-reverse; }
[dir="rtl"] .chat-message--user .message-bubble { margin-right: 0; margin-left: 0; border-radius: 18px 18px 18px 4px; }
[dir="rtl"] .chat-form { flex-direction: row-reverse; }
[dir="rtl"] .card-select-indicator { left: 10px; right: auto; }
[dir="rtl"] .desc-toggle-btn { left: 10px; right: auto; }
[dir="rtl"] .product-info { text-align: right; }
[dir="rtl"] .generate-btn i { margin-right: 0; margin-left: 8px; }
```

### 5.11 Web Search LevelUp (10 pts)

The existing Cloudflare Worker already supports passing `tools` through if you modify the `requestBody`. However, to keep the Worker unchanged as requested, implement web search by adding a search-awareness flag in the system prompt and model. 

Since the Worker just passes `messages` directly through, you can enable web search by using OpenAI's built-in browsing capability. Update your `callOpenAI` function to include the `web_search_preview` tool in the request body:

```js
async function callOpenAI(messages, useWebSearch = false) {
  const body = { messages };
  if (useWebSearch) {
    body.tools = [{ type: "web_search_preview" }];
  }
  
  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  
  // Handle tool-use response which may differ from standard choice
  if (data.choices && data.choices[0].message.content) {
    return data.choices[0].message.content;
  }
  // Fallback: extract text from tool-augmented response
  if (data.output) {
    return data.output
      .filter(b => b.type === "message")
      .flatMap(b => b.content)
      .filter(c => c.type === "output_text")
      .map(c => c.text)
      .join('\n');
  }
  return "I couldn't retrieve current information at this time.";
}
```

**Add a "Search Web" toggle button** near the chat input:
```html
<button type="button" id="webSearchToggle" class="web-search-btn" title="Toggle web search for current info">
  <i class="fa-solid fa-globe"></i>
</button>
```

When the toggle is active (add `.active` class, style with `--brand-gold` color), pass `useWebSearch = true` in the follow-up chat handler.

**Note on Cloudflare Worker:** The Worker passes through whatever JSON body it receives. Since you're only adding an extra key (`tools`) to the body that the Worker forwards, **no Worker modification is needed.** The Worker's `requestBody` construction hardcodes `model` and `max_completion_tokens`, so you cannot add `tools` from the client side via the existing Worker without modification. 

**If web search responses aren't working**, you may need to update your Cloudflare Worker's `requestBody` construction as follows:

```js
// In the Cloudflare Worker, replace the requestBody block with:
const requestBody = {
  model: "gpt-4o",
  messages: userInput.messages,
  max_completion_tokens: 300,
  ...(userInput.tools ? { tools: userInput.tools } : {})
};
```

This is the only change needed. The `allowedOrigin` and all CORS logic stays identical.

---

## 6. Complete CSS Additions

Add these to `style.css` (in addition to the existing styles and CSS variables defined above):

```css
/* ── Page Load Animation ── */
.page-wrapper { animation: fadeUp 0.5s ease both; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Header ── */
.site-header { padding: 40px 0 20px; border-bottom: 1px solid var(--border-light); margin-bottom: 32px; }
.header-accent { display: block; width: 60px; height: 3px; background: var(--brand-red); margin: 10px auto 0; border-radius: 2px; }

/* ── Search Bar ── */
.search-bar-wrapper {
  position: relative;
  margin-bottom: 12px;
}
.search-bar-wrapper .search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}
.search-bar-wrapper input {
  width: 100%;
  padding: 14px 16px 14px 44px;
  font-family: var(--font-display);
  font-size: 15px;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--brand-white);
  transition: border-color var(--transition-fast);
}
.search-bar-wrapper input:focus {
  outline: none;
  border-color: var(--brand-red);
}

/* ── Product Cards ── */
.product-card {
  position: relative;
  background: var(--brand-white);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow var(--transition-med), transform var(--transition-med), border-color var(--transition-fast);
  box-shadow: var(--card-shadow);
}
.product-card:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-3px);
}
.product-card[data-selected="true"] {
  border-color: var(--brand-red);
  background: var(--selected-glow);
}
.product-img-wrapper {
  position: relative;
  background: var(--surface-1);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 170px;
}
.product-img-wrapper img {
  max-height: 130px;
  max-width: 100%;
  object-fit: contain;
  transition: transform var(--transition-med);
}
.product-card:hover .product-img-wrapper img { transform: scale(1.04); }
.product-info {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.product-brand { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--brand-red); }
.product-name { font-size: 14px; font-weight: 600; color: var(--text-primary); line-height: 1.35; }
.product-category-tag {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 10px;
  background: var(--surface-2);
  border-radius: 12px;
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: capitalize;
  width: fit-content;
}

/* ── Description Overlay ── */
.desc-toggle-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 14px;
  transition: color var(--transition-fast), background var(--transition-fast);
  z-index: 2;
}
.desc-toggle-btn:hover { color: var(--brand-red); background: white; }
.product-desc-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10,10,10,0.89);
  color: #fff;
  padding: 14px;
  font-size: 12px;
  line-height: 1.6;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.22s ease, transform 0.22s ease;
  pointer-events: none;
  overflow-y: auto;
  z-index: 3;
}
.product-desc-overlay.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* ── Selected Check Indicator ── */
.card-select-indicator {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 24px;
  height: 24px;
  background: var(--brand-red);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 11px;
  opacity: 0;
  transform: scale(0.6);
  transition: opacity var(--transition-fast), transform var(--transition-fast);
  z-index: 2;
}
[data-selected="true"] .card-select-indicator {
  opacity: 1;
  transform: scale(1);
}

/* ── Selected Products Section ── */
.selected-products {
  border: 1.5px solid var(--border-dark);
  border-radius: var(--radius-lg);
  padding: 24px;
  background: var(--brand-white);
}
.selected-products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.clear-all-btn {
  font-size: 12px;
  color: var(--text-muted);
  background: none;
  border: 1px solid var(--border-light);
  border-radius: 20px;
  padding: 4px 12px;
  cursor: pointer;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}
.clear-all-btn:hover { color: var(--brand-red); border-color: var(--brand-red); }
#selectedProductsList { display: flex; flex-wrap: wrap; gap: 10px; min-height: 40px; }
.selected-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--surface-2);
  border: 1px solid var(--border-light);
  border-radius: 24px;
  padding: 6px 10px 6px 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  animation: chipIn 0.2s ease both;
}
@keyframes chipIn {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
.selected-chip img { width: 32px; height: 32px; object-fit: contain; border-radius: 50%; background: white; }
.remove-chip-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 13px;
  padding: 0 2px;
  line-height: 1;
  transition: color var(--transition-fast);
}
.remove-chip-btn:hover { color: var(--brand-red); }
.no-selection-msg { color: var(--text-muted); font-size: 14px; padding: 8px 0; }

/* ── Generate Button ── */
.generate-btn {
  margin-top: 20px;
  width: 100%;
  padding: 16px;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: white;
  background: var(--brand-red);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-med), transform var(--transition-fast), box-shadow var(--transition-med);
  box-shadow: 0 4px 16px rgba(255,0,59,0.25);
}
.generate-btn:hover {
  background: #d4002f;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(255,0,59,0.35);
}
.generate-btn:active { transform: translateY(0); }
.generate-btn.shake {
  animation: shake 0.4s ease;
}
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

/* ── Chat Window ── */
.chatbox {
  border: 1.5px solid var(--border-dark);
  border-radius: var(--radius-lg);
  padding: 24px;
  background: var(--brand-white);
}
.chatbox h2 { font-size: 18px; font-weight: 700; letter-spacing: 0.02em; margin-bottom: 16px; }
.chat-window {
  height: 320px;
  overflow-y: auto;
  padding: 16px;
  background: var(--surface-1);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}
.chat-message { display: flex; }
.chat-message--user { justify-content: flex-end; }
.chat-message--assistant { justify-content: flex-start; }
.message-bubble {
  max-width: 82%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.6;
}
.chat-message--user .message-bubble {
  background: var(--brand-black);
  color: white;
  border-radius: 18px 18px 4px 18px;
}
.chat-message--assistant .message-bubble {
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 18px 18px 18px 4px;
}
.chat-message--error .message-bubble {
  background: #fff3f5;
  border: 1px solid #ffc0cc;
  color: #c0002a;
}
.ai-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--brand-red);
  margin-bottom: 6px;
}

/* ── Typing Dots ── */
.typing-dots { display: flex; gap: 5px; padding: 4px 0; }
.typing-dots span {
  width: 7px; height: 7px;
  background: var(--text-muted);
  border-radius: 50%;
  animation: dot-bounce 1.2s infinite ease-in-out;
}
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot-bounce {
  0%,80%,100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-6px); opacity: 1; }
}

/* ── Chat Form ── */
.chat-form { display: flex; gap: 10px; align-items: center; }
.chat-form input {
  flex: 1;
  padding: 12px 16px;
  font-family: var(--font-display);
  font-size: 14px;
  border: 1.5px solid var(--border-light);
  border-radius: 24px;
  background: var(--surface-1);
  transition: border-color var(--transition-fast);
}
.chat-form input:focus { outline: none; border-color: var(--brand-red); }
.chat-form button[type="submit"] {
  width: 44px; height: 44px;
  background: var(--brand-red);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast);
  flex-shrink: 0;
}
.chat-form button[type="submit"]:hover { background: #d4002f; transform: scale(1.06); }

/* ── Web Search Toggle ── */
.web-search-btn {
  width: 38px; height: 38px;
  background: var(--surface-2);
  border: 1px solid var(--border-light);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  font-size: 15px;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}
.web-search-btn.active { background: var(--brand-gold); border-color: var(--brand-gold); color: white; }
.web-search-btn:hover { border-color: var(--brand-gold); color: var(--brand-gold); }

/* ── Toast Notification ── */
.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%) translateY(16px);
  background: var(--brand-black);
  color: white;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
  z-index: 1000;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

/* ── RTL Toggle Button ── */
.rtl-toggle-btn {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 6px 14px;
  border: 1.5px solid var(--border-dark);
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: 12px;
}
.rtl-toggle-btn:hover { background: var(--brand-black); color: white; }

/* ── Empty State ── */
.empty-state { width: 100%; text-align: center; padding: 40px 20px; color: var(--text-muted); }
.empty-state i { font-size: 32px; margin-bottom: 12px; display: block; }
.empty-state p { font-size: 15px; }

/* ── Responsive ── */
@media (max-width: 640px) {
  .products-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
  .message-bubble { max-width: 95%; font-size: 13px; }
  .page-wrapper { width: 95%; }
}
```

---

## 7. Complete `index.html` Replacement

Replace the entire `index.html` with the following:

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>L'Oréal | Smart Routine Builder</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div id="toastContainer" class="toast" role="status" aria-live="polite"></div>

  <div class="page-wrapper">
    <!-- Header -->
    <header class="site-header">
      <img src="https://cdn.jsdelivr.net/gh/GCA-Classroom/09-loreal-images/img/loreal-logo.png" alt="L'Oréal Logo" class="logo" />
      <h1 class="site-title">Smart Routine Builder</h1>
      <span class="header-accent"></span>
      <div style="margin-top:12px;">
        <button id="rtlToggle" class="rtl-toggle-btn" aria-label="Toggle RTL layout">
          <i class="fa-solid fa-language"></i> RTL
        </button>
      </div>
    </header>

    <!-- Search & Filter -->
    <div class="search-section" style="flex-direction: column; gap: 12px;">
      <div class="search-bar-wrapper">
        <i class="fa-solid fa-magnifying-glass search-icon"></i>
        <input type="text" id="productSearch" placeholder="Search products by name or keyword…" autocomplete="off" />
      </div>
      <select id="categoryFilter">
        <option value="" selected>All Categories</option>
        <option value="cleanser">Cleansers</option>
        <option value="moisturizer">Moisturizers &amp; Treatments</option>
        <option value="haircare">Haircare</option>
        <option value="makeup">Makeup</option>
        <option value="hair color">Hair Color</option>
        <option value="hair styling">Hair Styling</option>
        <option value="men's grooming">Men's Grooming</option>
        <option value="suncare">Suncare</option>
        <option value="fragrance">Fragrance</option>
      </select>
    </div>

    <!-- Products Grid -->
    <div id="productsContainer" class="products-grid"></div>

    <!-- Selected Products -->
    <div class="selected-products">
      <div class="selected-products-header">
        <h2>Selected Products</h2>
        <button id="clearAllBtn" class="clear-all-btn" style="display:none;">
          <i class="fa-solid fa-trash-can"></i> Clear All
        </button>
      </div>
      <div id="selectedProductsList">
        <p class="no-selection-msg">
          <i class="fa-regular fa-hand-pointer"></i> Click products above to add them to your routine.
        </p>
      </div>
      <button id="generateRoutine" class="generate-btn">
        <i class="fa-solid fa-wand-magic-sparkles"></i> Generate My Routine
      </button>
    </div>

    <!-- Chat Area -->
    <section class="chatbox">
      <h2>About Your Routine</h2>
      <div id="chatWindow" class="chat-window">
        <div class="placeholder-message">
          Select products and generate your routine — then ask me anything! ✨
        </div>
      </div>
      <form id="chatForm" class="chat-form">
        <label for="userInput" class="visually-hidden">Message</label>
        <input id="userInput" name="userInput" type="text"
          placeholder="Ask about your routine or beauty tips…"
          autocomplete="off" required />
        <button type="button" id="webSearchToggle" class="web-search-btn" title="Enable web search for current info">
          <i class="fa-solid fa-globe"></i>
        </button>
        <button type="submit" id="sendBtn">
          <i class="fa-solid fa-paper-plane"></i>
          <span class="visually-hidden">Send</span>
        </button>
      </form>
    </section>

    <!-- Footer -->
    <footer class="site-footer">
      <p>&copy; 2025 L'Oréal. All rights reserved.</p>
      <nav>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Use</a>
        <a href="#">Contact</a>
      </nav>
    </footer>
  </div>

  <script src="script.js"></script>
</body>
</html>
```

**Note:** Remove the `<script src="secrets.js"></script>` line. The API key is handled by the Cloudflare Worker.

---

## 8. Complete `script.js` Replacement

Replace the entire `script.js` with the following complete implementation:

```js
// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const WORKER_URL = "https://fluxbotcca.elijah-bent.workers.dev";
const STORAGE_KEY = "loreal_selected_ids";
const STORAGE_RTL_KEY = "loreal_rtl";

const SYSTEM_PROMPT = `You are a luxury beauty advisor for L'Oréal and its family of brands (CeraVe, La Roche-Posay, Garnier, L'Oréal Paris, Lancôme, Kérastase, etc.).

Your role is to:
1. Create personalized, step-by-step skincare, haircare, and beauty routines using ONLY the products the user has selected.
2. Explain WHY each product is used at that step (key ingredients, benefits).
3. Specify AM vs PM usage where relevant, using ☀️ and 🌙 emojis.
4. Give professional-sounding but warm, encouraging advice.
5. For follow-up questions, ONLY answer questions about the generated routine, skincare, haircare, makeup, fragrance, or beauty topics. Politely redirect off-topic questions.
6. Format routines with clear numbered steps and emojis for visual appeal.
7. Keep responses concise — under 400 words for routine generation, under 200 words for follow-ups.
8. Always ground your routine in the specific products selected. Never recommend products not in the user's selection.`;

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
let allProducts = [];
let selectedIds = loadSelections();
let conversationHistory = [];
let webSearchEnabled = false;
let searchDebounce = null;

// ─────────────────────────────────────────────
// DOM REFS
// ─────────────────────────────────────────────
const categoryFilter = document.getElementById("categoryFilter");
const productSearch = document.getElementById("productSearch");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const generateBtn = document.getElementById("generateRoutine");
const clearAllBtn = document.getElementById("clearAllBtn");
const webSearchToggle = document.getElementById("webSearchToggle");
const rtlToggle = document.getElementById("rtlToggle");
const selectedList = document.getElementById("selectedProductsList");
const toastEl = document.getElementById("toastContainer");

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
async function init() {
  // Restore RTL
  if (localStorage.getItem(STORAGE_RTL_KEY) === "rtl") {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  }

  allProducts = await loadProducts();
  renderProducts();
  restoreChips();
}

init();

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

// ─────────────────────────────────────────────
// FILTERING
// ─────────────────────────────────────────────
function getFilteredProducts() {
  const category = categoryFilter.value;
  const searchTerm = productSearch.value.trim().toLowerCase();
  return allProducts.filter(p => {
    const matchCat = !category || p.category === category;
    const matchSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm) ||
      (p.description && p.description.toLowerCase().includes(searchTerm)) ||
      p.brand.toLowerCase().includes(searchTerm);
    return matchCat && matchSearch;
  });
}

// ─────────────────────────────────────────────
// RENDER PRODUCTS
// ─────────────────────────────────────────────
function renderProducts() {
  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    productsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular fa-face-meh"></i>
        <p>No products match your search.</p>
      </div>`;
    return;
  }

  productsContainer.innerHTML = filtered.map(p => `
    <div class="product-card" data-id="${p.id}" data-selected="${selectedIds.has(p.id)}">
      <div class="card-select-indicator"><i class="fa-solid fa-check"></i></div>
      <div class="product-img-wrapper">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
        <button class="desc-toggle-btn" data-id="${p.id}" aria-label="Show description for ${p.name}">
          <i class="fa-solid fa-circle-info"></i>
        </button>
        <div class="product-desc-overlay" id="desc-${p.id}" role="tooltip" aria-hidden="true">
          <p>${p.description || "No description available."}</p>
        </div>
      </div>
      <div class="product-info">
        <span class="product-brand">${p.brand}</span>
        <h3 class="product-name">${p.name}</h3>
        <span class="product-category-tag">${p.category}</span>
      </div>
    </div>
  `).join("");

  // Bind card click events
  productsContainer.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", handleCardClick);
  });

  // Bind description toggle buttons
  productsContainer.querySelectorAll(".desc-toggle-btn").forEach(btn => {
    btn.addEventListener("click", handleDescToggle);
  });
}

// ─────────────────────────────────────────────
// CARD CLICK → SELECT / DESELECT
// ─────────────────────────────────────────────
function handleCardClick(e) {
  // Don't toggle if clicking the info button or overlay
  if (e.target.closest(".desc-toggle-btn") || e.target.closest(".product-desc-overlay")) return;

  const card = e.currentTarget;
  const id = parseInt(card.dataset.id);
  const isSelected = selectedIds.has(id);

  if (isSelected) {
    selectedIds.delete(id);
    card.dataset.selected = "false";
  } else {
    selectedIds.add(id);
    card.dataset.selected = "true";
  }

  saveSelections(selectedIds);
  renderChips();
}

// ─────────────────────────────────────────────
// DESCRIPTION TOGGLE
// ─────────────────────────────────────────────
function handleDescToggle(e) {
  e.stopPropagation();
  const id = e.currentTarget.dataset.id;
  const overlay = document.getElementById(`desc-${id}`);
  if (!overlay) return;
  const isVisible = overlay.classList.contains("visible");
  // Close all overlays first
  document.querySelectorAll(".product-desc-overlay.visible").forEach(o => {
    o.classList.remove("visible");
    o.setAttribute("aria-hidden", "true");
  });
  if (!isVisible) {
    overlay.classList.add("visible");
    overlay.setAttribute("aria-hidden", "false");
  }
}

// ─────────────────────────────────────────────
// CHIPS (SELECTED PRODUCTS LIST)
// ─────────────────────────────────────────────
function renderChips() {
  if (selectedIds.size === 0) {
    selectedList.innerHTML = `<p class="no-selection-msg"><i class="fa-regular fa-hand-pointer"></i> Click products above to add them to your routine.</p>`;
    clearAllBtn.style.display = "none";
    return;
  }

  clearAllBtn.style.display = "inline-flex";

  const selectedProducts = allProducts.filter(p => selectedIds.has(p.id));
  selectedList.innerHTML = selectedProducts.map(p => `
    <div class="selected-chip" data-id="${p.id}">
      <img src="${p.image}" alt="${p.name}" />
      <span>${p.name}</span>
      <button class="remove-chip-btn" data-id="${p.id}" aria-label="Remove ${p.name}">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  `).join("");

  selectedList.querySelectorAll(".remove-chip-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      selectedIds.delete(id);
      saveSelections(selectedIds);

      // Update card visual state
      const card = document.querySelector(`.product-card[data-id="${id}"]`);
      if (card) card.dataset.selected = "false";

      renderChips();
    });
  });
}

function restoreChips() {
  renderChips();
}

// ─────────────────────────────────────────────
// LOCALSTORAGE
// ─────────────────────────────────────────────
function saveSelections(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

function loadSelections() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw).map(Number)) : new Set();
  } catch {
    return new Set();
  }
}

// ─────────────────────────────────────────────
// CLEAR ALL
// ─────────────────────────────────────────────
clearAllBtn.addEventListener("click", () => {
  selectedIds.clear();
  saveSelections(selectedIds);
  document.querySelectorAll(".product-card[data-selected='true']").forEach(c => {
    c.dataset.selected = "false";
  });
  renderChips();
  showToast("All selections cleared.");
});

// ─────────────────────────────────────────────
// FILTER EVENTS
// ─────────────────────────────────────────────
categoryFilter.addEventListener("change", () => {
  productSearch.value = "";
  renderProducts();
});

productSearch.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(renderProducts, 150);
});

// ─────────────────────────────────────────────
// OPENAI API CALL
// ─────────────────────────────────────────────
async function callOpenAI(messages, useWebSearch = false) {
  const body = { messages };
  if (useWebSearch) {
    body.tools = [{ type: "web_search_preview" }];
  }

  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  // Standard response
  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content;
  }
  // Web search tool response (Responses API format)
  if (data.output) {
    return data.output
      .filter(b => b.type === "message")
      .flatMap(b => b.content)
      .filter(c => c.type === "output_text")
      .map(c => c.text)
      .join("\n");
  }
  // Error fallback
  if (data.error) {
    throw new Error(data.error.message || "API error");
  }
  return "I couldn't get a response. Please try again.";
}

// ─────────────────────────────────────────────
// GENERATE ROUTINE
// ─────────────────────────────────────────────
generateBtn.addEventListener("click", async () => {
  if (selectedIds.size === 0) {
    generateBtn.classList.add("shake");
    generateBtn.addEventListener("animationend", () => generateBtn.classList.remove("shake"), { once: true });
    showToast("Please select at least one product first!");
    return;
  }

  const selected = allProducts.filter(p => selectedIds.has(p.id));
  const productList = selected.map(p =>
    `- ${p.name} by ${p.brand} (${p.category}): ${p.description}`
  ).join("\n");

  const userMessage = `Please create a personalized beauty routine using these selected products:\n\n${productList}\n\nGive me a clear step-by-step AM/PM routine with explanations for each step.`;

  conversationHistory = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage }
  ];

  // Clear chat and show loader
  chatWindow.innerHTML = "";
  showTypingIndicator();

  try {
    const reply = await callOpenAI(conversationHistory);
    conversationHistory.push({ role: "assistant", content: reply });
    removeTypingIndicator();
    displayMessage("assistant", reply);
  } catch (err) {
    removeTypingIndicator();
    displayMessage("error", `⚠️ ${err.message || "Something went wrong. Please try again."}`);
  }
});

// ─────────────────────────────────────────────
// FOLLOW-UP CHAT
// ─────────────────────────────────────────────
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
    const reply = await callOpenAI(conversationHistory, webSearchEnabled);
    conversationHistory.push({ role: "assistant", content: reply });
    removeTypingIndicator();
    displayMessage("assistant", reply);
  } catch (err) {
    removeTypingIndicator();
    displayMessage("error", `⚠️ ${err.message || "Something went wrong. Please try again."}`);
  }
});

// ─────────────────────────────────────────────
// WEB SEARCH TOGGLE
// ─────────────────────────────────────────────
webSearchToggle.addEventListener("click", () => {
  webSearchEnabled = !webSearchEnabled;
  webSearchToggle.classList.toggle("active", webSearchEnabled);
  webSearchToggle.title = webSearchEnabled
    ? "Web search ON — AI will include current info"
    : "Enable web search for current info";
  showToast(webSearchEnabled ? "🌐 Web search enabled" : "Web search disabled");
});

// ─────────────────────────────────────────────
// RTL TOGGLE
// ─────────────────────────────────────────────
rtlToggle.addEventListener("click", () => {
  const isRTL = document.documentElement.dir === "rtl";
  document.documentElement.dir = isRTL ? "ltr" : "rtl";
  document.documentElement.lang = isRTL ? "en" : "ar";
  localStorage.setItem(STORAGE_RTL_KEY, isRTL ? "" : "rtl");
  showToast(isRTL ? "Layout: Left-to-Right" : "Layout: Right-to-Left ← RTL");
});

// ─────────────────────────────────────────────
// CHAT DISPLAY HELPERS
// ─────────────────────────────────────────────
function displayMessage(role, text) {
  const placeholder = chatWindow.querySelector(".placeholder-message");
  if (placeholder) placeholder.remove();

  const msgDiv = document.createElement("div");
  msgDiv.classList.add("chat-message", `chat-message--${role}`);

  // Minimal markdown: bold and newlines
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
  indicator.className = "chat-message chat-message--assistant";
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

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3000);
}
```

---

## 9. Cloudflare Worker: Required Change for Web Search

The existing Worker hardcodes the `requestBody`. To support the Web Search LevelUp, **one line** must change. Open your Cloudflare Worker dashboard and modify this section:

**Current (original):**
```js
const requestBody = {
  model: "gpt-4o",
  messages: userInput.messages,
  max_completion_tokens: 300,
};
```

**Change to:**
```js
const requestBody = {
  model: "gpt-4o",
  messages: userInput.messages,
  max_completion_tokens: 500,
  ...(userInput.tools ? { tools: userInput.tools } : {})
};
```

The `max_completion_tokens` increase to 500 is recommended for routine generation responses. The spread operator safely passes through `tools` only when the client sends them (web search LevelUp), otherwise has no effect. The `allowedOrigin`, CORS headers, and all other logic remain identical.

---

## 10. Rubric Verification Checklist

| Criterion | How It's Satisfied | Points |
|---|---|---|
| **Product Selection** | Click card → `selectedIds` Set updates, `data-selected` attribute toggles CSS state, chips re-render | 10 |
| **Routine Generation** | `generateBtn` collects selected product JSON, sends to OpenAI via Worker, displays in chat | 10 |
| **Follow-Up Chat** | `conversationHistory` array maintains full message context; `chatForm` submit appends and sends | 10 |
| **Save Selected Products** | `localStorage` key `loreal_selected_ids`, chips restore on reload, Clear All removes, individual chip ✕ removes | 10 |
| **Reveal Product Description** | ⓘ button toggles `.visible` overlay on image, CSS transition, `stopPropagation` prevents card select | 5 |
| **Cloudflare Worker** | All calls go to `WORKER_URL`, no API key in browser, Worker injects key server-side | 5 |
| **LevelUp: Web Search** | Globe toggle button, `webSearchEnabled` flag, `tools` sent to Worker when active | 10 |
| **LevelUp: Product Search** | `#productSearch` input, 150ms debounce, filters by name/description/brand alongside category | 10 |
| **LevelUp: RTL Support** | RTL toggle sets `dir="rtl"` on `<html>`, CSS `[dir="rtl"]` rules flip all major layout sections | 5 |

**Total: 75 pts guaranteed + 25 bonus = 100 pts possible**

---

## 11. Deployment Instructions

```bash
# 1. Make sure all files are committed
git add .
git commit -m "feat: complete routine builder with all level ups"
git push origin main

# 2. In GitHub: Settings → Pages → Source: Deploy from branch → main → / (root)
# 3. Wait ~60 seconds, then visit: https://elijahbentdev.github.io/<repo-name>
# 4. Test in an incognito window before submitting
```

---

## 12. Reflection Question Answers (Student Section)

After verifying everything works, fill in these answers in the project submission doc:

**Q2 (Prompt Writing):** Discuss how you crafted the system prompt to keep the AI on-topic (beauty only), how you structured product data in the user message, and how including product descriptions vs. just names changed the quality of routines. Mention any iterations you tried.

**Q3 (Overcoming Roadblocks):** Common issues to mention: localStorage not restoring chips because product data wasn't loaded yet (solved by loading `allProducts` once at init before restoring chips); RTL flipping not working on chat bubbles (solved by checking `flex-direction` in RTL CSS); the Worker returning `data.choices` vs `data.output` depending on whether web search tools were used (solved by the dual-path response handler in `callOpenAI`).

**Q4 (LinkedIn Post):** "Just shipped a full AI-powered beauty routine builder using the OpenAI API, Cloudflare Workers, vanilla JS, and real L'Oréal product data — all deployed to GitHub Pages. Users can browse 50+ products, select their favorites, and get a personalized AM/PM routine with follow-up chat, localStorage persistence, RTL language support, and live web search. This project taught me so much about API proxying, localStorage, and building polished AI-integrated UIs. Check it out: [link]"

---

---

# AI CODING AGENT PROMPT

Copy and paste the following prompt to your AI coding agent (Claude Code, Cursor, Copilot, etc.) to implement this project:

---

```
You are implementing a complete L'Oréal Smart Routine Builder web app from a detailed PRD. The project is a static site deployed to GitHub Pages. Here is exactly what you must do:

## CONTEXT
- The repo already has: index.html, style.css, script.js, products.json, and an img/ folder with a L'Oréal logo.
- The existing files are starter code that must be FULLY REPLACED with the final implementation described below.
- All API calls go through this Cloudflare Worker: https://fluxbotcca.elijah-bent.workers.dev
- The Worker accepts POST requests with { messages: [...], tools?: [...] } and proxies to OpenAI gpt-4o. No API key needed in the browser.
- Do NOT create any build tools, npm packages, or server-side files. This is pure HTML/CSS/JS.

## TASK: Replace index.html, style.css, and script.js with the following implementations.

### 1. index.html
- Standard HTML5 doc, lang="en" dir="ltr" on <html>
- Google Fonts: Montserrat (300,400,500,600,700)
- Font Awesome 6.4.2 CSS CDN
- Link style.css, then script.js (no secrets.js)
- A fixed #toastContainer div for toast notifications
- Header: L'Oréal logo (https://cdn.jsdelivr.net/gh/GCA-Classroom/09-loreal-images/img/loreal-logo.png), h1 "Smart Routine Builder", a red accent span, and an RTL toggle button #rtlToggle
- Two filter controls stacked vertically: a search bar wrapper (#productSearch input with a magnifying glass icon) and a <select id="categoryFilter"> with options for: All Categories (value=""), cleanser, moisturizer, haircare, makeup, hair color, hair styling, men's grooming, suncare, fragrance
- A <div id="productsContainer" class="products-grid">
- A .selected-products section with: a header row containing "Selected Products" h2 and a #clearAllBtn (hidden by default), a <div id="selectedProductsList">, and a #generateRoutine button with a wand-magic-sparkles icon
- A .chatbox section with: h2 "About Your Routine", a <div id="chatWindow" class="chat-window"> with a placeholder message, and a #chatForm with: #userInput text input, a #webSearchToggle globe button, and a submit #sendBtn with paper-plane icon
- Standard footer with copyright and Privacy/Terms/Contact links

### 2. style.css  
At the very top, declare these CSS custom properties on :root:
--brand-red: #ff003b, --brand-gold: #e3a535, --brand-black: #0a0a0a, --brand-white: #ffffff, --surface-1: #fafafa, --surface-2: #f3f3f3, --border-light: #e8e8e8, --border-dark: #1a1a1a, --text-primary: #0a0a0a, --text-secondary: #6b6b6b, --text-muted: #a0a0a0, --selected-glow: rgba(255,0,59,0.15), --card-shadow: 0 2px 12px rgba(0,0,0,0.07), --card-shadow-hover: 0 8px 32px rgba(0,0,0,0.13), --transition-fast: 0.18s ease, --transition-med: 0.3s cubic-bezier(0.4,0,0.2,1), --radius-sm: 4px, --radius-md: 8px, --radius-lg: 12px, --font-display: 'Montserrat', Arial, sans-serif

Implement styles for:
- Page wrapper max-width 900px centered, with a fadeUp animation on load
- Header centered with logo, h1, red accent line, and RTL toggle button (pill-shaped border, hover fills black)
- Search bar wrapper with position:relative, absolutely-positioned left icon, full-width input with left padding to clear icon, red border on focus
- Category select: full width, 16px padding, custom red arrow, border turns red on focus
- Products grid: CSS grid auto-fill minmax(260px,1fr) gap 20px
- Product cards: white bg, border-light border, radius-lg, overflow:hidden, pointer cursor, box-shadow, hover: translateY(-3px) + heavier shadow; data-selected="true": red border + selected-glow bg
  - .card-select-indicator: absolute top-left, 24px red circle with white checkmark, hidden by default (opacity:0, scale 0.6), shown when data-selected="true" (opacity:1, scale 1)
  - .product-img-wrapper: 170px height, surface-1 bg, flex center, relative
  - img: max-height 130px, object-fit contain, scale(1.04) on card hover
  - .desc-toggle-btn: absolute top-right 8px, small circle white bg button with info icon, hover turns red
  - .product-desc-overlay: absolute inset:0, dark semi-transparent bg, white text, hidden (opacity:0 translateY(6px)), visible class shows it (opacity:1 translateY(0))
  - .product-info: padding 14px 16px, flex column gap 5px; .product-brand in brand-red, uppercase, small; .product-name 14px font-weight 600; .product-category-tag: pill chip surface-2 bg
- Selected products section: border-dark 1.5px border, radius-lg, padding 24px
  - Header row: flex space-between; clear button: pill shape, muted color, hover turns red
  - Chips: inline-flex, surface-2 bg, pill border-radius, 32px product thumbnail, name text, red × button on hover
  - chipIn keyframe animation for appearing chips
  - no-selection-msg: muted color, 14px
- Generate button: full width, brand-red bg, white text, uppercase font-weight 700, red glow box-shadow, hover darkens red + lifts; shake keyframe animation
- Chatbox: border-dark border, radius-lg, white bg; chat-window: height 320px overflow-y auto, surface-1 bg, flex column gap 12px
  - User messages: flex justify-end, black bubble, rounded 18px 18px 4px 18px
  - Assistant messages: flex justify-start, white bubble with border, rounded 18px 18px 18px 4px; ai-label in brand-red small caps
  - Typing dots: 3 spans, dot-bounce keyframe animation with staggered delays
  - Chat form: flex row gap 10px; input rounded pill, red border focus; submit button: red circle 44px; web search button: surface-2 circle, .active state: gold bg
- Toast: fixed bottom center, translateY animation, black pill
- RTL rules: [dir="rtl"] selectors to flip search icon, chip flex, user message bubble, chat form, card indicator position, desc button position, product info text-align
- Responsive: below 640px, grid minmax 160px, message bubble max-width 95%

### 3. script.js
Implement the complete application logic. Use vanilla ES6+ (no frameworks). Here is the exact architecture:

CONSTANTS:
- WORKER_URL = "https://fluxbotcca.elijah-bent.workers.dev"
- STORAGE_KEY = "loreal_selected_ids"
- STORAGE_RTL_KEY = "loreal_rtl"
- SYSTEM_PROMPT = a luxury beauty advisor prompt that: creates step-by-step AM/PM routines from ONLY selected products, explains key ingredients at each step, uses ☀️/🌙 emojis, keeps responses under 400 words for routines and 200 for follow-ups, ONLY answers beauty-related follow-up questions, always references specific selected products

STATE VARIABLES:
- allProducts (array), selectedIds (Set of numeric IDs), conversationHistory (array), webSearchEnabled (boolean), searchDebounce (timer)

FUNCTIONS TO IMPLEMENT:

init() — async, load all products once into allProducts, call restoreChips(), call renderProducts()

loadProducts() — fetch products.json, return data.products array

getFilteredProducts() — returns allProducts filtered by both category (categoryFilter.value) and search term (productSearch.value) — match name, description, or brand case-insensitively

renderProducts() — call getFilteredProducts(), if empty show empty-state div, else map each product to a card HTML string with: data-id, data-selected attributes, .card-select-indicator div, .product-img-wrapper with img + .desc-toggle-btn + .product-desc-overlay, .product-info with brand span + h3 name + category tag. Bind click events on each .product-card, bind click events on each .desc-toggle-btn.

handleCardClick(e) — if clicked target is .desc-toggle-btn or .product-desc-overlay, return early. Otherwise toggle id in selectedIds, update card's data-selected attribute, call saveSelections, call renderChips.

handleDescToggle(e) — e.stopPropagation(), get product id, find overlay by id "desc-{id}", close ALL other visible overlays first, then toggle the target overlay's "visible" class and aria-hidden.

renderChips() — if selectedIds empty, show no-selection-msg, hide clearAllBtn. Otherwise show clearAllBtn, map selectedIds to chip HTML with product image, name, and remove button. Bind remove buttons to delete from selectedIds, save, update card visual state, re-renderChips.

restoreChips() — just calls renderChips()

saveSelections(ids) — JSON.stringify spread of Set to localStorage

loadSelections() — parse from localStorage, return Set of Numbers, return empty Set on error

clearAllBtn click handler — clear selectedIds, save, update all card data-selected to false, renderChips, showToast

categoryFilter change — clear productSearch, renderProducts

productSearch input — debounce 150ms then renderProducts

callOpenAI(messages, useWebSearch=false) — fetch POST to WORKER_URL with { messages, ...(useWebSearch ? {tools:[{type:"web_search_preview"}]} : {}) }; handle both data.choices[0].message.content (standard) and data.output array (web search Responses API) response formats; throw on data.error

generateBtn click — if selectedIds empty: shake animation + toast. Else: build product list string, build userMessage asking for AM/PM routine, set conversationHistory to [system, user], clear chatWindow, showTypingIndicator, call callOpenAI, push assistant response to history, removeTypingIndicator, displayMessage.

chatForm submit — prevent default, get userInput value, clear input, displayMessage user, push to conversationHistory, showTypingIndicator, call callOpenAI with webSearchEnabled flag, push response to history, removeTypingIndicator, displayMessage assistant. Handle errors.

webSearchToggle click — toggle webSearchEnabled, toggle .active class, show toast

rtlToggle click — toggle dir between ltr/rtl, toggle lang between en/ar, save to localStorage, show toast

displayMessage(role, text) — remove .placeholder-message if present, create div with class "chat-message chat-message--{role}", convert **bold** to <strong>, convert \n to <br>, for assistant add ai-label span, append to chatWindow, scrollTo bottom smooth

showTypingIndicator() — create #typingIndicator div with 3 typing dots, append to chatWindow, scroll

removeTypingIndicator() — find and remove #typingIndicator

showToast(msg) — set toastEl text, add "show" class, clear old timer, setTimeout 3000ms to remove "show"

## CRITICAL REQUIREMENTS
1. The categoryFilter default option must have value="" (empty string, not disabled) so "All Categories" shows all products on page load
2. init() must load allProducts before calling renderProducts() — do not fetch products.json multiple times
3. selectedIds must be a Set of Numbers (use .map(Number) when loading from localStorage)
4. The .desc-toggle-btn click must call e.stopPropagation() to prevent card selection toggling
5. RTL CSS rules must cover: search icon position, chip flex-direction, user message bubble border-radius, chat-form flex-direction, card-select-indicator left/right, desc-toggle-btn left/right, product-info text-align
6. The callOpenAI function must handle BOTH the standard choices API response AND the output array format used by web search
7. After init(), products should be visible immediately (All Categories showing all products) without requiring the user to select a category
8. Remove all references to secrets.js — it should not be loaded

## AFTER IMPLEMENTATION
1. Verify clicking a product card shows the red border and check indicator
2. Verify the selected chip appears and persists after page reload
3. Verify "Generate Routine" produces an AI response in the chat window  
4. Verify follow-up questions maintain conversation context
5. Verify the RTL toggle flips the layout
6. Verify the search bar filters products in real time
7. Verify the ⓘ button shows the description overlay without selecting the card
8. Commit all changes, push to main, confirm GitHub Pages deployment at https://elijahbentdev.github.io/<repo-name>

Build the complete implementation now. Write all three files in full.
```
