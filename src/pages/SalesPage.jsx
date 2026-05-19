import { PageHeader } from "../components/PageHeader";
import { Plus, Trash2, Mail, Printer, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from '../api/clientApi';

function SalesPage() {
    const [items, setItems] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [parts, setParts] = useState([]);
    const [services, setServices] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [selectedVehicleId, setSelectedVehicleId] = useState("");
    const [selectedBookingId, setSelectedBookingId] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [lastSale, setLastSale] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
    
    // Fetch data on mount
    useEffect(() => {
        const loadInitialData = async () => {
            setPageLoading(true);
            await Promise.all([
                loadCustomers(),
                loadParts(),
                loadServices()
            ]);
            setPageLoading(false);
        };
        
        loadInitialData();
    }, []);
    
    // Load bookings and vehicles when customer changes
    useEffect(() => {
        if (selectedCustomerId) {
            loadBookingsByCustomer(selectedCustomerId);
            loadVehicles(selectedCustomerId);
        } else {
            setBookings([]);
            setVehicles([]);
        }
    }, [selectedCustomerId]);
    
    // Load booking details when a booking is selected
    useEffect(() => {
        if (selectedBookingId) {
            loadBookingDetails(selectedBookingId);
        } else {
            setSelectedBookingDetails(null);
        }
    }, [selectedBookingId]);
    
    const loadCustomers = useCallback(async () => {
        try {
            const data = await getCustomers();
            const customersList = Array.isArray(data) ? data : data?.items || data?.$values || [];
            setCustomers(customersList);
            return customersList;
        } catch (error) {
            console.error("Failed to load customers:", error);
            setMessage("Could not load customers. Please refresh the page.");
            return [];
        }
    }, []);
    
    const loadParts = useCallback(async () => {
        try {
            const data = await getParts();
            const partsList = Array.isArray(data) ? data : data?.items || data?.$values || [];
            setParts(partsList);
            return partsList;
        } catch (error) {
            console.error("Failed to load parts:", error);
            setMessage("Could not load parts. Please refresh the page.");
            return [];
        }
    }, []);
    
    const loadServices = useCallback(async () => {
        try {
            const data = await getServices();
            const servicesList = Array.isArray(data) ? data : data?.items || data?.$values || [];
            setServices(servicesList);
            return servicesList;
        } catch (error) {
            console.error("Failed to load services:", error);
            return [];
        }
    }, []);
    
    const loadVehicles = useCallback(async (customerId) => {
        if (!customerId) {
            setVehicles([]);
            return;
        }
        
        try {
            const data = await getVehicles(customerId);
            const vehiclesList = Array.isArray(data) ? data : data?.items || data?.$values || [];
            setVehicles(vehiclesList);
        } catch (error) {
            console.error("Failed to load vehicles:", error);
            setVehicles([]);
        }
    }, []);
    
    const loadBookingsByCustomer = useCallback(async (customerId) => {
        if (!customerId) {
            setBookings([]);
            return;
        }
        
        try {
            const data = await getBookingsByCustomer(customerId);
            const bookingsList = Array.isArray(data) ? data : data?.items || data?.$values || [];
            setBookings(bookingsList);
        } catch (error) {
            console.error("Failed to load bookings:", error);
            setBookings([]);
        }
    }, []);
    
    // NEW: Load booking details including parts and service
    const loadBookingDetails = useCallback(async (bookingId) => {
        try {
            const bookingDetails = await getBookingDetails(bookingId);
            setSelectedBookingDetails(bookingDetails);
            
            // Auto-set service type from booking
            if (bookingDetails.serviceType) {
                // Find matching service ID based on service type
                const matchingService = services.find(s => 
                    s.serviceType?.toLowerCase() === bookingDetails.serviceType?.toLowerCase()
                );
                if (matchingService) {
                    setSelectedServiceId(matchingService.serviceId.toString());
                }
            }
            
            // Auto-set vehicle from booking
            if (bookingDetails.vehicleId) {
                setSelectedVehicleId(bookingDetails.vehicleId.toString());
            }
            
            // Auto-add parts from booking's request parts
            if (bookingDetails.parts && bookingDetails.parts.length > 0) {
                const bookingParts = [];
                for (const requestPart of bookingDetails.parts) {
                    // Find the part in the parts list
                    const part = parts.find(p => p.partId === requestPart.partId);
                    if (part) {
                        bookingParts.push({
                            partId: part.partId,
                            name: part.partName,
                            quantity: requestPart.quantity || 1,
                            unitPrice: part.unitPrice || part.partPrice
                        });
                    }
                }
                
                // Merge with existing items (avoid duplicates)
                const updatedItems = [...items];
                for (const bookingPart of bookingParts) {
                    const existingIndex = updatedItems.findIndex(item => item.partId === bookingPart.partId);
                    if (existingIndex >= 0) {
                        updatedItems[existingIndex].quantity += bookingPart.quantity;
                    } else {
                        updatedItems.push(bookingPart);
                    }
                }
                setItems(updatedItems);
                
                setMessage(`Loaded parts from booking #${bookingId}`);
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (error) {
            console.error("Failed to load booking details:", error);
            setMessage("Could not load booking details.");
        }
    }, [services, parts, items]);
    
    const partsTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    // Get selected service details
    const selectedService = services.find(s => s.serviceId === parseInt(selectedServiceId));
    const serviceCharge = selectedService?.serviceCharge || 0;
    
    const subtotal = partsTotal + serviceCharge;
    const discount = subtotal > 5000 ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal - discount;
    
    const handleCompleteSale = async () => {
        if (!selectedCustomerId) {
            alert("Please select a customer");
            return;
        }
        
        if (items.length === 0 && !selectedServiceId) {
            alert("Please add at least one part or select a service");
            return;
        }
        
        setLoading(true);
        setMessage("");
        
        try {
            const payload = {
                customerId: parseInt(selectedCustomerId),
                serviceId: selectedServiceId ? parseInt(selectedServiceId) : null,
                vehicleId: selectedVehicleId ? parseInt(selectedVehicleId) : null,
                bookingId: selectedBookingId ? parseInt(selectedBookingId) : null,
                items: items.map(item => ({
                    partId: parseInt(item.partId),
                    quantity: item.quantity
                })),
                paymentMethod: paymentMethod.toLowerCase()
            };
            
            console.log("Sending payload:", payload);
            
            const result = await createSale(payload);
            setLastSale(result);
            setMessage(`Sale completed successfully! Invoice #${result.invoiceNumber}`);
            
            // Reset form after successful sale
            setItems([]);
            setSelectedServiceId("");
            setSelectedVehicleId("");
            setSelectedBookingId("");
            setSelectedBookingDetails(null);
            setSelectedCustomerId("");
            
        } catch (err) {
            console.error("Sale error:", err);
            setMessage(err.message || "Unable to create sale.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleSendInvoiceEmail = async () => {
        if (!lastSale?.salesId) {
            alert("Please complete a sale first before sending invoice.");
            return;
        }
        
        const customer = customers.find(c => c.customerId === parseInt(selectedCustomerId));
        if (!customer?.email) {
            alert("Customer does not have an email address.");
            return;
        }
        
        try {
            await sendInvoiceEmail(lastSale.salesId, customer.email);
            alert(`Invoice sent successfully to ${customer.email}`);
        } catch (err) {
            alert(err.message || "Failed to send invoice email.");
        }
    };
    
    const handlePrint = async () => {
        if (!lastSale?.salesId) {
            alert("Please complete a sale first before printing invoice.");
            return;
        }
        
        try {
            const invoice = await getInvoice(lastSale.salesId);
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Invoice #${invoice.invoiceNumber}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 40px; }
                            .header { text-align: center; margin-bottom: 30px; }
                            .invoice-details { margin-bottom: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f2f2f2; }
                            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>INVOICE</h1>
                            <p>${invoice.invoiceNumber}</p>
                        </div>
                        <div class="invoice-details">
                            <p><strong>Date:</strong> ${new Date(invoice.salesDate).toLocaleDateString()}</p>
                            <p><strong>Customer:</strong> ${invoice.customerName}</p>
                            <p><strong>Payment Method:</strong> ${invoice.paymentMethod}</p>
                        </div>
                        <table>
                            <thead>
                                <tr><th>Item</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr>
                            </thead>
                            <tbody>
                                ${invoice.items.map(item => `
                                    <tr>
                                        <td>${item.partName}</td>
                                        <td>${item.quantity}</td>
                                        <td>Rs. ${item.unitPrice.toLocaleString()}</td>
                                        <td>Rs. ${item.lineTotal.toLocaleString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <div class="total">
                            <p>Subtotal: Rs. ${invoice.subtotal?.toLocaleString() || (invoice.partsTotal + invoice.serviceCharge).toLocaleString()}</p>
                            <p>Discount (10%): Rs. ${invoice.discount?.toLocaleString() || 0}</p>
                            <p>Total: Rs. ${invoice.total?.toLocaleString() || invoice.salesAmount?.toLocaleString()}</p>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        } catch (err) {
            console.error("Print error:", err);
            alert("Failed to load invoice for printing.");
        }
    };
    
    const addPartToCart = (part) => {
        const existingItem = items.find(item => item.partId === part.partId);
        if (existingItem) {
            setItems(items.map(item => 
                item.partId === part.partId 
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setItems([...items, { 
                partId: part.partId, 
                name: part.partName, 
                quantity: 1, 
                unitPrice: part.unitPrice || part.partPrice
            }]);
        }
    };
    
    const updateQuantity = (index, newQuantity) => {
        if (newQuantity < 1) {
            removeItem(index);
        } else {
            setItems(items.map((item, i) => 
                i === index ? { ...item, quantity: newQuantity } : item
            ));
        }
    };
    
    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };
    
    if (pageLoading) {
        return (
            <div>
                <PageHeader title="Sales / Invoice" description="Create a new sale and generate invoice." />
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-muted-foreground">Loading data...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <PageHeader title="Sales / Invoice" description="Create a new sale and generate invoice." />
            
            {message && (
                <div className={`mb-6 rounded-lg border p-4 text-sm shadow-sm ${
                    message.includes("success") || message.includes("Successfully") || message.includes("Loaded")
                        ? "border-green-500 bg-green-50 text-green-700" 
                        : "border-red-500 bg-red-50 text-red-700"
                }`}>
                    {message}
                </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                    {/* Customer Information */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="font-display font-semibold mb-4">Customer Information</div>
                        <select 
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        >
                            <option value="">Select Customer</option>
                            {customers.map(c => (
                                <option key={c.customerId} value={c.customerId}>
                                    {c.firstName} {c.lastName} — {c.phoneNumber}
                                </option>
                            ))}
                        </select>
                        {customers.length === 0 && (
                            <p className="text-sm text-muted-foreground mt-2">No customers found. Please add customers first.</p>
                        )}
                    </div>
                    
                    {/* Service Selection */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="font-display font-semibold mb-4">Service Selection</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Service</label>
                                <select 
                                    value={selectedServiceId}
                                    onChange={(e) => setSelectedServiceId(e.target.value)}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                >
                                    <option value="">Select Service (Optional)</option>
                                    {services.map(s => (
                                        <option key={s.serviceId} value={s.serviceId}>
                                            {s.serviceType} - {s.vehicleType} (Rs. {s.serviceCharge})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Vehicle</label>
                                <select 
                                    value={selectedVehicleId}
                                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                    disabled={!selectedCustomerId}
                                >
                                    <option value="">Select Vehicle (Optional)</option>
                                    {vehicles.map(v => (
                                        <option key={v.vehicleId} value={v.vehicleId}>
                                            {v.brand} {v.model} ({v.year}) - {v.vehicleNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    {/* Booking Selection (if applicable) */}
                    {bookings.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-6">
                            <div className="font-display font-semibold mb-4">Booking Reference</div>
                            <select 
                                value={selectedBookingId}
                                onChange={(e) => setSelectedBookingId(e.target.value)}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                            >
                                <option value="">Select Existing Booking</option>
                                {bookings
                                    .filter(b => {
                                        const status = b.bookingStatus || b.status;
                                        return status === "Pending" || status === "Confirmed" || status === "0" || status === "1";
                                    })
                                    .map(b => (
                                        <option key={b.bookingId} value={b.bookingId}>
                                            Booking #{b.bookingId} - {new Date(b.bookingDate).toLocaleDateString()} - {b.bookingStatus || b.status}
                                        </option>
                                    ))}
                            </select>
                            {selectedBookingDetails && (
                                <div className="mt-3 p-3 bg-surface rounded-md text-sm">
                                    <div className="font-medium mb-1">Booking Details:</div>
                                    <div className="text-muted-foreground">
                                        {selectedBookingDetails.serviceType && (
                                            <div>Service: {selectedBookingDetails.serviceType}</div>
                                        )}
                                        {selectedBookingDetails.parts && selectedBookingDetails.parts.length > 0 && (
                                            <div>Parts: {selectedBookingDetails.parts.length} item(s) loaded</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Parts & Items */}
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <div className="font-display font-semibold">Parts & Items</div>
                            <div className="text-sm text-muted-foreground">
                                {items.length} item(s)
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                                    <tr>
                                        <th className="text-left px-6 py-3">Part</th>
                                        <th className="text-center px-6 py-3">Quantity</th>
                                        <th className="text-right px-6 py-3">Unit Price</th>
                                        <th className="text-right px-6 py-3">Total</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr className="border-t border-border">
                                            <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                                No items added. Click on parts below to add them or select a booking.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item, idx) => (
                                            <tr key={idx} className="border-t border-border">
                                                <td className="px-6 py-3 font-medium">{item.name}</td>
                                                <td className="px-6 py-3 text-center">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(idx, parseInt(e.target.value) || 1)}
                                                        className="w-20 text-center px-2 py-1 rounded border border-input bg-background"
                                                    />
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono">
                                                    Rs. {item.unitPrice.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-3 text-right font-medium">
                                                    Rs. {(item.quantity * item.unitPrice).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <button 
                                                        onClick={() => removeItem(idx)} 
                                                        className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-surface text-destructive"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5"/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {/* Quick add part */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="font-display font-semibold mb-4">Quick Add Parts</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {parts.slice(0, 9).map(p => (
                                <button 
                                    key={p.partId} 
                                    onClick={() => addPartToCart(p)} 
                                    className="p-3 rounded-md border border-border hover:bg-surface text-left transition-colors"
                                >
                                    <div className="text-sm font-medium truncate">{p.partName}</div>
                                    <div className="text-xs text-muted-foreground font-mono mt-1">
                                        Rs. {(p.unitPrice || p.partPrice || 0).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Stock: {p.stockQuantity}
                                    </div>
                                </button>
                            ))}
                        </div>
                        {parts.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No parts available.</p>
                        )}
                    </div>
                </div>
                
                {/* Invoice Summary */}
                <div className="bg-card border border-border rounded-lg p-6 h-fit sticky top-8">
                    <div className="font-display font-semibold mb-4">Invoice Summary</div>
                    <div className="space-y-2 text-sm">
                        <Row label="Parts Total" value={`Rs. ${partsTotal.toLocaleString()}`}/>
                        {serviceCharge > 0 && (
                            <Row label={`Service Charge (${selectedService?.serviceType})`} 
                                 value={`Rs. ${serviceCharge.toLocaleString()}`}/>
                        )}
                        <Row label="Subtotal" value={`Rs. ${subtotal.toLocaleString()}`}/>
                        {subtotal > 5000 && (
                            <Row label="Loyalty Discount (10%)" value={`- Rs. ${discount.toLocaleString()}`} muted/>
                        )}
                        <div className="border-t border-border pt-3 mt-3">
                            <Row label="Total Amount" value={`Rs. ${total.toLocaleString()}`} bold/>
                        </div>
                    </div>
                    
                    <div className="mt-6 space-y-2">
                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Payment Method</label>
                        <select 
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        >
                            <option>Cash</option>
                            <option>Card</option>
                            <option>Credit</option>
                        </select>
                    </div>
                    
                    <button 
                        onClick={handleCompleteSale}
                        disabled={loading}
                        className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Processing..." : "Complete Sale"}
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <button 
                            onClick={handlePrint}
                            disabled={!lastSale}
                            className="h-10 rounded-md border border-border text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            <Printer className="h-4 w-4"/> Print
                        </button>
                        <button 
                            onClick={handleSendInvoiceEmail}
                            disabled={!lastSale}
                            className="h-10 rounded-md border border-border text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            <Mail className="h-4 w-4"/> Email
                        </button>
                    </div>
                    
                    {lastSale && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-xs text-green-800">
                            <div className="font-semibold mb-1">Last Sale Created:</div>
                            <div>Invoice: {lastSale.invoiceNumber}</div>
                            <div>Amount: Rs. {lastSale.salesAmount?.toLocaleString()}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Row({ label, value, muted, bold }) {
    return (
        <div className="flex justify-between">
            <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
            <span className={`font-mono ${bold ? "font-bold text-base" : ""}`}>{value}</span>
        </div>
    );
}

// API endpoint functions
function getCustomers() {
    return apiFetch("/customers");
}

function getParts() {
    return apiFetch("/parts");
}

function getServices() {
    return apiFetch("/services");
}

function getVehicles(customerId) {
    return apiFetch(`/vehicle/customer/${customerId}`);
}

function getBookingsByCustomer(customerId) {
    return apiFetch(`/bookings/customer/${customerId}`);
}

// NEW: Get booking details including parts
function getBookingDetails(bookingId) {
    return apiFetch(`/bookings/${bookingId}/details`);
}

function createSale(data) {
    return apiFetch("/sales", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

function sendInvoiceEmail(salesId, recipientEmail) {
    return apiFetch(`/sales/${salesId}/send-invoice`, {
        method: "POST",
        body: JSON.stringify({ salesId, recipientEmail }),
    });
}

function getInvoice(salesId) {
    return apiFetch(`/sales/${salesId}/invoice`);
}

export default SalesPage;