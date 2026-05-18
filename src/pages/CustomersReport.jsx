import { PageHeader } from "../components/PageHeader";
import { Award, TrendingUp, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getHighSpenders,
  getPendingCredits,
  getRegularCustomers,
} from "../api/customerApi";

function CustomersReport() {
  const [highSpenders, setHighSpenders] = useState([]);
  const [regulars, setRegulars] = useState([]);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [highSpendersData, pendingCreditsData, regularCustomersData] =
        await Promise.all([
          getHighSpenders(),
          getPendingCredits(),
          getRegularCustomers(),
        ]);

      setHighSpenders(highSpendersData || []);
      setCredits(pendingCreditsData || []);
      setRegulars(regularCustomersData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load customer reports. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const allCustomers = [
    ...highSpenders,
    ...regulars,
    ...credits,
  ].filter(
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
        <div className="text-muted-foreground">Loading customer reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Customer Reports"
          description="Insights into regulars, top spenders and outstanding credits."
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-600">
          {error}
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
          {highSpenders.length ? (
            highSpenders.slice(0, 4).map((c, i) => (
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
                  Rs. {(c.totalSpent || 0).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <EmptyText text="No high spenders found." />
          )}
        </ReportCard>

        <ReportCard
          title="Regular Customers"
          icon={TrendingUp}
          accent="bg-success/10 text-success"
        >
          {regulars.length ? (
            regulars.map((c) => (
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
            ))
          ) : (
            <EmptyText text="No regular customers found." />
          )}
        </ReportCard>

        <ReportCard
          title="Pending Credits"
          icon={AlertCircle}
          accent="bg-destructive/10 text-destructive"
        >
          {credits.length ? (
            credits.map((c) => (
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
                  Rs. {(c.creditBalance || 0).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <EmptyText text="No pending credits found." />
          )}
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
              {allCustomers.length ? (
                allCustomers.map((c) => (
                  <tr
                    key={c.customerId}
                    className="border-t border-border hover:bg-surface"
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
                      Rs. {(c.totalSpent || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {(c.creditBalance || 0) > 0 ? (
                        <span className="text-destructive">
                          Rs. {(c.creditBalance || 0).toLocaleString()}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {c.loyaltyPoints || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No report data found. Add customer spending, credit balance,
                    or loyalty points to see report results.
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

function ReportCard({ title, icon: Icon, accent, children }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className={`h-8 w-8 rounded-md flex items-center justify-center ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="font-display font-semibold">{title}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function EmptyText({ text }) {
  return (
    <div className="py-3 text-sm text-muted-foreground">
      {text}
    </div>
  );
}

export default CustomersReport;