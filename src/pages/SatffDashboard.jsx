import { Link } from "../components/Link";
import { PageHeader } from "../components/PageHeader";
import { ShoppingCart, UserPlus, Search, Calendar, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from '../api/clientApi';

function StaffDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dashboardData, setDashboardData] = useState({
        stats: {
            todaySalesCount: 0,
            todayRevenue: 0,
            activeCustomersCount: 0,
            pendingBookingsCount: 0,
            lowStockCount: 0
        },
        recentSales: [],
        quickActions: []
    });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");
            
            const data = await apiFetch("/staffDashboard/data");
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

    const { stats, recentSales } = dashboardData;

    const statCards = [
        ["Today's Sales", stats.todaySalesCount],
        ["Revenue Today", `Rs. ${stats.todayRevenue.toLocaleString()}`],
        ["Active Customers", stats.activeCustomersCount],
        ["Pending Bookings", stats.pendingBookingsCount],
    ];

    const quickActions = [
        { to: "/staff/sales", label: "New Sale", icon: ShoppingCart },
        { to: "/staff/customer-register", label: "Register Customer", icon: UserPlus },
        { to: "/staff/search", label: "Search Customer", icon: Search },
        { to: "/staff/customers", label: "Customer History", icon: Calendar },
    ];

    // Low stock warning
    const showLowStockWarning = stats.lowStockCount > 0;

    if (loading) {
        return (
            <div>
                <PageHeader title="Staff Dashboard" description="Quick access to daily operations." />
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <PageHeader title="Staff Dashboard" description="Quick access to daily operations." />
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
                title="Staff Dashboard" 
                description="Quick access to daily operations."
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

            {/* Low Stock Warning */}
            {showLowStockWarning && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                            Warning: {stats.lowStockCount} part(s) are running low on stock. Please check inventory.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map(([label, value]) => (
                    <div key={label} className="stat-card">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
                        <div className="font-display text-2xl font-bold mt-2">{value}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.to}
                            to={action.to}
                            className="
                                  bg-black
                                  border
                                  border-gray-200
                                  rounded-lg
                                  p-6
                                  hover:shadow-md
                                  hover:border-primary
                                  transition-all
                                  duration-200
                              ">
                            <Icon className="h-6 w-6 mb-3 text-white"/>
                            <div className="font-display font-semibold text-white">{action.label}</div>
                        </Link>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-6 border-b border-border font-display font-semibold flex justify-between items-center">
                    <span>Recent Sales Activity</span>
                    <button 
                        onClick={fetchDashboardData}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                        <RefreshCw className="h-3 w-3" />
                        Refresh
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <th className="text-left px-6 py-3">Invoice</th>
                                <th className="text-left px-6 py-3">Customer</th>
                                <th className="text-left px-6 py-3">Date</th>
                                <th className="text-right px-6 py-3">Total</th>
                                <th className="text-left px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSales.length === 0 ? (
                                <tr className="border-t border-border">
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No recent sales found
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
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                                                sale.paymentStatus === "Completed" 
                                                    ? "bg-green-100 text-green-800" 
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}>
                                                {sale.paymentStatus}
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

// Import AlertTriangle for the warning component
import { AlertTriangle } from "lucide-react";

export default StaffDashboardPage;