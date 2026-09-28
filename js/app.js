/* =====================================================
   VELLARO BILLING SYSTEM
   ===================================================== */

/* =====================================================
   1. PRODUCT PRICES

   CHANGE THESE TO YOUR REAL PRICES
   ===================================================== */

const tshirtSizes = {
  S: 2490,
  M: 2490,
  L: 2490,
  XL: 2490,
  "2XL": 2690,
  "3XL": 2890,
};

const tshirtSizeLabels = {
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  "2XL": "2XL",
  "3XL": "3XL",
};

const tshirtColors = ["Black", "White", "Red", "Blue", "Green"];

const products = {
  perfume: {
    label: "Vellaro Premium Perfume",
    sizes: {
      50: 2990,
      100: 4990,
    },
    colors: ["Not applicable"],
    sizeLabels: {
      50: "50ml",
      100: "100ml",
    },
  },

  tshirt10: {
    label: "VELLARO 1.0 T shirt",
    sizes: tshirtSizes,
    colors: tshirtColors,
    sizeLabels: tshirtSizeLabels,
  },
  tshirt11: {
    label: "VELLARO 1.1 T shirt",
    sizes: tshirtSizes,
    colors: tshirtColors,
    sizeLabels: tshirtSizeLabels,
  },
  tshirtPolo: {
    label: "VELLARO POLO Limited Edition T shirt",
    sizes: tshirtSizes,
    colors: tshirtColors,
    sizeLabels: tshirtSizeLabels,
  },
  tshirtBackPrint: {
    label: "VELLARO Back Print T shirt",
    sizes: tshirtSizes,
    colors: tshirtColors,
    sizeLabels: tshirtSizeLabels,
  },
  tshirtStitchPrint: {
    label: "VELLARO Stitch Print Limited Edition T shirt",
    sizes: tshirtSizes,
    colors: tshirtColors,
    sizeLabels: tshirtSizeLabels,
  },
  tshirtCropTop: {
    label: "VELLARO Crop Top",
    sizes: tshirtSizes,
    colors: tshirtColors,
    sizeLabels: tshirtSizeLabels,
  },
  tshirtBrink: {
    label: "Brink T shirt",
    sizes: tshirtSizes,
    colors: tshirtColors,
    sizeLabels: tshirtSizeLabels,
  },
  tshirtFrontPrint: {
    label: "VELLARO Front Print Oversized T shirt",
    sizes: tshirtSizes,
    colors: tshirtColors,
    sizeLabels: tshirtSizeLabels,
  },
};

/* =====================================================
   2. GLOBAL
   ===================================================== */

let currentBill = null;
let draftItems = [];

/* =====================================================
   3. SHORTCUT
   ===================================================== */

function $(id) {
  return document.getElementById(id);
}

/* =====================================================
   4. FORMAT MONEY
   ===================================================== */

function money(value) {
  return Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* =====================================================
   5. CURRENT DATE
   ===================================================== */

function setCurrentDate() {
  const date = new Date();

  $("currentDate").textContent = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* =====================================================
   6. GET BILLS
   ===================================================== */

function getBills() {
  return JSON.parse(localStorage.getItem("vellaroBills") || "[]");
}

/* =====================================================
   7. SAVE BILLS
   ===================================================== */

function saveBills(bills) {
  localStorage.setItem("vellaroBills", JSON.stringify(bills));
}

/* =====================================================
   8. NAVIGATION
   ===================================================== */

function showSection(sectionId) {
  document.querySelectorAll(".section").forEach((section) => {
    section.classList.remove("active");
  });

  $(sectionId).classList.add("active");

  const titles = {
    dashboardSection: "Dashboard",

    createSection: "Create Bill",

    historySection: "Bill History",

    previewSection: "Bill Preview",
  };

  $("pageTitle").textContent = titles[sectionId] || "Vellaro";

  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === sectionId);
  });
}

/* =====================================================
   9. UPDATE PRICE
   ===================================================== */

function updatePrice() {
  const size = $("size").value;
  const product = products[$("product").value];
  const price = product?.sizes[size] || 0;

  $("unitPrice").value = price;

  calculateTotal();
}

function updateProductOptions() {
  const product = products[$("product").value];
  const sizeSelect = $("size");
  const colorInput = $("color");

  sizeSelect.innerHTML = Object.entries(product.sizes)
    .map(
      ([value]) =>
        `<option value="${value}">${product.sizeLabels[value]}</option>`,
    )
    .join("");

  $("colorGroup").style.display = product.colors.length > 1 ? "flex" : "none";
  colorInput.disabled = product.colors.length <= 1;
  colorInput.value = product.colors.length > 1 ? "" : "Not applicable";

  updatePrice();
}

/* =====================================================
   10. CALCULATE TOTAL
   ===================================================== */

function calculateTotal() {
  const delivery = Math.max(0, Number($("deliveryFee").value) || 0);
  const subtotal = draftItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = Math.min(
    subtotal,
    Math.max(0, Number($("discount").value) || 0),
  );

  const grandTotal = subtotal - discount + delivery;

  $("subtotal").textContent = money(subtotal);

  $("discountDisplay").textContent = money(discount);

  const deliveryDisplay = $("deliveryDisplay");
  deliveryDisplay.textContent =
    delivery > 0 ? `LKR ${money(delivery)}` : "Free Delivery";
  deliveryDisplay.classList.toggle("free-delivery", delivery === 0);

  $("grandTotal").textContent = money(grandTotal);
}

function addItem() {
  const productKey = $("product").value;
  const product = products[productKey];
  const size = $("size").value;
  const quantity = Math.max(1, Number($("quantity").value) || 1);
  const unitPrice = Math.max(0, Number($("unitPrice").value) || 0);

  draftItems.push({
    product: product.label,
    productType: productKey,
    size: product.sizeLabels[size],
    color: $("color").value,
    quantity,
    unitPrice,
    subtotal: unitPrice * quantity,
  });

  renderAddedItems();
  calculateTotal();
}

function renderAddedItems() {
  const container = $("addedItems");

  if (draftItems.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <h4>ITEMS IN THIS BILL</h4>
    ${draftItems
      .map(
        (item, index) => `
          <div class="added-item">
            <span>
              <strong>${safe(item.product)}</strong>
              <small>${safe(item.size)}${item.color && item.color !== "Not applicable" ? ` | ${safe(item.color)}` : ""} | Qty ${item.quantity}</small>
            </span>
            <span>
              <strong>LKR ${money(item.subtotal)}</strong>
              <button class="btn-white remove-item-btn" data-index="${index}" type="button">REMOVE</button>
            </span>
          </div>
        `,
      )
      .join("")}
  `;
}

/* =====================================================
   11. GENERATE BILL NUMBER
   ===================================================== */

function nextBillNumber() {
  const bills = getBills();

  let highestNumber = 0;

  bills.forEach((bill) => {
    const number = Number(String(bill.billNo).replace("VL-", ""));

    if (Number.isFinite(number) && number > highestNumber) {
      highestNumber = number;
    }
  });

  return "VL-" + String(highestNumber + 1).padStart(5, "0");
}

function getEstimatedDelivery() {
  const start = new Date();
  const end = new Date();
  start.setDate(start.getDate() + 1);
  end.setDate(end.getDate() + 5);

  const fmt = (d) =>
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return `${fmt(start)} – ${fmt(end)}`;
}

/* =====================================================
   12. CREATE BILL
   ===================================================== */

function createBill() {
  const name = $("customerName").value.trim();

  const customerId = $("customerId").value.trim();

  const contact = $("customerContact").value.trim();

  const address = $("customerAddress").value.trim();
  const note = $("billNote").value.trim();

  if (!name || !contact || !address) {
    alert("Please enter customer name, contact number and address.");

    return;
  }

  if (draftItems.length === 0) {
    alert("Please add at least one item to the bill.");

    return;
  }

  const delivery = Math.max(0, Number($("deliveryFee").value) || 0);
  const subtotal = draftItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = Math.min(
    subtotal,
    Math.max(0, Number($("discount").value) || 0),
  );
  const subtotalAfterDiscount = subtotal - discount;
  const total = subtotalAfterDiscount + delivery;

  const bill = {
    billNo: nextBillNumber(),

    date: new Date().toLocaleDateString("en-GB"),
    time: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    customerId: customerId || "V" + Math.floor(1000 + Math.random() * 9000),
    estimatedDelivery: getEstimatedDelivery(),

    customer: {
      name: name,

      contact: contact,

      address: address,
    },

    items: draftItems,

    product: draftItems[0].product,

    productType: draftItems[0].productType,

    size: draftItems[0].size,

    color: draftItems[0].color,

    quantity: draftItems[0].quantity,

    unitPrice: draftItems[0].unitPrice,

    subtotal: subtotal,

    discount: discount,

    subtotalAfterDiscount: subtotalAfterDiscount,

    delivery: delivery,

    total: total,

    payment: $("paymentMethod").value,

    note: note,
  };

  const bills = getBills();

  bills.push(bill);

  saveBills(bills);

  currentBill = bill;

  showPreview(bill);

  updateDashboard();

  loadHistory();
}

/* =====================================================
   13. SHOW BILL PREVIEW
   ===================================================== */

function showPreview(bill) {
  $("previewBillNo").textContent = bill.billNo;
  $("previewDate").textContent = bill.date;
  $("previewTime").textContent = bill.time || "";
  $("previewName").textContent = bill.customer.name;
  $("previewContact").textContent = bill.customer.contact;
  $("previewAddress").textContent = bill.customer.address;
  $("previewCustomerId").textContent = bill.customerId || "—";
  $("previewPayment").textContent = bill.payment;
  $("previewDeliveryDate").textContent = bill.estimatedDelivery || "—";
  $("previewStatus").textContent = "Confirmed";
  const note = String(bill.note || "").trim();
  $("previewHeaderNote").textContent = note;
  $("previewHeaderNote").parentElement.style.display = note ? "" : "none";

  const items = bill.items?.length
    ? bill.items
    : [
        {
          product: bill.product,
          size: bill.size,
          color: bill.color,
          quantity: bill.quantity,
          unitPrice: bill.unitPrice,
          subtotal: bill.subtotal,
          discount: bill.discount,
        },
      ];
  const hasColor = items.some(
    (item) => item.color && item.color !== "Not applicable",
  );
  $("previewColorHeader").style.display = hasColor ? "" : "none";
  $("previewItems").innerHTML = items
    .map(
      (item) => `
        <tr>
          <td>${safe(item.product)}</td>
          <td>${safe(item.size)}</td>
          <td style="display:${hasColor ? "table-cell" : "none"}">${hasColor ? safe(item.color || "—") : ""}</td>
          <td>${safe(item.quantity)}</td>
          <td>Rs.${money(item.unitPrice)}</td>
          <td>–Rs.${money(item.discount || 0)}</td>
          <td><strong>Rs.${money(item.subtotal)}</strong></td>
        </tr>
      `,
    )
    .join("");
  $("previewDiscountTotal").textContent = money(bill.discount);
  $("previewSubtotal2").textContent = money(
    bill.subtotalAfterDiscount ?? bill.subtotal,
  );
  const previewDelivery = $("previewDelivery");
  previewDelivery.textContent =
    Number(bill.delivery) > 0 ? `Rs.${money(bill.delivery)}` : "Free Delivery";
  previewDelivery.classList.toggle(
    "free-delivery",
    Number(bill.delivery) === 0,
  );
  $("previewGrandTotal").textContent = money(bill.total);

  currentBill = bill;
  showSection("previewSection");
}

/* =====================================================
   14. CLEAR FORM
   ===================================================== */

function clearForm() {
  $("customerName").value = "";

  $("customerId").value = "";

  $("customerContact").value = "";

  $("customerAddress").value = "";

  $("billNote").value = "";

  $("product").value = "perfume";

  $("discount").value = 0;

  $("quantity").value = 1;

  $("deliveryFee").value = 0;

  $("paymentMethod").value = "Cash on Delivery";

  draftItems = [];
  renderAddedItems();

  updateProductOptions();
}

/* =====================================================
   15. HTML SECURITY
   ===================================================== */

function safe(text) {
  const div = document.createElement("div");

  div.textContent = String(text ?? "");

  return div.innerHTML;
}

/* =====================================================
   16. BILL HISTORY
   ===================================================== */

function loadHistory() {
  const bills = getBills();

  const table = $("historyTable");

  table.innerHTML = "";

  if (bills.length === 0) {
    table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty"
                >
                    No bills created yet.
                </td>

            </tr>

        `;

    return;
  }

  bills
    .slice()
    .reverse()
    .forEach((bill) => {
      const row = document.createElement("tr");

      row.innerHTML = `

                <td>
                    ${safe(bill.billNo)}
                </td>

                <td>
                    ${safe(bill.date)}
                </td>

                <td>
                    ${safe(bill.customer.name)}
                </td>

                <td>
                    ${safe(bill.size)}
                </td>

                <td>
                    LKR ${money(bill.total)}
                </td>

                <td>
                    <button
                        class="btn-black view-btn"
                        data-bill="${safe(bill.billNo)}"
                        style="padding:8px 12px"
                    >
                        VIEW
                    </button>

                      <button
                        class="btn-white delete-btn"
                        data-bill="${safe(bill.billNo)}"
                        style="padding:8px 12px"
                      >
                        DELETE
                      </button>

                </td>

            `;

      table.appendChild(row);
    });
}

/* =====================================================
   17. VIEW OLD BILL
   ===================================================== */

function viewBill(billNo) {
  const bills = getBills();

  const bill = bills.find((item) => item.billNo === billNo);

  if (bill) {
    showPreview(bill);
  }
}

function deleteBill(billNo) {
  const bills = getBills();
  const bill = bills.find((item) => item.billNo === billNo);

  if (
    !bill ||
    !window.confirm(`Delete bill ${billNo}? This cannot be undone.`)
  ) {
    return;
  }

  saveBills(bills.filter((item) => item.billNo !== billNo));

  if (currentBill && currentBill.billNo === billNo) {
    currentBill = null;
    showSection("historySection");
  }

  loadHistory();
  updateDashboard();
}

/* =====================================================
   18. DASHBOARD
   ===================================================== */

function updateDashboard() {
  const bills = getBills();

  $("totalBills").textContent = bills.length;

  const sales = bills.reduce((sum, bill) => sum + Number(bill.total || 0), 0);

  $("totalSales").textContent = money(sales);

  if (bills.length > 0) {
    $("latestBill").textContent = bills[bills.length - 1].billNo;
  } else {
    $("latestBill").textContent = "---";
  }
}

/* =====================================================
   19. DOWNLOAD BILL AS PNG
   ===================================================== */

async function downloadBillPNG() {
  if (!currentBill) {
    alert("Please create or select a bill first.");

    return;
  }

  if (typeof html2canvas === "undefined") {
    alert(
      "The image library could not be loaded. Please check your internet connection.",
    );

    return;
  }

  const bill = $("billPreview");

  try {
    const canvas = await html2canvas(bill, {
      scale: 3,

      backgroundColor: "#ffffff",

      useCORS: true,

      logging: false,
    });

    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");

    link.download = `VELLARO-${currentBill.billNo}.png`;

    link.href = image;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  } catch (error) {
    console.error(error);

    alert("Unable to download the bill image.");
  }
}

/* =====================================================
   20. EVENT LISTENERS
   ===================================================== */

document.querySelectorAll(".nav-btn").forEach((button) => {
  button.addEventListener("click", () => {
    showSection(button.dataset.section);
  });
});

$("product").addEventListener("change", updateProductOptions);

$("size").addEventListener("change", updatePrice);

$("unitPrice").addEventListener("input", calculateTotal);

$("quantity").addEventListener("input", calculateTotal);

$("discount").addEventListener("input", calculateTotal);

$("deliveryFee").addEventListener("input", calculateTotal);

$("addItemBtn").addEventListener("click", addItem);

$("createBillBtn").addEventListener("click", createBill);

$("clearBtn").addEventListener("click", clearForm);

$("downloadPngBtn").addEventListener("click", downloadBillPNG);

$("printBtn").addEventListener("click", () => {
  window.print();
});

$("newBillBtn").addEventListener("click", () => {
  clearForm();

  showSection("createSection");
});

$("historyTable").addEventListener("click", (event) => {
  const button = event.target.closest(".view-btn");
  const deleteButton = event.target.closest(".delete-btn");

  if (button) {
    viewBill(button.dataset.bill);
  }

  if (deleteButton) {
    deleteBill(deleteButton.dataset.bill);
  }
});

$("addedItems").addEventListener("click", (event) => {
  const button = event.target.closest(".remove-item-btn");

  if (button) {
    draftItems.splice(Number(button.dataset.index), 1);
    renderAddedItems();
    calculateTotal();
  }
});

/* =====================================================
   21. INITIALIZE
   ===================================================== */

setCurrentDate();

updateProductOptions();

loadHistory();

updateDashboard();
