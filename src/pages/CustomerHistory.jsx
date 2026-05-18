import { PageHeader } from "../components/PageHeader";
import { useEffect, useState } from "react";
import { ChevronRight, Phone, Mail, MapPin, Car } from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5229/api"
).replace(/\/$/, "");

function CustomerHistory() {
  const [customers, setCustomers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchCustomerDetails(selectedId);
    }
  }, [selectedId]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomers();

      setCustomers(data);

      if (data.length > 0) {
        setSelectedId(data[0].customerId);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load customers. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (id) => {
    try {
      setDetailsLoading(true);

      const data = await getCustomerById(id);

      setSelectedCustomer(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load customer details.");
    } finally {
      setDetailsLoading(false);
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
        </div>
      </div>
    );
  }

  const c = selectedCustomer;
  const vehicles = c?.vehicles || [];

  return (
    <div>
      <PageHeader
        title="Customer History"
        description="Detailed view of customer profile, vehicles and purchases."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        <div className="col-span-2 space-y-6">
          {detailsLoading || !c ? (
            <div className="bg-card border border-border rounded-lg p-6 text-muted-foreground">
              Loading customer details...
            </div>
          ) : (
            <>
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
                    value={`Rs. ${(c.totalSpent || 0).toLocaleString()}`}
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

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-6 border-b border-border font-display font-semibold">
                  Purchase History
                </div>

                <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                  Purchase history will appear here after sales/invoice data is connected.
                </div>
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