import { PageHeader } from "../components/PageHeader";
import { Award, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from '../api/clientApi';

function CustomersReport() {
  const [highSpenders, setHighSpenders] = useState([]);
  const [regulars, setRegulars] = useState([]);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      // Fetch all three reports in parallel
      const [highSpendersData, pendingCreditsData, regularCustomersData] = await Promise.all([
        getHighSpenders(),
        getPendingCredits(),
        getRegularCustomers(),
      ]);

      // Convert to array format (handles different API response structures)
      const highSpendersArray = toArray(highSpendersData);
      const creditsArray = toArray(pendingCreditsData);
      const regularsArray = toArray(regularCustomersData);

      setHighSpenders(highSpendersArray);
      setCredits(creditsArray);
      setRegulars(regularsArray);

      // Show success message if data loaded
      if (highSpendersArray.length > 0 || creditsArray.length > 0 || regularsArray.length > 0) {
        setMessage("Reports loaded successfully!");
        setMessageType("success");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to load customer reports:", error);
      setError(error.message || "Failed to load customer reports");
      setMessageType("error");
      setMessage(error.message || "Failed to load customer reports");
      
      // Set empty arrays on error
      setHighSpenders([]);
      setCredits([]);
      setRegulars([]);
    } finally {
      setLoading(false);
    }
  };

  // Combine all unique customers for the table
  const allCustomers = [...highSpenders, ...regulars, ...credits].filter(
    (customer, index, self) =>
      customer?.customerId && 
      index === self.findIndex((c) => c.customerId === customer.customerId)
  );

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Customer Reports"
          description="Insights into regulars, top spenders and outstanding credits."
        />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading customer reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Customer Reports"
        description="Insights into regulars, top spenders and outstanding credits."
        actions={
          <button
            onClick={loadReports}
            className="px-4 h-10 rounded-md border border-border text-sm flex items-center gap-2 hover:bg-surface transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {message && (
        <div className={`mb-6 rounded-lg border p-4 text-sm shadow-sm ${
          messageType === "success" 
            ? "border-green-500 bg-green-50 text-green-700" 
            : "border-red-500 bg-red-50 text-red-700"
        }`}>
          {message}
        </div>
      )}

      {error && !message && (
        <div className="mb-6 rounded-lg border border-red-500 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Spenders Card */}
        <ReportCard
          title="Top Spenders"
          icon={Award}
          accent="bg-primary text-primary-foreground"
        >
          {highSpenders.length > 0 ? (
            highSpenders.map((c, i) => (
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
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No high spenders found.
            </div>
          )}
        </ReportCard>

        {/* Regular Customers Card */}
        <ReportCard
          title="Regular Customers"
          icon={TrendingUp}
          accent="bg-success/10 text-success"
        >
          {regulars.length > 0 ? (
            regulars.map((c) => (
              <div
                key={c.customerId}
                className="py-2.5 border-t border-border first:border-0"
              >
                <div className="text-sm font-medium">
                  {c.firstName} {c.lastName}
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-between mt-1">
                  <span>Loyalty Points: {c.loyaltyPoints || 0}</span>
                  {c.totalSpent && (
                    <span>Spent: Rs. {Number(c.totalSpent).toLocaleString()}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No regular customers found.
            </div>
          )}
        </ReportCard>

        {/* Pending Credits Card */}
        <ReportCard
          title="Pending Credits"
          icon={AlertCircle}
          accent="bg-destructive/10 text-destructive"
        >
          {credits.length > 0 ? (
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
                  Rs. {Number(c.creditBalance || 0).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No pending credits found.
            </div>
          )}
        </ReportCard>
      </div>

      {/* All Customers Table */}
      <div className="mt-6 bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border font-display font-semibold flex items-center justify-between">
          <span>All Report Customers</span>
          <span className="text-xs text-muted-foreground font-normal">
            {allCustomers.length} customers found
          </span>
        </div>

        {allCustomers.length > 0 ? (
          <div className="overflow-x-auto">
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
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No customers found. Add some customers to see reports.
          </div>
        )}
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

// Helper function to convert API response to array
function toArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.data)) return data.data;
  if (data?.result && Array.isArray(data.result)) return data.result;
  
  // If it's a single object, wrap it in an array
  if (typeof data === 'object' && data.customerId) {
    return [data];
  }
  
  return [];
}

// API Functions using apiFetch
async function getHighSpenders() {
  try {
    const response = await apiFetch("/customers/reports/high-spenders");
    return response;
  } catch (error) {
    console.error("Error fetching high spenders:", error);
    throw error;
  }
}

async function getPendingCredits() {
  try {
    const response = await apiFetch("/customers/reports/pending-credits");
    return response;
  } catch (error) {
    console.error("Error fetching pending credits:", error);
    throw error;
  }
}

async function getRegularCustomers() {
  try {
    const response = await apiFetch("/customers/reports/regulars");
    return response;
  } catch (error) {
    console.error("Error fetching regular customers:", error);
    throw error;
  }
}

export default CustomersReport;