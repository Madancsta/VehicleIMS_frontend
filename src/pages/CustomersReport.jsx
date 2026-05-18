import { PageHeader } from "../components/PageHeader";
import { Award, TrendingUp, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5229/api"
).replace(/\/$/, "");

const dummyCustomers = [
  {
    customerId: 1,
    firstName: "Aarav",
    lastName: "Sharma",
    phoneNumber: "9841234567",
    totalSpent: 25000,
    creditBalance: 5000,
    loyaltyPoints: 60,
  },
  {
    customerId: 2,
    firstName: "Sanjana",
    lastName: "Karki",
    phoneNumber: "9818765432",
    totalSpent: 18000,
    creditBalance: 0,
    loyaltyPoints: 45,
  },
  {
    customerId: 3,
    firstName: "Rohan",
    lastName: "Thapa",
    phoneNumber: "9865432109",
    totalSpent: 7200,
    creditBalance: 1500,
    loyaltyPoints: 22,
  },
];

function CustomersReport() {
  const [highSpenders, setHighSpenders] = useState([]);
  const [regulars, setRegulars] = useState([]);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);

      const [highSpendersData, pendingCreditsData, regularCustomersData] =
        await Promise.all([
          getHighSpenders(),
          getPendingCredits(),
          getRegularCustomers(),
        ]);

      const highSpendersArray = toArray(highSpendersData);
      const creditsArray = toArray(pendingCreditsData);
      const regularsArray = toArray(regularCustomersData);

      setHighSpenders(
        highSpendersArray.length
          ? highSpendersArray
          : dummyCustomers.filter((c) => c.totalSpent >= 5000)
      );

      setCredits(
        creditsArray.length
          ? creditsArray
          : dummyCustomers.filter((c) => c.creditBalance > 0)
      );

      setRegulars(
        regularsArray.length
          ? regularsArray
          : dummyCustomers.filter(
              (c) => c.loyaltyPoints >= 50 || c.totalSpent >= 3000
            )
      );
    } catch (error) {
      console.error("Failed to load customer reports:", error);

      setHighSpenders(dummyCustomers.filter((c) => c.totalSpent >= 5000));
      setCredits(dummyCustomers.filter((c) => c.creditBalance > 0));
      setRegulars(
        dummyCustomers.filter(
          (c) => c.loyaltyPoints >= 50 || c.totalSpent >= 3000
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const allCustomers = [...highSpenders, ...regulars, ...credits].filter(
    (customer, index, self) =>
      index === self.findIndex((c) => c.customerId === customer.customerId)
  );

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Customer Reports"
          description="Insights into regulars, top spenders and outstanding credits."
        />
        <div className="text-muted-foreground">
          Loading customer reports...
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Customer Reports"
        description="Insights into regulars, top spenders and outstanding credits."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ReportCard
          title="Top Spenders"
          icon={Award}
          accent="bg-primary text-primary-foreground"
        >
          {highSpenders.map((c, i) => (
            <div
              key={c.customerId}
              className="flex items-center justify-between py-2.5 border-t border-border first:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="font-display font-bold text-muted-foreground w-5">
                  {i + 1}
                </div>

                <div>
                  <div className="text-sm font-medium">
                    {c.firstName} {c.lastName}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    C-{c.customerId}
                  </div>
                </div>
              </div>

              <div className="text-sm font-mono">
                Rs. {Number(c.totalSpent || 0).toLocaleString()}
              </div>
            </div>
          ))}
        </ReportCard>

        <ReportCard
          title="Regular Customers"
          icon={TrendingUp}
          accent="bg-success/10 text-success"
        >
          {regulars.map((c) => (
            <div
              key={c.customerId}
              className="py-2.5 border-t border-border first:border-0"
            >
              <div className="text-sm font-medium">
                {c.firstName} {c.lastName}
              </div>

              <div className="text-xs text-muted-foreground">
                Loyalty Points: {c.loyaltyPoints || 0}
              </div>
            </div>
          ))}
        </ReportCard>

        <ReportCard
          title="Pending Credits"
          icon={AlertCircle}
          accent="bg-destructive/10 text-destructive"
        >
          {credits.map((c) => (
            <div
              key={c.customerId}
              className="flex items-center justify-between py-2.5 border-t border-border first:border-0"
            >
              <div>
                <div className="text-sm font-medium">
                  {c.firstName} {c.lastName}
                </div>

                <div className="text-xs text-muted-foreground">
                  {c.phoneNumber || "N/A"}
                </div>
              </div>

              <div className="text-sm font-mono text-destructive">
                Rs. {Number(c.creditBalance || 0).toLocaleString()}
              </div>
            </div>
          ))}
        </ReportCard>
      </div>

      <div className="mt-6 bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border font-display font-semibold">
          Report Customers
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-3">ID</th>
                <th className="text-left px-6 py-3">Name</th>
                <th className="text-left px-6 py-3">Phone</th>
                <th className="text-right px-6 py-3">Total Spent</th>
                <th className="text-right px-6 py-3">Credit</th>
                <th className="text-right px-6 py-3">Loyalty Points</th>
              </tr>
            </thead>

            <tbody>
              {allCustomers.map((c) => (
                <tr
                  key={c.customerId}
                  onClick={() => {
                    window.location.href = `/admin/customer-details?id=${c.customerId}`;
                  }}
                  className="border-t border-border hover:bg-surface cursor-pointer transition-colors"
                >
                  <td className="px-6 py-3 font-mono text-xs">
                    C-{c.customerId}
                  </td>

                  <td className="px-6 py-3 font-medium">
                    {c.firstName} {c.lastName}
                  </td>

                  <td className="px-6 py-3 text-muted-foreground font-mono text-xs">
                    {c.phoneNumber || "N/A"}
                  </td>

                  <td className="px-6 py-3 text-right">
                    Rs. {Number(c.totalSpent || 0).toLocaleString()}
                  </td>

                  <td className="px-6 py-3 text-right">
                    {Number(c.creditBalance || 0) > 0 ? (
                      <span className="text-destructive">
                        Rs. {Number(c.creditBalance || 0).toLocaleString()}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-6 py-3 text-right">
                    {c.loyaltyPoints || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, icon: Icon, accent, children }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div
          className={`h-8 w-8 rounded-md flex items-center justify-center ${accent}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="font-display font-semibold">{title}</div>
      </div>

      <div>{children}</div>
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

function toArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.$values)) return data.$values;

  return [];
}

function getHighSpenders() {
  return apiFetch("/Customer/reports/high-spenders");
}

function getPendingCredits() {
  return apiFetch("/Customer/reports/pending-credits");
}

function getRegularCustomers() {
  return apiFetch("/Customer/reports/regulars");
}

export default CustomersReport;