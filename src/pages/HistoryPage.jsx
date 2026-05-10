import { useState, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { Download, Mail, Eye } from "lucide-react";
import CustomerLayout from "../components/CustomerLayout";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5229/api").replace(/\/$/, "");

function HistoryPage() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [summary, setSummary] = useState({ totalInvoices: 0, totalSpent: 0, thisMonth: 0 });

    const token = localStorage.getItem("accessToken");
    const customerId = localStorage.getItem("customerId");

    const fetchPurchaseHistory = async () => {
        if (!token || !customerId) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/sales/customer/${customerId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setSales(data);
                
                // Calculate summary
                const totalSpent = data.reduce((sum, sale) => sum + (sale.salesAmount || sale.total || 0), 0);
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                const thisMonthSales = data.filter(sale => {
                    const saleDate = new Date(sale.salesDate || sale.date);
                    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
                });
                const thisMonthTotal = thisMonthSales.reduce((sum, sale) => sum + (sale.salesAmount || sale.total || 0), 0);

                setSummary({
                    totalInvoices: data.length,
                    totalSpent: totalSpent,
                    thisMonth: thisMonthTotal
                });
            } else if (response.status === 404) {
                setSales([]);
                setSummary({ totalInvoices: 0, totalSpent: 0, thisMonth: 0 });
            } else {
                setError("Failed to fetch purchase history");
            }
        } catch (err) {
            setError("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchaseHistory();
    }, [customerId]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    const formatStatus = (status) => {
        if (status === 1 || status === "Completed" || status === "Paid") return "Paid";
        if (status === 2 || status === "Failed") return "Failed";
        return "Pending";
    };

    const getStatusColor = (status) => {
        const formatted = formatStatus(status);
        if (formatted === "Paid") return "bg-success/10 text-success";
        if (formatted === "Failed") return "bg-red-100 text-red-600";
        return "bg-warning/20 text-warning-foreground";
    };

    const downloadInvoice = async (saleId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/sales/${saleId}/invoice`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `invoice_${saleId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert("Failed to download invoice");
            }
        } catch (err) {
            alert("Error downloading invoice");
        }
    };

    if (loading) {
        return (
            <CustomerLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-lg text-muted-foreground">Loading purchase history...</div>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    if (!customerId) {
        return (
            <CustomerLayout>
                <PageHeader title="Purchase History" description="View all your past purchases and invoices" />
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <p className="text-yellow-600">Please create a customer account to view purchase history.</p>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <PageHeader 
                title="Purchase History" 
                description="All your past invoices and purchases."
            />

            {error && (
                <div className="mb-6 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="stat-card">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Invoices</div>
                    <div className="font-display text-2xl font-bold mt-2">{summary.totalInvoices}</div>
                </div>
                <div className="stat-card">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Spent</div>
                    <div className="font-display text-2xl font-bold mt-2">Rs. {summary.totalSpent.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">This Month</div>
                    <div className="font-display text-2xl font-bold mt-2">Rs. {summary.thisMonth.toLocaleString()}</div>
                </div>
            </div>

            {sales.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <p className="text-muted-foreground">No purchase history found.</p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="w-full text-sm">
                            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="text-left px-6 py-3">Invoice</th>
                                    <th className="text-left px-6 py-3">Date</th>
                                    <th className="text-right px-6 py-3">Items</th>
                                    <th className="text-right px-6 py-3">Total</th>
                                    <th className="text-right px-6 py-3">Status</th>
                                    <th className="text-right px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((sale) => (
                                    <tr key={sale.salesId || sale.id} className="border-t border-border hover:bg-surface">
                                        <td className="px-6 py-3 font-mono text-xs">#{sale.salesId || sale.id}</td>
                                        <td className="px-6 py-3 text-muted-foreground">{formatDate(sale.salesDate || sale.date)}</td>
                                        <td className="px-6 py-3 text-right">{sale.items || sale.itemCount || "-"}</td>
                                        <td className="px-6 py-3 text-right font-medium">Rs. {(sale.salesAmount || sale.total || 0).toLocaleString()}</td>
                                        <td className="px-6 py-3 text-right">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(sale.paymentStatus || sale.status)}`}>
                                                {formatStatus(sale.paymentStatus || sale.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <button 
                                                onClick={() => downloadInvoice(sale.salesId || sale.id)}
                                                className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-background"
                                                title="Download Invoice"
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                            </button>
                                            <button 
                                                className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-background"
                                                title="View Details"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}

export default HistoryPage;