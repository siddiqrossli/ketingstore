let productsData = [];
let currentSort = "relevance";
let currentSearch = "";

function formatPrice(price) {
  return `RM${price.toFixed(2)}`;
}

function getSoldNumber(soldText) {
  const text = soldText.toLowerCase().replace(" sold", "").trim();
  if (text.includes("k+")) return parseFloat(text) * 1000;
  if (text.includes("m+")) return parseFloat(text) * 1000000;
  return parseFloat(text) || 0;
}

function renderProducts(items) {
  const container = document.getElementById("products");
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = `<div class="empty-state">No products found.</div>`;
    return;
  }

  items.forEach(item => {
    const card = document.createElement("a");
    card.className = "product-card";
    card.href = item.link;
    card.target = "_blank";
    card.innerHTML = `
      <div class="product-image-wrap">
        <img src="${item.image}" alt="${item.title}" class="product-image">
      </div>
      <div class="product-body">
        <div class="badge-row">
          <span class="badge red">${item.badge1}</span>
          <span class="badge orange">${item.badge2}</span>
        </div>
        <div class="product-title">${item.title}</div>
        <div class="price-row">
          <div class="price">${formatPrice(item.price)}</div>
          <div class="discount">${item.discount}</div>
        </div>
        <div class="promo">${item.promo}</div>
        <div class="meta-row">
          <div class="rating">★ ${item.rating}</div>
          <div class="sold">${item.sold}</div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function applyFiltersAndSort() {
  let filtered = [...productsData];

  if (currentSearch.trim()) {
    const keyword = currentSearch.toLowerCase();
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(keyword)
    );
  }

  if (currentSort === "price") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === "topSales") {
    filtered.sort((a, b) => getSoldNumber(b.sold) - getSoldNumber(a.sold));
  } else if (currentSort === "latest") {
    filtered.sort((a, b) => b.order - a.order);
  } else {
    filtered.sort((a, b) => a.order - b.order);
  }

  renderProducts(filtered);
}

async function loadProducts() {
  try {
    const response = await fetch("items.json");
    productsData = await response.json();
    applyFiltersAndSort();
  } catch (error) {
    document.getElementById("products").innerHTML =
      "<div class='empty-state'>Failed to load products.</div>";
    console.error(error);
  }
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentSort = tab.dataset.sort;
    applyFiltersAndSort();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value;
    applyFiltersAndSort();
  });

  loadProducts();
});
