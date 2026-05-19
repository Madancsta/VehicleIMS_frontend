import { useEffect, useState } from "react";
import {
  Award,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  History,
  PackageSearch,
  XCircle,
} from "lucide-react";
import { Link } from "../components/Link";
import CustomerLayout from "../components/CustomerLayout";
import { PageHeader } from "../components/PageHeader";
import { apiFetch } from "../api/clientApi";

function CustomerDashboard() {
  const customerId = localStorage.getItem("customerId");
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [partRequests, setPartRequests] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!customerId) {
      return;
    }

    async function loadDashboard() {
      try {
        const profileData = await getCustomerProfile(customerId);
        const vehicles = profileData?.vehicles || [];
        const bookingResults = await Promise.allSettled(
          vehicles
            .map((vehicle) => vehicle.vehicleId || vehicle.id)
            .filter(Boolean)
            .map((vehicleId) => getVehicleBookings(vehicleId)),
        );
        const bookingData = bookingResults.flatMap((result) =>
          result.status === "fulfilled" && Array.isArray(result.value) ? result.value : [],
        );
        const [requestResult] = await Promise.allSettled([getCustomerRequests(customerId)]);
        const requestData =
          requestResult.status === "fulfilled" ? normalizePartRequests(requestResult.value) : [];

        setProfile(profileData);
        setBookings(bookingData);
        setPartRequests(requestData);
      } catch (err) {
        setMessage(err.message || "Unable to load dashboard.");
      }
    }

    loadDashboard();
  }, [customerId]);

  const displayName = getDisplayName(profile);
  const totalSpent = Number(profile?.totalSpent || 0);
  const vehicles = profile?.vehicles || [];
  const bookingCounts = bookings.reduce(
    (counts, booking) => {
      const status = formatStatus(booking.bookingStatus ?? booking.status);

      if (status === "Pending" || status === "Completed" || status === "Failed") {
        counts[status] += 1;
      }

      return counts;
    },
    { Pending: 0, Completed: 0, Failed: 0 },
  );
  const pendingBookings = bookingCounts.Pending;
  const completedBookings = bookingCounts.Completed;
  const failedBookings = bookingCounts.Failed;
  const totalBookings = bookings.length;
  const discountUnlocked = totalSpent > 5000;
  const pageMessage = !customerId
    ? "Create a customer account before using the customer portal."
    : message;

  return (
    <CustomerLayout>
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description="Your service activity at a glance."
      />

      {pageMessage && <MessageBox message={pageMessage} />}

      {!customerId && (
        <Link
          to="/customer/register"
          className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Create account
        </Link>
      )}

      {customerId && (
        <>
          <div className="relative mb-6 overflow-hidden rounded-lg bg-primary p-8 text-primary-foreground">
            <div className="grid-bg absolute inset-0 opacity-20" />
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest opacity-60">Loyalty Program</div>
                <div className="font-display mt-2 text-3xl font-bold">
                  {discountUnlocked
                    ? "10% off eligible purchases"
                    : "Get 10% discount when a single purchase is above Rs. 5,000."}
                </div>
                <div className="mt-2 text-sm opacity-70">
                  {bookings.length} service records linked to your account
                </div>
              </div>
              <Award className="h-20 w-20 shrink-0 opacity-30" />
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              ["Total Spent", `Rs. ${totalSpent.toLocaleString()}`],
              ["Vehicles Registered", vehicles.length],
              ["Part Requests", partRequests.length],
            ].map(([label, value]) => (
              <div key={label} className="stat-card">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {label}
                </div>
                <div className="font-display mt-2 text-2xl font-bold">{value}</div>
              </div>
            ))}
          </div>

          <div className="mb-8 rounded-lg border border-border bg-card p-6">
            <div className="font-display mb-4 font-semibold">Booking Overview</div>

            {[
              ["Pending", pendingBookings, Clock, "bg-warning"],
              ["Completed", completedBookings, CheckCircle, "bg-success"],
              ["Failed", failedBookings, XCircle, "bg-destructive"],
            ].map(([label, count, Icon, fillClass]) => (
              <div key={label} className="mb-4 last:mb-0">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </div>
                  <span>{count}</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${fillClass}`}
                    style={{
                      width: totalBookings ? `${(count / totalBookings) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                to: "/customer/service",
                label: "Book Service",
                icon: Calendar,
              },
              {
                to: "/customer/profile",
                label: "My Vehicles",
                icon: Car,
              },
              {
                to: "/customer/service",
                label: "Requests & Reviews",
                icon: History,
              },
            ].map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.label}
                  to={action.to}
                  className="rounded-lg border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-elegant"
                >
                  <Icon className="mb-3 h-6 w-6" />
                  <div className="font-display font-semibold">{action.label}</div>
                </Link>
              );
            })}
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="font-display mb-4 flex items-center gap-2 font-semibold">
              <PackageSearch className="h-4 w-4" />
              <span>Recent Part Requests</span>
            </div>
            {partRequests.length > 0 ? (
              partRequests.slice(0, 2).map((request) => (
                <div
                  key={`${request.requestId}-${request.partId}`}
                  className="mb-2 flex items-center justify-between gap-4 rounded-md border border-border p-4 last:mb-0"
                >
                  <div>
                    <div className="font-medium">{request.partName}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Request #{request.requestId}
                      {request.bookingId ? ` - Booking #${request.bookingId}` : ""} - Qty{" "}
                      {request.quantity}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatDate(request.requestedDate)}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${requestStatusClass(
                      request.status,
                    )}`}
                  >
                    {formatRequestStatus(request.status)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No part requests yet.</p>
            )}
          </div>
        </>
      )}
    </CustomerLayout>
  );
}

function getDisplayName(profile) {
  if (!profile) {
    return "Customer";
  }

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ");

  return fullName || profile.userName || "Customer";
}

function MessageBox({ message }) {
  return (
    <div className="mb-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function getCustomerProfile(customerId) {
  return apiFetch(`/customers/${customerId}/profile`);
}

function getVehicleBookings(vehicleId) {
  return apiFetch(`/bookings/vehicle/${vehicleId}`);
}

function getCustomerRequests(customerId) {
  return apiFetch(`/requests/customer/${customerId}`);
}

function normalizePartRequests(data) {
  const rows = Array.isArray(data) ? data : data?.items || data?.requests || data?.$values || [];

  return rows
    .flatMap((request) => {
      const requestId = getValue(request, "requestId", "RequestId", "id", "Id");
      const bookingId = getValue(request, "bookingId", "BookingId");
      const requestedDate = getValue(request, "requestedDate", "RequestedDate");
      const status = getValue(request, "requestStatusId", "RequestStatusId", "status", "Status");
      const rawParts = getValue(request, "parts", "Parts", "requestParts", "RequestParts");
      const requestParts = Array.isArray(rawParts) ? rawParts : rawParts?.$values || [];

      if (!requestParts.length) {
        return [
          {
            requestId,
            bookingId,
            requestedDate,
            status,
            partId: getValue(request, "partId", "PartId"),
            partName: getValue(request, "partName", "PartName") || "Requested part",
            quantity: getValue(request, "requestQuantity", "RequestQuantity") || 1,
          },
        ];
      }

      return requestParts.map((part) => ({
        requestId,
        bookingId,
        requestedDate,
        status,
        partId: getValue(part, "partId", "PartId"),
        partName: getValue(part, "partName", "PartName") || "Requested part",
        quantity: getValue(part, "requestQuantity", "RequestQuantity") || 1,
      }));
    })
    .sort((a, b) => {
      const aDate = Date.parse(a.requestedDate) || 0;
      const bDate = Date.parse(b.requestedDate) || 0;

      return bDate - aDate;
    });
}

function getValue(source, ...keys) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) {
      return source[key];
    }
  }

  return "";
}

function formatDate(value) {
  if (!value) {
    return "Date pending";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatStatus(value) {
  const statusLabels = {
    0: "Pending",
    1: "Completed",
    2: "Failed",
  };

  if (value === "" || value === null || value === undefined) {
    return "Pending";
  }

  const numericValue = Number(value);

  if (Number.isInteger(numericValue) && statusLabels[numericValue]) {
    return statusLabels[numericValue];
  }

  return String(value);
}

function formatRequestStatus(value) {
  const statusLabels = {
    0: "Pending",
    1: "Pending",
    2: "Approved",
    3: "Rejected",
  };

  if (value === "" || value === null || value === undefined) {
    return "Pending";
  }

  const numericValue = Number(value);

  if (Number.isInteger(numericValue) && statusLabels[numericValue]) {
    return statusLabels[numericValue];
  }

  return String(value).replace(/([a-z])([A-Z])/g, "$1 $2");
}

function requestStatusClass(value) {
  const status = formatRequestStatus(value);

  if (status === "Completed" || status === "Approved") {
    return "bg-success/15 text-success";
  }

  if (status === "Rejected" || status === "Failed") {
    return "bg-destructive/15 text-destructive";
  }

  return "bg-warning/20 text-warning-foreground";
}

export default CustomerDashboard;
