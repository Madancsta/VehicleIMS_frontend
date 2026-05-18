import { PageHeader } from "../components/PageHeader";
import { TrendingUp, Users, Package, AlertTriangle, DollarSign, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://localhost:7280/api").replace(/\/$/, "");

function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalRevenue: 0,
            activeCustomersCount: 0,
            totalPartsCount: 0,
            lowStockCount: 0,
            outstandingCredit: 0,
            totalExpenses: 0,
            profitMargin: 0
        },
        monthlyRevenue: [],
        alerts: [],
        recentSales: [],
        topCustomers: []
    });

    const getAuthHeaders = () => {
        const token = localStorage.getItem("accessToken");
        return {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");
            
            const response = await fetch(`${API_BASE_URL}/adminDashboard/data`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Authentication required. Please login again.");
                }
                if (response.status === 403) {
                    throw new Error("Admin access required.");
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setDashboardData(data);
        } catch (err) {
            console.error("Dashboard error:", err);
            setError(err.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const { stats, monthlyRevenue, alerts, recentSales } = dashboardData;
    
    const maxRev = monthlyRevenue.length > 0 
        ? Math.max(...monthlyRevenue.map(m => m.revenue))
        : 1;

    const statCards = [
        { 
            label: "Total Revenue", 
            value: `Rs. ${stats.totalRevenue.toLocaleString()}`, 
            icon: DollarSign, 
            change: `${stats.profitMargin.toFixed(1)}% margin` 
        },
        { 
            label: "Active Customers", 
            value: stats.activeCustomersCount, 
            icon: Users, 
            change: "Active accounts" 
        },
        { 
            label: "Parts in stock", 
            value: stats.totalPartsCount, 
            icon: Package, 
            change: `${stats.lowStockCount} low stock` 
        },
        { 
            label: "Outstanding Credit", 
            value: `Rs. ${stats.outstandingCredit.toLocaleString()}`, 
            icon: TrendingUp, 
            change: stats.outstandingCredit > 10000 ? "Review needed" : "Within limit" 
        },
    ];

    if (loading) {
        return (
            <div>
                <PageHeader title="Admin Dashboard" description="Real-time overview of your workshop's operations." />
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <PageHeader title="Admin Dashboard" description="Real-time overview of your workshop's operations." />
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={fetchDashboardData}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader 
                title="Admin Dashboard" 
                description="Real-time overview of your workshop's operations."
                actions={
                    <button 
                        onClick={fetchDashboardData}
                        className="px-3 py-2 rounded-md border border-border hover:bg-surface flex items-center gap-2 text-sm"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="stat-card">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                                    <div className="font-display text-2xl font-bold mt-2">{s.value}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{s.change}</div>
                                </div>
                                <div className="h-9 w-9 rounded-md bg-surface flex items-center justify-center">
                                    <Icon className="h-4 w-4"/>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="col-span-2 bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="font-display font-semibold">Revenue vs Expenses</div>
                            <div className="text-xs text-muted-foreground">Last {monthlyRevenue.length} months</div>
                        </div>
                        <div className="flex gap-3 text-xs">
                            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary"/> Revenue</span>
                            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-muted-foreground"/> Expenses</span>
                        </div>
                    </div>
                    
                    {monthlyRevenue.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No revenue data available
                        </div>
                    ) : (
                        <div className="flex items-end gap-4 h-56">
                            {monthlyRevenue.map((m) => (
                                <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex items-end gap-1 h-full">
                                        <div 
                                            className="flex-1 bg-primary rounded-t transition-all duration-500" 
                                            style={{ height: `${(m.revenue / maxRev) * 100}%` }}
                                        />
                                        <div 
                                            className="flex-1 bg-muted-foreground/40 rounded-t transition-all duration-500" 
                                            style={{ height: `${(m.expenses / maxRev) * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground">{m.month}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Alerts */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="font-display font-semibold mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning"/> Alerts
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {alerts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No alerts at this time
                            </div>
                        ) : (
                            alerts.map((alert) => (
                                <div key={alert.id} className="p-3 rounded-md bg-surface border border-border">
                                    <div className="text-sm">{alert.message}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{alert.timeAgo}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Sales Table */}
            <div className="mt-6 bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-6 border-b border-border font-display font-semibold">Recent Sales</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <th className="text-left px-6 py-3">Invoice</th>
                                <th className="text-left px-6 py-3">Customer</th>
                                <th className="text-left px-6 py-3">Date</th>
                                <th className="text-right px-6 py-3">Total</th>
                                <th className="text-right px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSales.length === 0 ? (
                                <tr className="border-t border-border">
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No sales found
                                    </td>
                                </tr>
                            ) : (
                                recentSales.map((sale) => (
                                    <tr key={sale.salesId} className="border-t border-border hover:bg-surface">
                                        <td className="px-6 py-3 font-mono text-xs">{sale.invoiceNumber}</td>
                                        <td className="px-6 py-3">{sale.customerName}</td>
                                        <td className="px-6 py-3 text-muted-foreground">
                                            {new Date(sale.salesDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3 text-right font-medium">
                                            Rs. {sale.salesAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${
                                                sale.paymentStatus === "Completed" 
                                                    ? "bg-success/10 text-success" 
                                                    : "bg-warning/20 text-warning-foreground"
                                            }`}>
                                                {sale.paymentStatus === "Completed" ? "Paid" : sale.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;