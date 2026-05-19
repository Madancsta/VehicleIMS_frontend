import { PageHeader } from "../components/PageHeader";
import { useEffect, useState } from "react";
import { ChevronRight, Phone, Mail, MapPin, Car, ShoppingBag, Calendar, CreditCard, Receipt } from "lucide-react";
import { apiFetch } from '../api/clientApi';

// API functions
function getAllCustomers() {
  return apiFetch("/customers");
}

function getCustomerDetails(id) {
  return apiFetch(`/customers/${id}`);
}

function getCustomerPurchaseHistory(customerId) {
  return apiFetch(`/customer/purchase-history/${customerId}`);
}

function CustomerHistory() {
  const [customers, setCustomers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchCustomerDetails(selectedId);
      fetchPurchaseHistory(selectedId);
    }
  }, [selectedId]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllCustomers();
      const customersList = Array.isArray(data) ? data : data?.items || data?.$values || [];
      
      setCustomers(customersList);

      if (customersList.length > 0) {
        setSelectedId(customersList[0].customerId);
      }
    } catch (err) {
      console.error(err);
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        setError("Unauthorized access. Please login with Admin or Staff credentials.");
      } else {
        setError("Failed to load customers. Make sure backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (id) => {
    try {
      setDetailsLoading(true);
      const data = await getCustomerDetails(id);
      setSelectedCustomer(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load customer details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchPurchaseHistory = async (customerId) => {
    try {
      setHistoryLoading(true);
      const data = await getCustomerPurchaseHistory(customerId);
      setPurchaseHistory(data);
    } catch (err) {
      console.error("Failed to load purchase history:", err);
      // Don't set main error, just log it
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Customer History"
          description="Detailed view of customer profile, vehicles and purchases."
        />

        <div className="text-muted-foreground">
          Loading customers...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Customer History"
          description="Detailed view of customer profile, vehicles and purchases."
        />

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-600">
          {error}
          {error.includes("Unauthorized") && (
            <div className="mt-4">
              <button 
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const c = selectedCustomer;
  const vehicles = c?.vehicles || [];
  const history = purchaseHistory;
  const orders = history?.orders || [];
  const summary = history?.purchaseSummary;

  return (
    <div>
      <PageHeader
        title="Customer History"
        description="Detailed view of customer profile, vehicles and purchases."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customers List */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            All Customers
          </div>

          <div>
            {customers.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No customers found.
              </div>
            ) : (
              customers.map((customer) => (
                <button
                  key={customer.customerId}
                  onClick={() => setSelectedId(customer.customerId)}
                  className={`w-full text-left px-4 py-3 border-b border-border last:border-0 flex items-center justify-between ${
                    selectedId === customer.customerId
                      ? "bg-surface"
                      : "hover:bg-surface/50"
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium">
                      {customer.firstName} {customer.lastName}
                    </div>

                    <div className="text-xs text-muted-foreground font-mono">
                      C-{customer.customerId}
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Customer Details and Purchase History */}
        <div className="col-span-2 space-y-6">
          {detailsLoading || !c ? (
            <div className="bg-card border border-border rounded-lg p-6 text-muted-foreground">
              Loading customer details...
            </div>
          ) : (
            <>
              {/* Customer Profile */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display text-2xl font-bold">
                      {c.firstName} {c.lastName}
                    </div>

                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      C-{c.customerId}
                    </div>
                  </div>

                  {c.loyaltyPoints >= 50 && (
                    <span className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full">
                      Loyalty member
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {c.phoneNumber || "N/A"}
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {c.email || "N/A"}
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {c.address || "N/A"}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <Stat
                    label="Total Spent"
                    value={`Rs. ${(summary?.totalSpent || c.totalSpent || 0).toLocaleString()}`}
                  />

                  <Stat
                    label="Outstanding Credit"
                    value={`Rs. ${(c.creditBalance || 0).toLocaleString()}`}
                    accent={(c.creditBalance || 0) > 0}
                  />
                  <Stat
                    label="Loyalty Points"
                    value={c.loyaltyPoints || 0}
                  />
                </div>
              </div>

              {/* Vehicles */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Vehicles
                </div>

                {vehicles.length ? (
                  vehicles.map((vehicle) => (
                    <div
                      key={vehicle.vehicleId}
                      className="p-4 rounded-md border border-border mb-2 last:mb-0"
                    >
                      <div className="font-medium">
                        {vehicle.brand} {vehicle.model} ({vehicle.year})
                      </div>

                      <div className="text-xs text-muted-foreground font-mono mt-1">
                        {vehicle.vehicleNumber} · {vehicle.color}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No vehicles registered.
                  </div>
                )}
              </div>

              {/* Purchase History */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-6 border-b border-border font-display font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Purchase History
                  </div>
                  {summary && (
                    <div className="text-sm text-muted-foreground font-normal">
                      Total Orders: {summary.totalOrders} | Total Spent: Rs. {summary.totalSpent?.toLocaleString()}
                    </div>
                  )}
                </div>

                {historyLoading ? (
                  <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                    Loading purchase history...
                  </div>
                ) : orders.length > 0 ? (
                  <div className="divide-y divide-border">
                    {orders.map((order) => (
                      <div key={order.salesId} className="p-6 hover:bg-surface/30 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Receipt className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono font-semibold">{order.invoiceNumber}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                order.paymentStatus === "Completed" 
                                  ? "bg-green-100 text-green-700" 
                                  : order.paymentStatus === "Pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {order.paymentMethod}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              Rs. {order.salesAmount?.toLocaleString()}
                            </div>
                            {order.discount > 0 && (
                              <div className="text-xs text-green-600">
                                Saved: Rs. {order.discount.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(order.salesDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CreditCard className="h-3.5 w-3.5" />
                            {order.paymentMethod}
                          </div>
                        </div>

                        {order.serviceInfo && (
                          <div className="mt-3 text-sm bg-surface rounded-md p-3">
                            <span className="font-medium">Service:</span> {order.serviceInfo.serviceType} 
                            {order.serviceInfo.serviceCharge && ` (Rs. ${order.serviceInfo.serviceCharge.toLocaleString()})`}
                          </div>
                        )}

                        {order.itemCount > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {order.itemCount} item(s) in this order
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center text-muted-foreground">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No purchase history found for this customer.</p>
                    <p className="text-sm mt-1">Sales will appear here once the customer makes purchases.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="p-3 rounded-md bg-surface">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>

      <div
        className={`font-display text-xl font-bold mt-1 ${
          accent ? "text-destructive" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: getAuthHeaders(options.headers),
  });

  return readApiResponse(res);
}

function getAuthHeaders(headers = {}) {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readApiResponse(res) {
  const text = await res.text();

  if (!res.ok) {
    let errorMessage = text || "Request failed.";

    try {
      const parsed = JSON.parse(text);

      errorMessage =
        parsed.message ||
        parsed.Message ||
        parsed.title ||
        errorMessage;
    } catch {}

    throw new Error(errorMessage);
  }

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getCustomers() {
  return apiFetch("/Customer");
}

function getCustomerById(id) {
  return apiFetch(`/Customer/${id}`);
}

export default CustomerHistory;