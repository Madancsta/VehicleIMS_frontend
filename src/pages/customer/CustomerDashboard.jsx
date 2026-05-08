import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Calendar, Car, History } from "lucide-react";
import CustomerLayout from "../../components/CustomerLayout";
import { PageHeader } from "../../components/PageHeader";
import { getCustomerProfile, getVehicleBookings } from "../../api/customerApi";

function CustomerDashboard() {
  const customerId = localStorage.getItem("customerId");
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
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
          result.status === "fulfilled" && Array.isArray(result.value)
            ? result.value
            : [],
        );

        setProfile(profileData);
        setBookings(bookingData);
      } catch (err) {
        setMessage(err.message || "Unable to load dashboard.");
      }
    }

    loadDashboard();
  }, [customerId]);

  const displayName = getDisplayName(profile);
  const totalSpent = Number(profile?.totalSpent || 0);
  const vehicles = profile?.vehicles || [];
  const upcomingBookings = bookings.filter(
    (booking) => (booking.bookingStatus || booking.status) !== "Completed",
  );
  const discountUnlocked = totalSpent > 5000;
  const pageMessage =
    !customerId
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
                <div className="text-xs uppercase tracking-widest opacity-60">
                  Loyalty Program
                </div>
                <div className="font-display mt-2 text-3xl font-bold">
                  {discountUnlocked
                    ? "10% off eligible purchases"
                    : "Spend over Rs. 5,000 to unlock 10% off"}
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
              ["Upcoming Bookings", upcomingBookings.length],
            ].map(([label, value]) => (
              <div key={label} className="stat-card">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {label}
                </div>
                <div className="font-display mt-2 text-2xl font-bold">
                  {value}
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
                  <div className="font-display font-semibold">
                    {action.label}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="font-display mb-4 font-semibold">
              Upcoming Bookings
            </div>
            {upcomingBookings.length > 0 ? (
              upcomingBookings.slice(0, 2).map((booking) => (
                <div
                  key={booking.bookingId || booking.id}
                  className="mb-2 flex items-center justify-between gap-4 rounded-md border border-border p-4 last:mb-0"
                >
                  <div>
                    <div className="font-medium">
                      {booking.serviceDescription ||
                        booking.service ||
                        "Service"}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {booking.bookingDate || booking.date || "Date pending"}
                    </div>
                  </div>
                  <span className="rounded-full bg-warning/20 px-3 py-1 text-xs text-warning-foreground">
                    {booking.bookingStatus || booking.status || "Pending"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No upcoming bookings yet.
              </p>
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

  const fullName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ");

  return fullName || profile.userName || "Customer";
}

function MessageBox({ message }) {
  return (
    <div className="mb-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export default CustomerDashboard;
