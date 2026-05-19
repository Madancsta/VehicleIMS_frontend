import { PageHeader } from "../components/PageHeader";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../api/clientApi";

function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [exporting, setExporting] = useState(false);

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

  const handleExportPDF = async () => {
    if (!reportData) return;
    setExporting(true);

    try {
      // Dynamically import jsPDF (must be installed: npm install jspdf)
      const { jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 20;

      // ── Title ─────────────────────────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Financial Report", margin, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(
        `Generated on ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        margin,
        y
      );
      doc.setTextColor(0);
      y += 12;

      // ── Summary Cards ─────────────────────────────────────────────────────
      const cardData = [
        { label: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString()}` },
        { label: "Total Expenses", value: `Rs. ${totalExpenses.toLocaleString()}` },
        {
          label: "Net Profit",
          value: `Rs. ${netProfit.toLocaleString()}`,
          note:
            totalRevenue > 0
              ? `${((netProfit / totalRevenue) * 100).toFixed(1)}% margin`
              : "0% margin",
        },
      ];

      const cardWidth = (pageWidth - margin * 2 - 8) / 3;
      cardData.forEach((card, i) => {
        const x = margin + i * (cardWidth + 4);
        doc.setFillColor(245, 247, 250);
        doc.roundedRect(x, y, cardWidth, 24, 2, 2, "F");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(card.label.toUpperCase(), x + 4, y + 7);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(30);
        doc.text(card.value, x + 4, y + 16);

        if (card.note) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text(card.note, x + 4, y + 22);
        }
      });
      doc.setTextColor(0);
      y += 32;

      // ── Monthly Breakdown ─────────────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Monthly Breakdown", margin, y);
      y += 6;

      if (monthlyBreakdown.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [["Month", "Revenue (Rs.)"]],
          body: monthlyBreakdown.map((m) => [
            m.month,
            Number(m.revenue || 0).toLocaleString(),
          ]),
          margin: { left: margin, right: margin },
          headStyles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [248, 249, 251] },
          styles: { fontSize: 10, cellPadding: 4 },
          columnStyles: { 1: { halign: "right" } },
        });
        y = doc.lastAutoTable.finalY + 10;
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text("No monthly data available.", margin, y);
        doc.setTextColor(0);
        y += 10;
      }

      // ── Outstanding Credits ───────────────────────────────────────────────
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Outstanding Credits", margin, y);
      y += 6;

      if (outstandingCredits.length > 0) {
        autoTable(doc, {
          startY: y,
          head: [["Invoice", "Customer", "Total (Rs.)", "Paid (Rs.)", "Pending (Rs.)"]],
          body: outstandingCredits.map((c) => [
            c.invoice,
            c.customer,
            Number(c.total || 0).toLocaleString(),
            Number(c.paid || 0).toLocaleString(),
            Number(c.pending || 0).toLocaleString(),
          ]),
          margin: { left: margin, right: margin },
          headStyles: { fillColor: [40, 40, 40], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [248, 249, 251] },
          styles: { fontSize: 9, cellPadding: 4 },
          columnStyles: {
            2: { halign: "right" },
            3: { halign: "right" },
            4: { halign: "right", textColor: [200, 50, 50] },
          },
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text("No outstanding credits found.", margin, y);
        doc.setTextColor(0);
      }

      // ── Footer ────────────────────────────────────────────────────────────
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(160);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" }
        );
      }

      doc.save("financial-report.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Make sure jspdf and jspdf-autotable are installed.");
    } finally {
      setExporting(false);
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
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="px-4 h-10 rounded-md border border-border flex items-center gap-2 hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting..." : "Export PDF"}
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
        <div className="font-display font-semibold mb-6">Monthly Breakdown</div>

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
                    <td className="px-6 py-3 font-mono text-xs">{credit.invoice}</td>
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