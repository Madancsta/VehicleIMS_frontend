import { PageHeader } from "../components/PageHeader";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../api/clientApi";

function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadFinancialReport();
  }, []);

  const loadFinancialReport = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getFinancialReport();
      setReportData(data);
    } catch (error) {
      console.error("Failed to load financial report:", error);
      setMessage("Could not load financial report. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Financial Reports"
          description="Revenue, expenses, profit and outstanding credits."
        />
        <div className="text-muted-foreground">Loading financial reports...</div>
      </div>
    );
  }

  if (message) {
    return (
      <div>
        <PageHeader
          title="Financial Reports"
          description="Revenue, expenses, profit and outstanding credits."
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-600">
          {message}
        </div>
      </div>
    );
  }

  const totalRevenue = Number(reportData?.totalRevenue || 0);
  const totalExpenses = Number(reportData?.totalExpenses || 0);
  const netProfit = Number(reportData?.netProfit || 0);
  const monthlyBreakdown = reportData?.monthlyBreakdown || [];
  const outstandingCredits = reportData?.outstandingCredits || [];

  const maxRevenue = Math.max(
    ...monthlyBreakdown.map((m) => Number(m.revenue || 0)),
    1
  );

  return (
    <div>
      <PageHeader
        title="Financial Reports"
        description="Revenue, expenses, profit and outstanding credits."
        actions={
          <button className="px-4 h-10 rounded-md border border-border flex items-center gap-2 hover:bg-surface">
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Revenue
          </div>
          <div className="font-display text-3xl font-bold mt-2">
            Rs. {totalRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-success mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Financial growth
          </div>
        </div>

        <div className="stat-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Expenses
          </div>
          <div className="font-display text-3xl font-bold mt-2">
            Rs. {totalExpenses.toLocaleString()}
          </div>
          <div className="text-xs text-destructive mt-1 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            Operational expenses
          </div>
        </div>

        <div className="stat-card">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Net Profit
          </div>
          <div className="font-display text-3xl font-bold mt-2">
            Rs. {netProfit.toLocaleString()}
          </div>
          <div className="text-xs opacity-60 mt-1">
            {totalRevenue > 0
              ? `${((netProfit / totalRevenue) * 100).toFixed(1)}% margin`
              : "0% margin"}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="font-display font-semibold mb-6">
          Monthly Breakdown
        </div>

        <div className="space-y-4">
          {monthlyBreakdown.length > 0 ? (
            monthlyBreakdown.map((m, index) => (
              <div key={`${m.month}-${index}`}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{m.month}</span>
                  <span className="font-mono text-muted-foreground">
                    Rs. {Number(m.revenue || 0).toLocaleString()}
                  </span>
                </div>

                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${(Number(m.revenue || 0) / maxRevenue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground text-sm">
              No monthly data available.
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-border font-display font-semibold">
          Outstanding Credits
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-6 py-3">Invoice</th>
                <th className="text-left px-6 py-3">Customer</th>
                <th className="text-right px-6 py-3">Total</th>
                <th className="text-right px-6 py-3">Paid</th>
                <th className="text-right px-6 py-3">Pending</th>
              </tr>
            </thead>

            <tbody>
              {outstandingCredits.length > 0 ? (
                outstandingCredits.map((credit, index) => (
                  <tr key={index} className="border-t border-border">
                    <td className="px-6 py-3 font-mono text-xs">
                      {credit.invoice}
                    </td>
                    <td className="px-6 py-3">{credit.customer}</td>
                    <td className="px-6 py-3 text-right">
                      Rs. {Number(credit.total || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-right text-muted-foreground">
                      Rs. {Number(credit.paid || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-destructive">
                      Rs. {Number(credit.pending || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-6 text-center text-muted-foreground"
                  >
                    No outstanding credits found.
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

function getFinancialReport() {
  return apiFetch("/FinancialReport");
}

export default ReportsPage;