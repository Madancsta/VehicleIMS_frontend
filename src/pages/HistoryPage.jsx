import { useState, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { Download, Eye, Printer } from "lucide-react";
import { Download, Eye, Printer } from "lucide-react";
import CustomerLayout from "../components/CustomerLayout";
import { apiFetch } from '../api/clientApi';

function HistoryPage() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewingOrder, setViewingOrder] = useState(null);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [summary, setSummary] = useState({ totalInvoices: 0, totalSpent: 0, thisMonth: 0 });

    const token = localStorage.getItem("accessToken");

    const fetchPurchaseHistory = async () => {
        setLoading(true);
        
        if (!token) {
            setError("Please login to view your purchase history");
            setLoading(false);
            return;
        }

        try {
            const data = await apiFetch("/customer/purchase-history");
            
            const orders = data.orders || (Array.isArray(data) ? data : []);
            const totalSpent = data.totalSpent || orders.reduce((sum, sale) => sum + (Number(sale.salesAmount) || 0), 0);
            const totalOrders = data.totalOrders || orders.length;
            
            setSales(orders);
            
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const thisMonthSales = orders.filter(sale => {
                const saleDate = new Date(sale.salesDate);
            const thisMonthSales = orders.filter(sale => {
                const saleDate = new Date(sale.salesDate);
                return !isNaN(saleDate.getTime()) && saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
            });
            const thisMonthTotal = thisMonthSales.reduce((sum, sale) => sum + (Number(sale.salesAmount) || 0), 0);
            const thisMonthTotal = thisMonthSales.reduce((sum, sale) => sum + (Number(sale.salesAmount) || 0), 0);

            setSummary({
                totalInvoices: totalOrders,
                totalInvoices: totalOrders,
                totalSpent: totalSpent,
                thisMonth: thisMonthTotal
            });
            setError("");
            
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Unable to load purchase history. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchaseHistory();
    }, []);

    const fetchOrderDetails = async (salesId) => {
        try {
            const data = await apiFetch(`/customer/purchase-history/orders/${salesId}`);
            setViewingOrder(data);
        } catch (err) {
            alert("Error loading order details");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid date";
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    const formatStatus = (status) => {
        if (status === "Completed" || status === "Paid") return "Paid";
        if (status === "Failed") return "Failed";
        if (status === "Completed" || status === "Paid") return "Paid";
        if (status === "Failed") return "Failed";
        return "Pending";
    };

    const getStatusColor = (status) => {
        const formatted = formatStatus(status);
        if (formatted === "Paid") return "bg-green-100 text-green-700";
        if (formatted === "Failed") return "bg-red-100 text-red-700";
        return "bg-yellow-100 text-yellow-700";
        if (formatted === "Paid") return "bg-green-100 text-green-700";
        if (formatted === "Failed") return "bg-red-100 text-red-700";
        return "bg-yellow-100 text-yellow-700";
    };

    const printInvoice = (sale) => {
        const printWindow = window.open('', '_blank');
        
        const itemsHtml = sale.items?.map(item => `
            <tr>
                <td style="padding: 10px;">${item.partName || "Item"}</td>
                <td style="padding: 10px; text-align: right;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right;">रु ${(item.unitPrice || 0).toLocaleString()}</td>
                <td style="padding: 10px; text-align: right;">रु ${((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}</td>
            </tr>
        `).join('') || '<tr><td colspan="4" style="padding: 10px; text-align: center;">No items</td></tr>';
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Invoice ${sale.invoiceNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .container { max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    h1 { margin: 0; }
                    .company { margin: 5px 0; color: #666; }
                    .title { margin: 20px 0 0 0; }
                    .info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .bill-to { margin-bottom: 30px; padding: 10px; background: #f5f5f5; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
                    td { padding: 10px; border-bottom: 1px solid #eee; }
                    .text-right { text-align: right; }
                    .total { font-weight: bold; border-top: 2px solid #ddd; }
                    .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
                    @media print {
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>GEARIX</h1>
                        <p class="company">Vehicle Parts & Services</p>
                        <p class="company">Kathmandu, Nepal</p>
                        <p class="company">Phone: +977-9800000000</p>
                        <h2 class="title">TAX INVOICE</h2>
                    </div>
                    
                    <div class="info">
                        <div>
                            <p><strong>Invoice Number:</strong> ${sale.invoiceNumber}</p>
                            <p><strong>Date:</strong> ${formatDate(sale.salesDate)}</p>
                        </div>
                        <div>
                            <p><strong>Payment Status:</strong> ${formatStatus(sale.paymentStatus)}</p>
                            <p><strong>Payment Method:</strong> ${sale.paymentMethod || "Cash"}</p>
                        </div>
                    </div>
                    
                    <div class="bill-to">
                        <h3>Bill To:</h3>
                        <p><strong>Name:</strong> Customer</p>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th class="text-right">Qty</th>
                                <th class="text-right">Unit Price</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                            <tr class="total">
                                <td colspan="3" class="text-right"><strong>Total Amount:</strong></td>
                                <td class="text-right"><strong>रु ${(sale.salesAmount || 0).toLocaleString()}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        <p>Thank you for your business!</p>
                        <p>This is a computer generated invoice - no signature required.</p>
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); }
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    const printInvoice = (sale) => {
        const printWindow = window.open('', '_blank');
        
        const itemsHtml = sale.items?.map(item => `
            <tr>
                <td style="padding: 10px;">${item.partName || "Item"}</td>
                <td style="padding: 10px; text-align: right;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right;">रु ${(item.unitPrice || 0).toLocaleString()}</td>
                <td style="padding: 10px; text-align: right;">रु ${((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}</td>
            </tr>
        `).join('') || '<tr><td colspan="4" style="padding: 10px; text-align: center;">No items</td></tr>';
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Invoice ${sale.invoiceNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    .container { max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    h1 { margin: 0; }
                    .company { margin: 5px 0; color: #666; }
                    .title { margin: 20px 0 0 0; }
                    .info { display: flex; justify-content: space-between; margin-bottom: 30px; }
                    .bill-to { margin-bottom: 30px; padding: 10px; background: #f5f5f5; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
                    td { padding: 10px; border-bottom: 1px solid #eee; }
                    .text-right { text-align: right; }
                    .total { font-weight: bold; border-top: 2px solid #ddd; }
                    .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
                    @media print {
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>GEARIX</h1>
                        <p class="company">Vehicle Parts & Services</p>
                        <p class="company">Kathmandu, Nepal</p>
                        <p class="company">Phone: +977-9800000000</p>
                        <h2 class="title">TAX INVOICE</h2>
                    </div>
                    
                    <div class="info">
                        <div>
                            <p><strong>Invoice Number:</strong> ${sale.invoiceNumber}</p>
                            <p><strong>Date:</strong> ${formatDate(sale.salesDate)}</p>
                        </div>
                        <div>
                            <p><strong>Payment Status:</strong> ${formatStatus(sale.paymentStatus)}</p>
                            <p><strong>Payment Method:</strong> ${sale.paymentMethod || "Cash"}</p>
                        </div>
                    </div>
                    
                    <div class="bill-to">
                        <h3>Bill To:</h3>
                        <p><strong>Name:</strong> Customer</p>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th class="text-right">Qty</th>
                                <th class="text-right">Unit Price</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                            <tr class="total">
                                <td colspan="3" class="text-right"><strong>Total Amount:</strong></td>
                                <td class="text-right"><strong>रु ${(sale.salesAmount || 0).toLocaleString()}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        <p>Thank you for your business!</p>
                        <p>This is a computer generated invoice - no signature required.</p>
                    </div>
                </div>
                <script>
                    window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); }
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    if (loading) {
        return (
            <CustomerLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                        <div className="text-lg text-muted-foreground">Loading purchase history...</div>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    if (error) {
        return (
            <CustomerLayout>
                <PageHeader title="Purchase History" description="View all your past purchases and invoices" />
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={() => fetchPurchaseHistory()} 
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:opacity-90"
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:opacity-90"
                    >
                        Try Again
                    </button>
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="stat-card">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Orders</div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Orders</div>
                    <div className="font-display text-2xl font-bold mt-2">{summary.totalInvoices}</div>
                </div>
                <div className="stat-card">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Spent</div>
                    <div className="font-display text-2xl font-bold mt-2">रु {summary.totalSpent.toLocaleString()}</div>
                    <div className="font-display text-2xl font-bold mt-2">रु {summary.totalSpent.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">This Month</div>
                    <div className="font-display text-2xl font-bold mt-2">रु {summary.thisMonth.toLocaleString()}</div>
                    <div className="font-display text-2xl font-bold mt-2">रु {summary.thisMonth.toLocaleString()}</div>
                </div>
            </div>

            {/* Orders Table */}
            {/* Orders Table */}
            {sales.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <p className="text-muted-foreground">No purchase history found.</p>
                </div>
            ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="text-left px-6 py-3">Invoice #</th>
                                    <th className="text-left px-6 py-3">Invoice #</th>
                                    <th className="text-left px-6 py-3">Date</th>
                                    <th className="text-right px-6 py-3">Items</th>
                                    <th className="text-right px-6 py-3">Total</th>
                                    <th className="text-center px-6 py-3">Status</th>
                                    <th className="text-center px-6 py-3">Status</th>
                                    <th className="text-right px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((sale) => (
                                    <tr key={sale.salesId} className="border-t border-border hover:bg-surface/50 transition-colors">
                                        <td className="px-6 py-3 font-mono text-sm font-medium">
                                            {sale.invoiceNumber || `INV-${sale.salesId}`}
                                        </td>
                                        <td className="px-6 py-3 text-muted-foreground">
                                            {formatDate(sale.salesDate)}
                                        </td>
                                    <tr key={sale.salesId} className="border-t border-border hover:bg-surface/50 transition-colors">
                                        <td className="px-6 py-3 font-mono text-sm font-medium">
                                            {sale.invoiceNumber || `INV-${sale.salesId}`}
                                        </td>
                                        <td className="px-6 py-3 text-muted-foreground">
                                            {formatDate(sale.salesDate)}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            {sale.items?.length || sale.itemCount || "-"}
                                        </td>
                                        <td className="px-6 py-3 text-right font-semibold">
                                            रु {(sale.salesAmount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.paymentStatus)}`}>
                                                {formatStatus(sale.paymentStatus)}
                                            {sale.items?.length || sale.itemCount || "-"}
                                        </td>
                                        <td className="px-6 py-3 text-right font-semibold">
                                            रु {(sale.salesAmount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.paymentStatus)}`}>
                                                {formatStatus(sale.paymentStatus)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => fetchOrderDetails(sale.salesId)}
                                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-surface transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => printInvoice(sale)}
                                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-surface transition-colors"
                                                    title="Print Invoice"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => fetchOrderDetails(sale.salesId)}
                                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-surface transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => printInvoice(sale)}
                                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-surface transition-colors"
                                                    title="Print Invoice"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {viewingOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingOrder(null)}>
                    <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-card border-b border-border p-4 flex justify-between items-center">
                            <h3 className="font-display text-lg font-semibold">Order Details</h3>
                            <button onClick={() => setViewingOrder(null)} className="text-muted-foreground hover:text-foreground">✕</button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <div className="text-xs text-muted-foreground">Invoice Number</div>
                                    <div className="font-medium">{viewingOrder.invoiceNumber}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Date</div>
                                    <div className="font-medium">{formatDate(viewingOrder.salesDate)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Payment Status</div>
                                    <div className="font-medium">{formatStatus(viewingOrder.paymentStatus)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Payment Method</div>
                                    <div className="font-medium">{viewingOrder.paymentMethod || "N/A"}</div>
                                </div>
                            </div>
                            
                            <div className="border-t border-border pt-4">
                                <h4 className="font-medium mb-3">Items</h4>
                                <table className="w-full text-sm">
                                    <thead className="bg-surface">
                                        <tr>
                                            <th className="text-left px-3 py-2">Item</th>
                                            <th className="text-right px-3 py-2">Qty</th>
                                            <th className="text-right px-3 py-2">Price</th>
                                            <th className="text-right px-3 py-2">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewingOrder.items?.map((item, idx) => (
                                            <tr key={idx} className="border-t border-border">
                                                <td className="px-3 py-2">{item.partName || `Item ${idx + 1}`}</td>
                                                <td className="px-3 py-2 text-right">{item.quantity}</td>
                                                <td className="px-3 py-2 text-right">रु {item.unitPrice?.toLocaleString()}</td>
                                                <td className="px-3 py-2 text-right font-medium">रु {(item.quantity * item.unitPrice).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="border-t-2 border-border bg-surface/50">
                                        <tr>
                                            <td colSpan={3} className="px-3 py-2 text-right font-semibold">Total</td>
                                            <td className="px-3 py-2 text-right font-bold">रु {viewingOrder.salesAmount?.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-card border-t border-border p-4 flex justify-end">
                            <button onClick={() => setViewingOrder(null)} className="px-4 py-2 bg-primary text-white rounded-md">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {viewingOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingOrder(null)}>
                    <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-card border-b border-border p-4 flex justify-between items-center">
                            <h3 className="font-display text-lg font-semibold">Order Details</h3>
                            <button onClick={() => setViewingOrder(null)} className="text-muted-foreground hover:text-foreground">✕</button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <div className="text-xs text-muted-foreground">Invoice Number</div>
                                    <div className="font-medium">{viewingOrder.invoiceNumber}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Date</div>
                                    <div className="font-medium">{formatDate(viewingOrder.salesDate)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Payment Status</div>
                                    <div className="font-medium">{formatStatus(viewingOrder.paymentStatus)}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground">Payment Method</div>
                                    <div className="font-medium">{viewingOrder.paymentMethod || "N/A"}</div>
                                </div>
                            </div>
                            
                            <div className="border-t border-border pt-4">
                                <h4 className="font-medium mb-3">Items</h4>
                                <table className="w-full text-sm">
                                    <thead className="bg-surface">
                                        <tr>
                                            <th className="text-left px-3 py-2">Item</th>
                                            <th className="text-right px-3 py-2">Qty</th>
                                            <th className="text-right px-3 py-2">Price</th>
                                            <th className="text-right px-3 py-2">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewingOrder.items?.map((item, idx) => (
                                            <tr key={idx} className="border-t border-border">
                                                <td className="px-3 py-2">{item.partName || `Item ${idx + 1}`}</td>
                                                <td className="px-3 py-2 text-right">{item.quantity}</td>
                                                <td className="px-3 py-2 text-right">रु {item.unitPrice?.toLocaleString()}</td>
                                                <td className="px-3 py-2 text-right font-medium">रु {(item.quantity * item.unitPrice).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="border-t-2 border-border bg-surface/50">
                                        <tr>
                                            <td colSpan={3} className="px-3 py-2 text-right font-semibold">Total</td>
                                            <td className="px-3 py-2 text-right font-bold">रु {viewingOrder.salesAmount?.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-card border-t border-border p-4 flex justify-end">
                            <button onClick={() => setViewingOrder(null)} className="px-4 py-2 bg-primary text-white rounded-md">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}

export default HistoryPage;