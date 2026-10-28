const databaseStatus = document.querySelector("#database-status");
const lookupForm = document.querySelector("#lookup-form");
const lookupButton = lookupForm.querySelector('button[type="submit"]');
const lookupMessage = document.querySelector("#lookup-message");
const lookupResult = document.querySelector("#lookup-result");
const adminLoginForm = document.querySelector("#admin-login-form");
const adminMessage = document.querySelector("#admin-message");
const adminOrders = document.querySelector("#admin-orders");
const ordersTableBody = document.querySelector("#orders-table-body");
const adminLogout = document.querySelector("#admin-logout");
const refreshOrders = document.querySelector("#refresh-orders");
const previousOrders = document.querySelector("#previous-orders");
const nextOrders = document.querySelector("#next-orders");
const ordersPageLabel = document.querySelector("#orders-page-label");
const ORDERS_PER_PAGE = 50;
let currentOrdersPage = 0;
let hasNextOrdersPage = false;
const orderStatusLabels = {
  pending: "Menunggu konfirmasi",
  confirmed: "Dikonfirmasi",
  active: "Sedang berjalan",
  completed: "Selesai",
  cancelled: "Dibatalkan"
};
const paymentStatusLabels = {
  unverified: "Belum diverifikasi",
  pending: "Menunggu pembayaran",
  paid: "Dibayar",
  failed: "Gagal",
  expired: "Kedaluwarsa"
};

function setMessage(element, message, kind = "") {
  element.textContent = message;
  element.dataset.kind = kind;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function addDetail(list, label, value) {
  const term = document.createElement("dt");
  term.textContent = label;
  const description = document.createElement("dd");
  description.textContent = value;
  list.append(term, description);
}

function renderLookupResult(order) {
  lookupResult.replaceChildren();
  if (!order) {
    setMessage(lookupMessage, "Pesanan tidak ditemukan. Periksa kembali nomor referensi dan WhatsApp.", "error");
    return;
  }

  setMessage(lookupMessage, "Pesanan ditemukan.", "success");
  const card = document.createElement("article");
  card.className = "lookup-card";
  const heading = document.createElement("h3");
  heading.textContent = `Pesanan ${order.reference}`;
  const details = document.createElement("dl");
  addDetail(details, "Pelanggan", order.customer_name);
  addDetail(details, "Mobil", order.car_name);
  addDetail(details, "Periode", `${formatDate(order.pickup_date)} – ${formatDate(order.return_date)}`);
  addDetail(details, "Durasi", `${order.rental_days} hari`);
  addDetail(details, "Tarif per hari", formatCurrency(order.daily_price));
  addDetail(details, "Total", formatCurrency(order.total_amount));
  addDetail(details, "Metode pembayaran", order.payment_bank
    ? `${order.payment_method} (${order.payment_bank})`
    : order.payment_method);
  addDetail(details, "Status pesanan", orderStatusLabels[order.order_status] || order.order_status);
  addDetail(details, "Status pembayaran", paymentStatusLabels[order.payment_status] || order.payment_status);
  card.append(heading, details);
  lookupResult.append(card);
}

function addCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value;
  row.append(cell);
}

function renderAdminOrders(orders) {
  ordersTableBody.replaceChildren();
  if (!orders.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "orders-empty";
    cell.colSpan = 10;
    cell.textContent = "Belum ada riwayat pesanan.";
    row.append(cell);
    ordersTableBody.append(row);
    return;
  }

  orders.forEach((order) => {
    const row = document.createElement("tr");
    addCell(row, formatDateTime(order.created_at));
    addCell(row, order.reference);
    addCell(row, `${order.customer_name} · ${order.customer_phone}`);
    addCell(row, order.car_name);
    addCell(row, `${formatDate(order.pickup_date)} – ${formatDate(order.return_date)}`);
    addCell(row, `${order.rental_days} hari`);
    addCell(row, formatCurrency(order.daily_price));
    addCell(row, formatCurrency(order.total_amount));
    addCell(row, order.payment_bank ? `${order.payment_method} (${order.payment_bank})` : order.payment_method);
    addCell(row, `${orderStatusLabels[order.order_status] || order.order_status} / ${paymentStatusLabels[order.payment_status] || order.payment_status}`);
    ordersTableBody.append(row);
  });
}

async function loadAdminOrders() {
  refreshOrders.disabled = true;
  setMessage(adminMessage, "Memuat riwayat rental...");
  try {
    const result = await window.RentalDatabase.listOrders(currentOrdersPage * ORDERS_PER_PAGE, ORDERS_PER_PAGE);
    renderAdminOrders(result.orders);
    hasNextOrdersPage = result.hasNext;
    previousOrders.disabled = currentOrdersPage === 0;
    nextOrders.disabled = !hasNextOrdersPage;
    ordersPageLabel.textContent = `Halaman ${currentOrdersPage + 1}`;
    setMessage(adminMessage, `${result.orders.length} pesanan ditampilkan di halaman ini.`, "success");
  } catch (error) {
    setMessage(adminMessage, `Riwayat gagal dimuat: ${error.message}`, "error");
  } finally {
    refreshOrders.disabled = false;
  }
}

if (!window.RentalDatabase?.isConfigured()) {
  databaseStatus.textContent = "Database belum terhubung. Isi konfigurasi Supabase dan jalankan SQL schema untuk mengaktifkan cek pesanan serta riwayat admin.";
  lookupButton.disabled = true;
  adminLoginForm.querySelector('button[type="submit"]').disabled = true;
} else {
  databaseStatus.textContent = "Database terhubung. Pesanan online dapat dicari dengan referensi dan WhatsApp.";
  databaseStatus.dataset.kind = "success";
}

lookupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!window.RentalDatabase?.isConfigured()) {
    setMessage(lookupMessage, "Cek pesanan belum tersedia karena Supabase belum dikonfigurasi.", "error");
    return;
  }

  const formData = new FormData(lookupForm);
  lookupButton.disabled = true;
  lookupResult.replaceChildren();
  setMessage(lookupMessage, "Mencari pesanan...");
  try {
    const order = await window.RentalDatabase.lookupOrder(formData.get("reference"), formData.get("phone"));
    renderLookupResult(order);
  } catch (error) {
    setMessage(lookupMessage, `Pencarian gagal: ${error.message}`, "error");
  } finally {
    lookupButton.disabled = false;
  }
});

adminLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!window.RentalDatabase?.isConfigured()) {
    setMessage(adminMessage, "Login admin belum tersedia karena Supabase belum dikonfigurasi.", "error");
    return;
  }

  const submitButton = adminLoginForm.querySelector('button[type="submit"]');
  const formData = new FormData(adminLoginForm);
  submitButton.disabled = true;
  setMessage(adminMessage, "Memeriksa akun...");
  try {
    const session = await window.RentalDatabase.signInAdmin(formData.get("email"), formData.get("password"));
    if (session?.user?.app_metadata?.role !== "admin") {
      await window.RentalDatabase.signOutAdmin();
      throw new Error("Akun ini belum diberi peran admin.");
    }
    adminLoginForm.hidden = true;
    adminOrders.hidden = false;
    adminLoginForm.reset();
    await loadAdminOrders();
  } catch (error) {
    setMessage(adminMessage, `Login gagal: ${error.message}`, "error");
  } finally {
    submitButton.disabled = false;
  }
});

refreshOrders.addEventListener("click", loadAdminOrders);

previousOrders.addEventListener("click", () => {
  if (currentOrdersPage === 0) return;
  currentOrdersPage--;
  loadAdminOrders();
});

nextOrders.addEventListener("click", () => {
  if (!hasNextOrdersPage) return;
  currentOrdersPage++;
  loadAdminOrders();
});

adminLogout.addEventListener("click", async () => {
  adminLogout.disabled = true;
  try {
    await window.RentalDatabase.signOutAdmin();
    adminOrders.hidden = true;
    adminLoginForm.hidden = false;
    setMessage(adminMessage, "Kamu sudah keluar dari halaman admin.");
  } catch (error) {
    setMessage(adminMessage, `Gagal keluar: ${error.message}`, "error");
  } finally {
    adminLogout.disabled = false;
  }
});

if (window.RentalDatabase?.isConfigured()) {
  window.RentalDatabase.getAdminSession().then((session) => {
    if (session?.user?.app_metadata?.role === "admin") {
      adminLoginForm.hidden = true;
      adminOrders.hidden = false;
      loadAdminOrders();
    }
  }).catch((error) => {
    setMessage(adminMessage, `Status login admin gagal diperiksa: ${error.message}`, "error");
  });
}
