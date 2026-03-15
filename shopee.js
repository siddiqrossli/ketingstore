let productsData = [];
let currentSort = "relevance";
let currentSearch = "";
let priceAscending = true;

function formatPrice(price) {
  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice)) return "";
  return `RM${numericPrice.toFixed(2)}`;
}

function getSoldNumber(soldText = "") {
  const text = String(soldText).toLowerCase().replace(" sold", "").trim();

  if (text.includes("k+")) return parseFloat(text) * 1000;
  if (text.includes("m+")) return parseFloat(text) * 1000000;

  return parseFloat(text) || 0;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function updatePriceArrow() {
  const arrow = document.getElementById("priceArrow");
  if (!arrow) return;

  if (currentSort !== "price") {
    arrow.className = "fa-solid fa-sort";
    return;
  }

  arrow.className = priceAscending
    ? "fa-solid fa-sort-up"
    : "fa-solid fa-sort-down";
}

function renderProducts(items) {
  const container = document.getElementById("products");
  container.innerHTML = "";

  if (!items || items.length === 0) {
    container.innerHTML = `<div class="empty-state">No products found.</div>`;
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("a");
    card.className = "product-card";
    card.href = item.link || "#";
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const badge1Html = item.badge1
      ? `<span class="badge red">${escapeHtml(item.badge1)}</span>`
      : "";

    const badge2Html = item.badge2
      ? `<span class="badge orange">${escapeHtml(item.badge2)}</span>`
      : "";

    const badgeRowHtml =
      badge1Html || badge2Html
        ? `<div class="badge-row">${badge1Html}${badge2Html}</div>`
        : "";

    const priceHtml =
      item.price !== undefined && item.price !== null && item.price !== ""
        ? `<div class="price">${formatPrice(item.price)}</div>`
        : "";

    const discountHtml = item.discount
      ? `<div class="discount">${escapeHtml(item.discount)}</div>`
      : "";

    const priceRowHtml =
      priceHtml || discountHtml
        ? `<div class="price-row">${priceHtml}${discountHtml}</div>`
        : "";

    const promoHtml = item.promo
      ? `<div class="promo">${escapeHtml(item.promo)}</div>`
      : "";

    const ratingHtml = item.rating
      ? `<div class="rating">★ ${escapeHtml(item.rating)}</div>`
      : `<div class="rating">★ -</div>`;

    const soldHtml = item.sold
      ? `<div class="sold">${escapeHtml(item.sold)}</div>`
      : `<div class="sold">-</div>`;

    card.innerHTML = `
      <div class="product-image-wrap">
        <img
          src="${escapeHtml(item.image || "")}"
          alt="${escapeHtml(item.title || "Product image")}"
          class="product-image"
        >
      </div>
      <div class="product-body">
        ${badgeRowHtml}
        <div class="product-title">${escapeHtml(item.title || "Untitled product")}</div>
        ${priceRowHtml}
        ${promoHtml}
        <div class="meta-row">
          ${ratingHtml}
          ${soldHtml}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function applyFiltersAndSort() {
  let filtered = [...productsData];

  if (currentSearch.trim()) {
    const keyword = currentSearch.toLowerCase().trim();
    filtered = filtered.filter((item) =>
      String(item.title || "").toLowerCase().includes(keyword)
    );
  }

  if (currentSort === "price") {
    if (priceAscending) {
      filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else {
      filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }
  } else if (currentSort === "topSales") {
    filtered.sort((a, b) => getSoldNumber(b.sold) - getSoldNumber(a.sold));
  } else if (currentSort === "latest") {
    filtered.sort((a, b) => Number(b.order || 0) - Number(a.order || 0));
  } else {
    filtered.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  }

  renderProducts(filtered);
}

async function loadProducts() {
  try {
    const response = await fetch("items.json");

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    productsData = await response.json();
    updatePriceArrow();
    applyFiltersAndSort();
  } catch (error) {
    document.getElementById("products").innerHTML =
      "<div class='empty-state'>Failed to load products.</div>";
    console.error("Error loading products:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.dataset.sort === "price") {
        if (currentSort === "price") {
          priceAscending = !priceAscending;
        } else {
          priceAscending = true;
        }
      }

      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentSort = tab.dataset.sort;

      updatePriceArrow();
      applyFiltersAndSort();
    });
  });

  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value;
      applyFiltersAndSort();
    });
  }

  loadProducts();
});
