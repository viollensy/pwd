(function () {
  const config = window.RODARENT_SUPABASE_CONFIG || {};
  const supabaseLibrary = window.supabase;
  const client = config.url && config.anonKey && supabaseLibrary
    ? supabaseLibrary.createClient(config.url, config.anonKey)
    : null;

  function requireClient() {
    if (!client) {
      throw new Error("Database belum dikonfigurasi. Isi URL dan anon key Supabase di assets/supabase-config.js.");
    }
    return client;
  }

  async function createOrder(order) {
    const { data, error } = await requireClient().rpc("create_rental_order", {
      p_customer_name: order.customerName,
      p_customer_phone: order.customerPhone,
      p_car_name: order.carName,
      p_pickup_date: order.pickupDate,
      p_return_date: order.returnDate,
      p_payment_method: order.paymentMethod,
      p_payment_bank: order.paymentBank || null
    });
    if (error) throw error;
    return data;
  }

  async function lookupOrder(reference, phone) {
    const { data, error } = await requireClient().rpc("lookup_rental_order", {
      p_reference: reference.trim(),
      p_phone: phone.trim()
    });
    if (error) throw error;
    return data;
  }

  async function signInAdmin(email, password) {
    const { data, error } = await requireClient().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  }

  async function getAdminSession() {
    const { data, error } = await requireClient().auth.getSession();
    if (error) throw error;
    return data.session;
  }

  async function signOutAdmin() {
    const { error } = await requireClient().auth.signOut();
    if (error) throw error;
  }

  async function listOrders(offset = 0, pageSize = 50) {
    const { data, error } = await requireClient()
      .from("rental_orders")
      .select("reference, customer_name, customer_phone, car_name, pickup_date, return_date, rental_days, daily_price, total_amount, payment_method, payment_bank, payment_status, order_status, created_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize);
    if (error) throw error;
    return {
      orders: data.slice(0, pageSize),
      hasNext: data.length > pageSize
    };
  }

  window.RentalDatabase = {
    isConfigured: () => Boolean(client),
    createOrder,
    lookupOrder,
    signInAdmin,
    getAdminSession,
    signOutAdmin,
    listOrders
  };
})();
