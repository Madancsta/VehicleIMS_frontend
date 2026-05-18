import { useState, useEffect } from "react";
import { Link } from "../components/Link";
import { PageHeader } from "../components/PageHeader";
import {
  User,
  Car,
  Phone,
  Mail,
  MapPin,
  Award,
  DollarSign,
  CreditCard,
  ArrowLeft,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5229/api"
).replace(/\/$/, "");

function CustomerDetails() {
  const params = new URLSearchParams(window.location.search);
  const customerId = params.get("id");

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    if (!customerId) {
      setError("Customer ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await apiFetch(`/Customer/${customerId}`);
      setCustomer(data);
    } catch (err) {
      console.error("Failed to load customer:", err);
      setError("Customer not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Customer Details"
          description="View and manage customer information"
        />
        <div className="text-muted-foreground">Loading customer details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Customer Details"
          description="View and manage customer information"
          actions={
            <Link
              to="/admin/customers-report"
              className="px-4 h-10 rounded-md border border-border flex items-center gap-2 hover:bg-surface"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Customers
            </Link>
          }
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  const totalSpent = Number(customer.totalSpent || 0);
  const creditBalance = Number(customer.creditBalance || 0);
  const loyaltyPoints = Number(customer.loyaltyPoints || 0);
  const vehicles = customer.vehicles || [];
  const purchaseHistory = customer.purchaseHistory || [];

  return (
    <div>
      <PageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        description={`Customer ID: C-${customer.customerId}`}
        actions={
          <Link
            to="/admin/customers-report"
            className="px-4 h-10 rounded-md border border-border flex items-center gap-2 hover:bg-surface"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Total Spent
              </div>
              <div className="font-display text-2xl font-bold mt-2">
                Rs. {totalSpent.toLocaleString()}
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Credit Balance
              </div>
              <div
                className={`font-display text-2xl font-bold mt-2 ${
                  creditBalance > 0 ? "text-destructive" : ""
                }`}
              >
                Rs. {creditBalance.toLocaleString()}
              </div>
            </div>
            <CreditCard className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Loyalty Points
              </div>
              <div className="font-display text-2xl font-bold mt-2">
                {loyaltyPoints}
              </div>
            </div>
            <Award className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Profile Information
                </h2>
                <p className="text-sm text-muted-foreground">
                  Personal details and contact information
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField
                icon={User}
                label="Full Name"
                value={`${customer.firstName} ${customer.lastName}`}
              />
              <InfoField icon={Mail} label="Email" value={customer.email} />
              <InfoField
                icon={Phone}
                label="Phone Number"
                value={customer.phoneNumber}
              />
              <InfoField icon={MapPin} label="Address" value={customer.address} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-8 w-8" />
              <div>
                <div className="font-display text-lg font-semibold">
                  Loyalty Status
                </div>
                <div className="text-sm opacity-80">
                  {loyaltyPoints >= 100
                    ? "Gold Member"
                    : loyaltyPoints >= 50
                    ? "Silver Member"
                    : "Regular Customer"}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-primary-foreground/20">
              <div className="text-sm opacity-80">
                {loyaltyPoints >= 100
                  ? "Maximum tier reached"
                  : `${100 - loyaltyPoints} points to Gold`}
              </div>

              <div className="mt-2 h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{
                    width: `${Math.min((loyaltyPoints / 100) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border">
          <h2 className="font-display text-xl font-semibold">Vehicles</h2>
          <p className="text-sm text-muted-foreground">
            Registered vehicles for this customer
          </p>
        </div>

        <div className="p-6">
          {vehicles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No vehicles registered yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.vehicleId}
                  className="border border-border rounded-lg p-4 hover:shadow-elegant transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-surface flex items-center justify-center">
                      <Car className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="font-medium">
                        {vehicle.brand} {vehicle.model}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {vehicle.vehicleNumber}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Color:</span>{" "}
                      {vehicle.color || "N/A"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Year:</span>{" "}
                      {vehicle.year || "N/A"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="font-display text-xl font-semibold">
            Purchase History
          </h2>
          <p className="text-sm text-muted-foreground">
            Sales and invoice records for this customer
          </p>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-3">Invoice</th>
                <th className="text-left px-6 py-3">Date</th>
                <th className="text-right px-6 py-3">Amount</th>
                <th className="text-left px-6 py-3">Payment Method</th>
                <th className="text-left px-6 py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {purchaseHistory.length > 0 ? (
                purchaseHistory.map((purchase) => (
                  <tr
                    key={purchase.salesId}
                    className="border-t border-border hover:bg-surface"
                  >
                    <td className="px-6 py-3 font-mono text-xs">
                      {purchase.invoiceNumber}
                    </td>
                    <td className="px-6 py-3">
                      {new Date(purchase.salesDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      Rs. {Number(purchase.salesAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      {purchase.paymentMethod || "N/A"}
                    </td>
                    <td className="px-6 py-3">
                      {purchase.paymentStatus || "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No purchase history found for this customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InfoField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-md bg-surface/50">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-sm font-medium mt-0.5">{value || "—"}</div>
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
    localStorage.getItem("token") || localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readApiResponse(res) {
  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Request failed.");
  }

  if (!text) return null;

  return JSON.parse(text);
}

export default CustomerDetails;