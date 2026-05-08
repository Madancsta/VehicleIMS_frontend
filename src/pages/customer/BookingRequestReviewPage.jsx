import { useState } from "react";
import { Calendar, MessageSquare, PackageSearch, Star } from "lucide-react";
import CustomerLayout from "../../components/CustomerLayout";
import { PageHeader } from "../../components/PageHeader";
import {
  createBooking,
  createPartRequest,
  createReview,
  getVehicleBookings,
  getReviewsBySales,
} from "../../api/customerApi";

function BookingRequestReviewPage() {
  const [activeTab, setActiveTab] = useState("booking");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    vehicleId: "",
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

  const [bookingSearchVehicleId, setBookingSearchVehicleId] = useState("");
  const [bookings, setBookings] = useState([]);

  const [reviewSearchSalesId, setReviewSearchSalesId] = useState("");
  const [reviews, setReviews] = useState([]);

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

  function handleReviewChange(e) {
    setReviewForm({
      ...reviewForm,
      [e.target.name]: e.target.value,
    });
  }

  async function handleBookingSubmit(e) {
    e.preventDefault();
    setMessage("");

    const payload = {
      vehicleId: Number(bookingForm.vehicleId),
      bookingDate: bookingForm.bookingDate,
      bookingTime: `${bookingForm.bookingTime}:00`,
      serviceDescription: bookingForm.serviceDescription,
    };

    try {
      setLoading(true);
      const result = await createBooking(payload);
      setMessage(
        result?.message || result?.Message || "Booking created successfully.",
      );

      setBookingForm({
        vehicleId: "",
        bookingDate: "",
        bookingTime: "",
        serviceDescription: "",
      });
    } catch (err) {
      setMessage(err.message || "Unable to create booking.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadBookings(e) {
    e.preventDefault();
    setMessage("");

    if (!bookingSearchVehicleId) {
      setMessage("Enter vehicle ID to load bookings.");
      return;
    }

    try {
      setLoading(true);
      const data = await getVehicleBookings(bookingSearchVehicleId);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage(err.message || "Unable to load bookings.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestSubmit(e) {
    e.preventDefault();
    setMessage("");

    const payload = {
      bookingId: Number(requestForm.bookingId),
      partId: Number(requestForm.partId),
      requestQuantity: Number(requestForm.requestQuantity),
      requestDescription: requestForm.requestDescription,
    };

    try {
      setLoading(true);
      const result = await createPartRequest(payload);
      setMessage(
        result?.message ||
          result?.Message ||
          "Part request submitted successfully.",
      );

      setRequestForm({
        bookingId: "",
        partId: "",
        requestQuantity: "",
        requestDescription: "",
      });
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
      setMessage(
        result?.message || result?.Message || "Review submitted successfully.",
      );

      setReviewForm({
        salesId: "",
        rating: "5",
        reviewComment: "",
      });
    } catch (err) {
      setMessage(err.message || "Unable to submit review.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadReviews(e) {
    e.preventDefault();
    setMessage("");

    if (!reviewSearchSalesId) {
      setMessage("Enter sales ID to load reviews.");
      return;
    }

    try {
      setLoading(true);
      const data = await getReviewsBySales(reviewSearchSalesId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessage(err.message || "Unable to load reviews.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <CustomerLayout>
      <PageHeader
        title="Booking, Requests & Reviews"
        description="Book service appointments, request unavailable parts, and review completed services."
      />

      {message && (
        <div className="mb-6 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground shadow-sm">
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
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
          <form
            onSubmit={handleBookingSubmit}
            className="rounded-xl border border-border bg-card p-6 shadow-elegant"
          >
            <SectionTitle
              icon={Calendar}
              title="Create Booking"
              description="Select your vehicle and preferred appointment time."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Vehicle ID">
                <input
                  name="vehicleId"
                  type="number"
                  value={bookingForm.vehicleId}
                  onChange={handleBookingChange}
                  className="input"
                  placeholder="Enter vehicle ID"
                  required
                />
              </Field>

              <Field label="Booking Date">
                <input
                  name="bookingDate"
                  type="date"
                  value={bookingForm.bookingDate}
                  onChange={handleBookingChange}
                  className="input"
                  required
                />
              </Field>

              <Field label="Booking Time">
                <input
                  name="bookingTime"
                  type="time"
                  value={bookingForm.bookingTime}
                  onChange={handleBookingChange}
                  className="input"
                  required
                />
              </Field>
            </div>

            <Field label="Service Description" className="mt-4">
              <textarea
                name="serviceDescription"
                value={bookingForm.serviceDescription}
                onChange={handleBookingChange}
                className="input min-h-28 py-3"
                placeholder="Describe the service you need"
                required
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Saving..." : "Create Booking"}
            </button>
          </form>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <SectionTitle
              icon={Calendar}
              title="My Vehicle Bookings"
              description="Enter vehicle ID to view bookings."
            />

            <form onSubmit={handleLoadBookings} className="mt-5 flex gap-3">
              <input
                type="number"
                value={bookingSearchVehicleId}
                onChange={(e) => setBookingSearchVehicleId(e.target.value)}
                className="input"
                placeholder="Vehicle ID"
              />

              <button
                type="submit"
                disabled={loading}
                className="h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-70"
              >
                Load
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <div
                    key={booking.bookingId}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">
                          Booking #{booking.bookingId}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {booking.serviceDescription || "Service appointment"}
                        </p>
                      </div>

                      <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium">
                        {booking.bookingStatus || "Pending"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground">
                      {booking.bookingDate} {booking.bookingTime}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No bookings loaded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "request" && (
        <form
          onSubmit={handleRequestSubmit}
          className="max-w-3xl rounded-xl border border-border bg-card p-6 shadow-elegant"
        >
          <SectionTitle
            icon={PackageSearch}
            title="Request Unavailable Part"
            description="Submit a part request for an existing booking."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Booking ID">
              <input
                name="bookingId"
                type="number"
                value={requestForm.bookingId}
                onChange={handleRequestChange}
                className="input"
                placeholder="Enter booking ID"
                required
              />
            </Field>

            <Field label="Part ID">
              <input
                name="partId"
                type="number"
                value={requestForm.partId}
                onChange={handleRequestChange}
                className="input"
                placeholder="Enter part ID"
                required
              />
            </Field>

            <Field label="Quantity">
              <input
                name="requestQuantity"
                type="number"
                min="1"
                value={requestForm.requestQuantity}
                onChange={handleRequestChange}
                className="input"
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
              className="input min-h-28 py-3"
              placeholder="Describe the unavailable part request"
              required
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Saving..." : "Submit Request"}
          </button>
        </form>
      )}

      {activeTab === "review" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
          <form
            onSubmit={handleReviewSubmit}
            className="rounded-xl border border-border bg-card p-6 shadow-elegant"
          >
            <SectionTitle
              icon={MessageSquare}
              title="Review Service"
              description="Add your review after a completed sale."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Sales ID">
                <input
                  name="salesId"
                  type="number"
                  value={reviewForm.salesId}
                  onChange={handleReviewChange}
                  className="input"
                  placeholder="Enter sales ID"
                  required
                />
              </Field>

              <Field label="Rating">
                <select
                  name="rating"
                  value={reviewForm.rating}
                  onChange={handleReviewChange}
                  className="input"
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
                className="input min-h-28 py-3"
                placeholder="Write your review"
                required
              />
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Saving..." : "Submit Review"}
            </button>
          </form>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <SectionTitle
              icon={Star}
              title="Reviews by Sale"
              description="Enter a sales ID to view submitted reviews."
            />

            <form onSubmit={handleLoadReviews} className="mt-5 flex gap-3">
              <input
                type="number"
                value={reviewSearchSalesId}
                onChange={(e) => setReviewSearchSalesId(e.target.value)}
                className="input"
                placeholder="Sales ID"
              />

              <button
                type="submit"
                disabled={loading}
                className="h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-70"
              >
                Load
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review.reviewId}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <p className="font-medium">
                      {review.rating} Star{review.rating > 1 ? "s" : ""}
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {review.reviewComment}
                    </p>

                    <p className="mt-3 text-xs text-muted-foreground">
                      Review #{review.reviewId} • Sales #{review.salesId}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No reviews loaded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}

function TabButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
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

export default BookingRequestReviewPage;
