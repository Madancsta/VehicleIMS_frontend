import { useCallback, useEffect, useState } from "react";
import { Calendar, MessageSquare, PackageSearch, RefreshCw, Star } from "lucide-react";
import CustomerLayout from "../components/CustomerLayout";
import { PageHeader } from "../components/PageHeader";
import { apiFetch } from "../api/clientApi";

const inputClassName =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted-foreground";
const textareaClassName =
  "min-h-36 w-full resize-y rounded-md border border-input bg-background px-3 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-ring";

function BookingRequestReviewPage() {
  const customerId = localStorage.getItem("customerId");
  const [activeTab, setActiveTab] = useState("booking");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [parts, setParts] = useState([]);
  const [partsNotice, setPartsNotice] = useState("");

  // Services state - loaded from backend
  const [services, setServices] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceTypesLoading, setServiceTypesLoading] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    vehicleId: "",
    serviceType: "",
    bookingDate: "",
    bookingTime: "",
    serviceDescription: "",
  });

  const [requestForm, setRequestForm] = useState({
    bookingId: "",
    partId: "",
    requestQuantity: "",
    requestDescription: "",
  });

  const [reviewForm, setReviewForm] = useState({
    salesId: "",
    rating: "5",
    reviewComment: "",
  });

  const [bookings, setBookings] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  const [requestHistoryLoading, setRequestHistoryLoading] = useState(false);
  const [requestHistoryMessage, setRequestHistoryMessage] = useState("");
  const [recentBooking, setRecentBooking] = useState(null);
  const [reviewableSales, setReviewableSales] = useState([]);
  const [reviewableSalesMessage, setReviewableSalesMessage] = useState("");

  // Load services from backend
  const loadServices = useCallback(async () => {
    try {
      setServiceTypesLoading(true);
      const data = await getServices();

      // Normalize services data
      let servicesList = Array.isArray(data) ? data : data?.items || data?.$values || [];

      // Extract unique service types from the services
      const uniqueServiceTypes = [...new Set(servicesList.map((service) => service.serviceType))];

      setServices(servicesList);
      setServiceTypes(uniqueServiceTypes);

      // Set default service type if available
      if (uniqueServiceTypes.length > 0 && !bookingForm.serviceType) {
        setBookingForm((prev) => ({
          ...prev,
          serviceType: uniqueServiceTypes[0],
        }));
      }
    } catch (error) {
      console.error("Failed to load services:", error);
      // Fallback to default service types if backend fails
      const fallbackTypes = [
        "Full Service",
        "Oil Change",
        "Brake Service",
        "Engine Diagnostics",
        "Tire and Wheel Service",
        "Battery and Electrical",
        "AC Service",
      ];
      setServiceTypes(fallbackTypes);
      setBookingForm((prev) => ({
        ...prev,
        serviceType: prev.serviceType || fallbackTypes[0],
      }));
    } finally {
      setServiceTypesLoading(false);
    }
  }, []);

  const loadCustomerBookings = useCallback(async () => {
    if (!customerId) {
      setMessage("Create a customer account before booking a service.");
      setBookings([]);
      return;
    }

    try {
      setPageLoading(true);
      setMessage("");

      const profile = await getCustomerProfile(customerId);
      const profileVehicles = Array.isArray(profile?.vehicles) ? profile.vehicles : [];

      setVehicles(profileVehicles);
      setBookingForm((current) => ({
        ...current,
        vehicleId: current.vehicleId || String(getVehicleId(profileVehicles[0]) || ""),
      }));

      const bookingRows = await fetchBookingsForVehicles(profileVehicles);
      setBookings(bookingRows);
    } catch (err) {
      setMessage(err.message || "Unable to load customer bookings.");
      setBookings([]);
    } finally {
      setPageLoading(false);
    }
  }, [customerId]);

  const loadParts = useCallback(async () => {
    try {
      const data = await getParts();
      const normalizedParts = normalizeParts(data);
      setParts(normalizedParts);
      setPartsNotice("");
    } catch (error) {
      console.error("Failed to load parts:", error);
      setParts([]);
      setPartsNotice("Could not load parts. Please try again later.");
    }
  }, []);

  const loadCustomerRequests = useCallback(async () => {
    if (!customerId) {
      setRequestHistory([]);
      setRequestHistoryMessage("Create a customer account to view part requests.");
      return;
    }

    try {
      setRequestHistoryLoading(true);
      setRequestHistoryMessage("");
      const data = await getCustomerRequests(customerId);
      setRequestHistory(normalizePartRequests(data));
    } catch {
      setRequestHistory([]);
      setRequestHistoryMessage(
        "Request history is unavailable until the customer request endpoint is added.",
      );
    } finally {
      setRequestHistoryLoading(false);
    }
  }, [customerId]);

  const loadReviewableSales = useCallback(async () => {
    if (!customerId) {
      setReviewableSales([]);
      setReviewableSalesMessage("Create a customer account to review completed services.");
      return;
    }

    try {
      setReviewableSalesMessage("");
      const data = await getReviewableSales();
      const salesRows = normalizeReviewableSales(data);
      setReviewableSales(salesRows);

      setReviewForm((current) => ({
        ...current,
        salesId: current.salesId || String(getReviewableSaleId(salesRows[0]) || ""),
      }));

      if (!salesRows.length) {
        setReviewableSalesMessage("No completed services are ready for review yet.");
      }
    } catch (err) {
      setReviewableSales([]);
      setReviewableSalesMessage(err.message || "Unable to load completed services for review.");
    }
  }, [customerId]);

  useEffect(() => {
    loadServices();
    loadCustomerBookings();
    loadParts();
    loadCustomerRequests();
    loadReviewableSales();
  }, [loadServices, loadCustomerBookings, loadParts, loadCustomerRequests, loadReviewableSales]);

  useEffect(() => {
    if (!isSuccessMessage(message)) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setMessage((currentMessage) => (currentMessage === message ? "" : currentMessage));
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [message]);

  function handleBookingChange(e) {
    setBookingForm({
      ...bookingForm,
      [e.target.name]: e.target.value,
    });
  }

  function handleRequestChange(e) {
    setRequestForm({
      ...requestForm,
      [e.target.name]: e.target.value,
    });
  }

  function handlePartChange(e) {
    setRequestForm({
      ...requestForm,
      partId: e.target.value,
    });
  }

  function handleReviewChange(e) {
    setReviewForm({
      ...reviewForm,
      [e.target.name]: e.target.value,
    });
  }

  function startPartRequest(bookingId) {
    setRequestForm((current) => ({
      ...current,
      bookingId: String(bookingId || ""),
    }));
    setActiveTab("request");
    setMessage("");
  }

  async function handleBookingSubmit(e) {
    e.preventDefault();
    setMessage("");

    const payload = {
      vehicleId: Number(bookingForm.vehicleId),
      bookingDate: bookingForm.bookingDate,
      bookingTime: `${bookingForm.bookingTime}:00`,
      serviceType: bookingForm.serviceType,
      serviceDescription: bookingForm.serviceDescription,
    };

    try {
      setLoading(true);
      const result = await createBooking(payload);
      await loadCustomerBookings();
      const createdBookingId = result?.bookingId ?? result?.BookingId;

      setMessage(result?.message || result?.Message || "Booking created successfully.");
      setRecentBooking(
        createdBookingId
          ? {
              bookingId: createdBookingId,
              serviceType: bookingForm.serviceType,
            }
          : null,
      );

      setBookingForm((current) => ({
        ...current,
        serviceType: serviceTypes[0] || "",
        bookingDate: "",
        bookingTime: "",
        serviceDescription: "",
      }));
    } catch (err) {
      setMessage(err.message || "Unable to create booking.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestSubmit(e) {
    e.preventDefault();
    setMessage("");
    const selectedBooking = bookings.find(
      (booking) => String(getBookingId(booking)) === String(requestForm.bookingId),
    );

    if (!selectedBooking) {
      setMessage("Please select a booking before submitting request.");
      return;
    }

    if (isCompletedBooking(selectedBooking)) {
      setMessage("Part request cannot be submitted for a completed booking.");
      return;
    }
    const payload = {
      bookingId: Number(requestForm.bookingId),
      partId: Number(requestForm.partId),
      requestQuantity: Number(requestForm.requestQuantity),
      requestDescription: requestForm.requestDescription,
    };

    try {
      setLoading(true);
      const result = await createPartRequest(payload);
      await loadCustomerRequests();
      setMessage(result?.message || result?.Message || "Part request submitted successfully.");

      setRequestForm((current) => ({
        bookingId: current.bookingId,
        partId: "",
        requestQuantity: "",
        requestDescription: "",
      }));
    } catch (err) {
      setMessage(err.message || "Unable to submit part request.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    setMessage("");

    const payload = {
      salesId: Number(reviewForm.salesId),
      rating: Number(reviewForm.rating),
      reviewComment: reviewForm.reviewComment,
    };

    try {
      setLoading(true);
      const result = await createReview(payload);
      setMessage(result?.message || result?.Message || "Review submitted successfully.");

      setReviewForm({
        salesId: "",
        rating: "5",
        reviewComment: "",
      });
      await loadReviewableSales();
    } catch (err) {
      setMessage(err.message || "Unable to submit review.");
    } finally {
      setLoading(false);
    }
  }

  const selectedPart = parts.find((part) => String(part.partId) === requestForm.partId);
  const requestableBookings = bookings.filter((booking) => !isCompletedBooking(booking));

  return (
    <CustomerLayout>
      <PageHeader
        title="Booking, Requests & Reviews"
        description="Book service appointments, request unavailable parts, and review completed services."
      />

      {message && (
        <div
          className={`mb-6 rounded-lg border p-4 text-sm shadow-sm ${messageClassName(message)}`}
        >
          {message}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <TabButton
          active={activeTab === "booking"}
          icon={Calendar}
          label="Booking"
          onClick={() => setActiveTab("booking")}
        />

        <TabButton
          active={activeTab === "request"}
          icon={PackageSearch}
          label="Part Request"
          onClick={() => setActiveTab("request")}
        />

        <TabButton
          active={activeTab === "review"}
          icon={Star}
          label="Review"
          onClick={() => setActiveTab("review")}
        />
      </div>

      {activeTab === "booking" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.95fr]">
          <form
            onSubmit={handleBookingSubmit}
            className="rounded-lg border border-border bg-card p-6 shadow-elegant"
          >
            <SectionTitle
              icon={Calendar}
              title="Create Booking"
              description="Select your vehicle and preferred appointment time."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Vehicle">
                <select
                  name="vehicleId"
                  value={bookingForm.vehicleId}
                  onChange={handleBookingChange}
                  className={inputClassName}
                  required
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map((vehicle) => {
                    const vehicleId = getVehicleId(vehicle);

                    return (
                      <option key={vehicleId} value={vehicleId}>
                        {getVehicleLabel(vehicle)}
                      </option>
                    );
                  })}
                </select>
              </Field>

              <Field label="Service Type">
                <select
                  name="serviceType"
                  value={bookingForm.serviceType}
                  onChange={handleBookingChange}
                  className={inputClassName}
                  disabled={serviceTypesLoading}
                >
                  <option value="">Select Service Type</option>
                  {serviceTypes.map((serviceType) => (
                    <option key={serviceType} value={serviceType}>
                      {serviceType}
                    </option>
                  ))}
                </select>
                {serviceTypesLoading && (
                  <p className="mt-2 text-xs text-muted-foreground">Loading service types...</p>
                )}
              </Field>

              <Field label="Booking Date">
                <input
                  name="bookingDate"
                  type="date"
                  value={bookingForm.bookingDate}
                  onChange={handleBookingChange}
                  className={inputClassName}
                  required
                />
              </Field>

              <Field label="Booking Time">
                <input
                  name="bookingTime"
                  type="time"
                  value={bookingForm.bookingTime}
                  onChange={handleBookingChange}
                  className={inputClassName}
                  required
                />
              </Field>
            </div>

            <Field label="Service Description" className="mt-4">
              <textarea
                name="serviceDescription"
                value={bookingForm.serviceDescription}
                onChange={handleBookingChange}
                className={textareaClassName}
                placeholder="Describe the service you need"
                required
              />
            </Field>

            <button
              type="submit"
              disabled={loading || pageLoading || !vehicles.length || !serviceTypes.length}
              className="mt-6 h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Saving..." : "Create Booking"}
            </button>

            {recentBooking && (
              <div className="mt-5 rounded-lg border border-border bg-background p-4">
                <p className="text-sm font-medium text-foreground">
                  Booking #{recentBooking.bookingId} is ready for part requests.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add unavailable parts now, or come back later from the Part Request tab.
                </p>
                <button
                  type="button"
                  onClick={() => startPartRequest(recentBooking.bookingId)}
                  className="mt-4 h-10 rounded-md border border-border px-4 text-sm font-medium hover:bg-surface"
                >
                  Request parts for this booking
                </button>
              </div>
            )}
          </form>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <SectionTitle
                icon={Calendar}
                title="My Vehicle Bookings"
                description="All bookings made for your registered vehicles."
              />

              <button
                type="button"
                onClick={loadCustomerBookings}
                disabled={pageLoading}
                className="flex h-10 shrink-0 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {pageLoading ? (
                <p className="text-sm text-muted-foreground">Loading bookings...</p>
              ) : bookings.length > 0 ? (
                bookings.map((booking) => {
                  const bookingId = getBookingId(booking);
                  const status = formatStatus(
                    getValue(booking, "bookingStatus", "BookingStatus", "status"),
                  );

                  return (
                    <div
                      key={bookingId}
                      className="rounded-lg border border-border bg-background p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">Booking #{bookingId}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {booking.vehicleName || `Vehicle #${getBookingVehicleId(booking)}`}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(
                            status,
                          )}`}
                        >
                          {status}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-foreground">
                        {getBookingServiceLabel(booking)}
                      </p>

                      <p className="mt-3 text-sm text-muted-foreground">
                        {formatDate(getValue(booking, "bookingDate", "BookingDate"))} at{" "}
                        {formatTime(getValue(booking, "bookingTime", "BookingTime"))}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No bookings found yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Part Request Tab - Keep as is */}
      {activeTab === "request" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.95fr]">
          {/* Request form content - same as before */}
          <form
            onSubmit={handleRequestSubmit}
            className="rounded-lg border border-border bg-card p-6 shadow-elegant"
          >
            <SectionTitle
              icon={PackageSearch}
              title="Request Unavailable Part"
              description="Submit a part request for an existing booking."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Booking">
                <select
                  name="bookingId"
                  value={requestForm.bookingId}
                  onChange={handleRequestChange}
                  className={inputClassName}
                  disabled={!requestableBookings.length}
                  required
                >
                  <option value="">Select booking</option>
                  {requestableBookings.map((booking) => {
                    const bookingId = getBookingId(booking);

                    return (
                      <option key={bookingId} value={bookingId}>
                        {getBookingOptionLabel(booking)}
                      </option>
                    );
                  })}
                </select>
                {!bookings.length && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Create a booking before requesting unavailable parts.
                  </p>
                )}
                {bookings.length > 0 && !requestableBookings.length && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    All bookings are completed. You cannot request parts for completed bookings.
                  </p>
                )}
              </Field>

              <Field label="Part Name">
                <select
                  value={requestForm.partId}
                  onChange={handlePartChange}
                  className={inputClassName}
                  required
                >
                  <option value="">Select part</option>
                  {parts.map((part) => (
                    <option key={part.partId} value={part.partId}>
                      {part.category ? `${part.partName} (${part.category})` : part.partName}
                    </option>
                  ))}
                </select>
                {partsNotice && <p className="mt-2 text-xs text-muted-foreground">{partsNotice}</p>}
              </Field>

              <Field label="Part ID">
                <input
                  value={selectedPart?.partId || ""}
                  className={inputClassName}
                  placeholder="Auto-filled"
                  disabled
                  tabIndex={-1}
                />
              </Field>

              <Field label="Quantity">
                <input
                  name="requestQuantity"
                  type="number"
                  min="1"
                  value={requestForm.requestQuantity}
                  onChange={handleRequestChange}
                  className={inputClassName}
                  placeholder="Required quantity"
                  required
                />
              </Field>
            </div>

            <Field label="Request Description" className="mt-4">
              <textarea
                name="requestDescription"
                value={requestForm.requestDescription}
                onChange={handleRequestChange}
                className={textareaClassName}
                placeholder="Describe the unavailable part request"
                required
              />
            </Field>

            <button
              type="submit"
              disabled={loading || !requestableBookings.length}
              className="mt-6 h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Saving..." : "Submit Request"}
            </button>
          </form>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <SectionTitle
                icon={PackageSearch}
                title="My Part Requests"
                description="Parts requested for your service bookings."
              />

              <button
                type="button"
                onClick={loadCustomerRequests}
                disabled={requestHistoryLoading}
                className="flex h-10 shrink-0 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {requestHistoryLoading ? (
                <p className="text-sm text-muted-foreground">Loading part requests...</p>
              ) : requestHistory.length > 0 ? (
                requestHistory.map((request) => (
                  <div
                    key={`${request.requestId}-${request.partId}`}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{request.partName}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Request #{request.requestId} - Booking #{request.bookingId}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          Number(request.status) === 2
                            ? "bg-success/15 text-success"
                            : Number(request.status) === 3
                              ? "bg-destructive/15 text-destructive"
                              : "bg-warning/20 text-warning-foreground"
                        }`}
                      >
                        {formatRequestStatus(request.status)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground">
                      Qty {request.quantity}
                      {request.vehicleName ? ` - ${request.vehicleName}` : ""}
                    </p>

                    {request.description && (
                      <p className="mt-2 text-sm text-foreground">{request.description}</p>
                    )}

                    <p className="mt-3 text-xs text-muted-foreground">
                      {formatDate(request.requestedDate)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {requestHistoryMessage || "No part requests found yet."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Tab - Keep as is */}
      {activeTab === "review" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.95fr]">
          <form
            onSubmit={handleReviewSubmit}
            className="rounded-lg border border-border bg-card p-6 shadow-elegant"
          >
            <SectionTitle
              icon={MessageSquare}
              title="Review Service"
              description="Add your review after a completed sale."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Completed Service">
                <select
                  name="salesId"
                  value={reviewForm.salesId}
                  onChange={handleReviewChange}
                  className={inputClassName}
                  disabled={!reviewableSales.length}
                  required
                >
                  <option value="">Select completed service</option>
                  {reviewableSales.map((sale) => {
                    const saleId = getReviewableSaleId(sale);

                    return (
                      <option key={saleId} value={saleId}>
                        {getReviewableSaleLabel(sale)}
                      </option>
                    );
                  })}
                </select>
                {reviewableSalesMessage && (
                  <p className="mt-2 text-xs text-muted-foreground">{reviewableSalesMessage}</p>
                )}
              </Field>

              <Field label="Rating">
                <select
                  name="rating"
                  value={reviewForm.rating}
                  onChange={handleReviewChange}
                  className={inputClassName}
                  required
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </Field>
            </div>

            <Field label="Review Comment" className="mt-4">
              <textarea
                name="reviewComment"
                value={reviewForm.reviewComment}
                onChange={handleReviewChange}
                className={textareaClassName}
                placeholder="Write your review"
                required
              />
            </Field>

            <button
              type="submit"
              disabled={loading || !reviewableSales.length}
              className="mt-6 h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Saving..." : "Submit Review"}
            </button>
          </form>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <SectionTitle
              icon={Star}
              title="Reviewable Services"
              description="Only completed services that have not been reviewed are shown."
            />

            <div className="mt-5 space-y-3">
              {reviewableSales.length > 0 ? (
                reviewableSales.map((sale) => (
                  <div
                    key={getReviewableSaleId(sale)}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <p className="font-medium">
                      {getValue(sale, "serviceType", "ServiceType") || "Completed service"}
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {getValue(sale, "vehicleNumber", "VehicleNumber") ||
                        "Vehicle details pending"}
                    </p>

                    <p className="mt-3 text-xs text-muted-foreground">
                      Sale #{getReviewableSaleId(sale)} -{" "}
                      {formatDate(getValue(sale, "salesDate", "SalesDate"))} -{" "}
                      {formatCurrency(getValue(sale, "salesAmount", "SalesAmount"))}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {reviewableSalesMessage || "No completed services are ready for review yet."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}

// Helper components (TabButton, SectionTitle, Field remain the same)
function TabButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-all ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:border-primary hover:shadow-elegant"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-display font-semibold">{label}</span>
    </button>
  );
}

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

// New API function to get services
function getServices() {
  return apiFetch("/services");
}

function getCustomerProfile(customerId) {
  return apiFetch(`/customers/${customerId}/profile`);
}

function createBooking(data) {
  return apiFetch("/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

function getVehicleBookings(vehicleId) {
  return apiFetch(`/bookings/vehicle/${vehicleId}`);
}

function createPartRequest(data) {
  return apiFetch("/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

function getCustomerRequests(customerId) {
  return apiFetch(`/requests/customer/${customerId}`);
}

function createReview(data) {
  return apiFetch("/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

function getReviewableSales() {
  return apiFetch("/reviews/my-reviewable-sales");
}

function getParts() {
  return apiFetch("/parts");
}

async function fetchBookingsForVehicles(profileVehicles) {
  const vehiclesWithIds = profileVehicles.filter((vehicle) => Boolean(getVehicleId(vehicle)));

  const results = await Promise.allSettled(
    vehiclesWithIds.map((vehicle) => getVehicleBookings(getVehicleId(vehicle))),
  );

  const bookingRows = results.flatMap((result, index) => {
    if (result.status !== "fulfilled" || !Array.isArray(result.value)) {
      return [];
    }

    const vehicle = vehiclesWithIds[index];

    return result.value.map((booking) => ({
      ...booking,
      vehicleName: getVehicleLabel(vehicle),
    }));
  });

  return sortBookings(bookingRows);
}

// Helper functions (normalizeParts, normalizePartRequests, normalizeReviewableSales, etc. remain the same)
function normalizeParts(data) {
  const rows = Array.isArray(data) ? data : data?.items || data?.parts || data?.$values || [];

  return rows
    .map((part, index) => {
      const rawPartId = Number(getValue(part, "partId", "PartId", "id", "Id"));

      return {
        partId: Number.isFinite(rawPartId) && rawPartId > 0 ? rawPartId : index + 1,
        partName: getValue(part, "partName", "PartName", "name", "Name"),
        category: getValue(part, "category", "Category", "categoryName", "CategoryName"),
      };
    })
    .filter((part) => Number.isFinite(part.partId) && part.partName);
}

function normalizePartRequests(data) {
  const rows = Array.isArray(data) ? data : data?.items || data?.requests || data?.$values || [];

  return rows.flatMap((request) => {
    const requestId = getValue(request, "requestId", "RequestId", "id", "Id");
    const bookingId = getValue(request, "bookingId", "BookingId");
    const requestedDate = getValue(request, "requestedDate", "RequestedDate");
    const status = getValue(request, "requestStatusId", "RequestStatusId", "status", "Status");
    const vehicleName = getValue(request, "vehicleName", "VehicleName");
    const rawParts = getValue(request, "parts", "Parts", "requestParts", "RequestParts");
    const requestParts = Array.isArray(rawParts) ? rawParts : rawParts?.$values || [];

    if (!requestParts.length) {
      return [
        {
          requestId,
          bookingId,
          requestedDate,
          status,
          vehicleName,
          partId: getValue(request, "partId", "PartId"),
          partName: getValue(request, "partName", "PartName") || "Requested part",
          quantity: getValue(request, "requestQuantity", "RequestQuantity") || 1,
          description: getValue(request, "requestDescription", "RequestDescription"),
        },
      ];
    }

    return requestParts.map((part) => ({
      requestId,
      bookingId,
      requestedDate,
      status,
      vehicleName,
      partId: getValue(part, "partId", "PartId"),
      partName: getValue(part, "partName", "PartName") || "Requested part",
      quantity: getValue(part, "requestQuantity", "RequestQuantity") || 1,
      description: getValue(part, "requestDescription", "RequestDescription"),
    }));
  });
}

function normalizeReviewableSales(data) {
  const rows = Array.isArray(data) ? data : data?.items || data?.sales || data?.$values || [];

  return rows
    .map((sale) => ({
      salesId: getValue(sale, "salesId", "SalesId", "id", "Id"),
      bookingId: getValue(sale, "bookingId", "BookingId"),
      serviceType: getValue(sale, "serviceType", "ServiceType"),
      vehicleNumber: getValue(sale, "vehicleNumber", "VehicleNumber"),
      salesDate: getValue(sale, "salesDate", "SalesDate"),
      salesAmount: getValue(sale, "salesAmount", "SalesAmount"),
    }))
    .filter((sale) => Boolean(getReviewableSaleId(sale)));
}

function sortBookings(bookingRows) {
  return [...bookingRows].sort((a, b) => {
    const aDate = Date.parse(getValue(a, "bookingDate", "BookingDate")) || 0;
    const bDate = Date.parse(getValue(b, "bookingDate", "BookingDate")) || 0;

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

function getVehicleId(vehicle) {
  return getValue(vehicle, "vehicleId", "VehicleId", "id", "Id");
}

function getBookingId(booking) {
  return getValue(booking, "bookingId", "BookingId", "id", "Id");
}

function getReviewableSaleId(sale) {
  return getValue(sale, "salesId", "SalesId", "id", "Id");
}

function getReviewableSaleLabel(sale) {
  const saleId = getReviewableSaleId(sale);
  const service = getValue(sale, "serviceType", "ServiceType") || "Completed service";
  const vehicleNumber = getValue(sale, "vehicleNumber", "VehicleNumber");
  const salesDate = formatDate(getValue(sale, "salesDate", "SalesDate"));
  const salesAmount = formatCurrency(getValue(sale, "salesAmount", "SalesAmount"));
  const vehicleLabel = vehicleNumber ? ` - ${vehicleNumber}` : "";

  return `Sale #${saleId} - ${service}${vehicleLabel} - ${salesDate} - ${salesAmount}`;
}

function getBookingVehicleId(booking) {
  return getValue(booking, "vehicleId", "VehicleId");
}

function getBookingServiceLabel(booking) {
  return (
    getValue(booking, "serviceType", "ServiceType") ||
    getValue(booking, "serviceDescription", "ServiceDescription") ||
    "Service appointment"
  );
}

function getBookingOptionLabel(booking) {
  const bookingId = getBookingId(booking);
  const service = getBookingServiceLabel(booking);
  const date = formatDate(getValue(booking, "bookingDate", "BookingDate"));

  return `Booking #${bookingId} - ${service} - ${date}`;
}

function getBookingStatus(booking) {
  return formatStatus(getValue(booking, "bookingStatus", "BookingStatus", "status", "Status"));
}

function isCompletedBooking(booking) {
  return getBookingStatus(booking) === "Completed";
}

function getVehicleLabel(vehicle) {
  const brand = getValue(vehicle, "brand", "Brand");
  const model = getValue(vehicle, "model", "Model");
  const year = getValue(vehicle, "year", "Year");
  const number = getValue(vehicle, "vehicleNumber", "VehicleNumber");
  const name = [brand, model].filter(Boolean).join(" ");
  const yearLabel = year ? ` (${year})` : "";
  const numberLabel = number ? ` - ${number}` : "";

  return name ? `${name}${yearLabel}${numberLabel}` : `Vehicle #${getVehicleId(vehicle)}`;
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

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Amount pending";
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTime(value) {
  if (!value) {
    return "time pending";
  }

  return String(value).split(".")[0].slice(0, 5);
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

  return String(value).replace(/([a-z])([A-Z])/g, "$1 $2");
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

function statusBadgeClass(status) {
  if (status === "Completed") {
    return "bg-success/15 text-success";
  }

  if (status === "Failed") {
    return "bg-destructive/15 text-destructive";
  }

  return "bg-warning/20 text-warning-foreground";
}

function isSuccessMessage(message) {
  return message.toLowerCase().includes("successfully");
}

function messageClassName(message) {
  return isSuccessMessage(message)
    ? "border-green-500 bg-green-50 text-green-700"
    : "border-red-500 bg-red-50 text-red-700";
}

export default BookingRequestReviewPage;
