import { PageHeader } from "../components/PageHeader";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { getFinancialReport } from "../api/financialReportApi";

function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialReport = async () => {
      try {
        const data = await getFinancialReport();
        setReportData(data);
      } catch (error) {
        console.error("Failed to load financial report", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialReport();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground">
        Loading financial reports...
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6 text-destructive">
        Failed to load financial reports.
      </div>
    );
  }

  const {
    totalRevenue,
    totalExpenses,
    netProfit,
    monthlyBreakdown,
    outstandingCredits,
  } = reportData;

  const maxRevenue = Math.max(
    ...monthlyBreakdown.map((m) => Number(m.revenue)),
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
            Rs. {Number(totalRevenue).toLocaleString()}
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
            Rs. {Number(totalExpenses).toLocaleString()}
          </div>

          <div className="text-xs text-destructive mt-1 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            Operational expenses
          </div>
        </div>

        <div className="stat-card bg-primary text-primary-foreground border-primary">
          <div className="text-xs uppercase tracking-wider opacity-60">
            Net Profit
          </div>

          <div className="font-display text-3xl font-bold mt-2">
            Rs. {Number(netProfit).toLocaleString()}
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
            monthlyBreakdown.map((m) => (
              <div key={m.month}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{m.month}</span>

                  <span className="font-mono text-muted-foreground">
                    Rs. {Number(m.revenue).toLocaleString()}
                  </span>
                </div>

                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${(Number(m.revenue) / maxRevenue) * 100}%`,
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
                  <tr
                    key={index}
                    className="border-t border-border"
                  >
                    <td className="px-6 py-3 font-mono text-xs">
                      {credit.invoice}
                    </td>

                    <td className="px-6 py-3">
                      {credit.customer}
                    </td>

                    <td className="px-6 py-3 text-right">
                      Rs. {Number(credit.total).toLocaleString()}
                    </td>

                    <td className="px-6 py-3 text-right text-muted-foreground">
                      Rs. {Number(credit.paid).toLocaleString()}
                    </td>

                    <td className="px-6 py-3 text-right font-medium text-destructive">
                      Rs. {Number(credit.pending).toLocaleString()}
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

export default ReportsPage;