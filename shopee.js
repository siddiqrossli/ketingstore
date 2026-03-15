let productsData = [];
let currentSort = "relevance";

function formatPrice(price) {
  return `RM${price.toFixed(2)}`;
}

function renderProducts(items) {
  const container = document.getElementById("products");
  container.innerHTML = "";

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

function sortProducts(sortType) {
  let sorted = [...productsData];

  if (sortType === "price") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sortType === "topSales") {
    sorted.sort((a, b) => {
      const getSoldNumber = (soldText) => {
        const text = soldText.toLowerCase().replace(" sold", "");
        if (text.includes("k+")) return parseFloat(text) * 1000;
        if (text.includes("m+")) return parseFloat(text) * 1000000;
        return parseFloat(text) || 0;
      };
      return getSoldNumber(b.sold) - getSoldNumber(a.sold);
    });
  } else if (sortType === "latest") {
    sorted.sort((a, b) => b.order - a.order);
  } else {
    sorted.sort((a, b) => a.order - b.order);
  }

  renderProducts(sorted);
}

async function loadProducts() {
  try {
    const response = await fetch("items.json");
    productsData = await response.json();
    sortProducts(currentSort);
  } catch (error) {
    document.getElementById("products").innerHTML =
      "<p style='padding:20px; color:#ee4d2d;'>Failed to load products.</p>";
    console.error(error);
  }
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentSort = tab.dataset.sort;
    sortProducts(currentSort);
  });
});

loadProducts();
