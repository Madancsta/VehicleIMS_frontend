import { PageHeader } from "../components/PageHeader";
import { Search as SearchIcon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from '../api/clientApi';

function SearchPage() {
    const [q, setQ] = useState("");
    const [tab, setTab] = useState("customers");
    const [loading, setLoading] = useState(false);
    
    // Data states
    const [customers, setCustomers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [parts, setParts] = useState([]);
    
    // Filtered data based on search query
    const filteredCustomers = customers.filter(c => 
        !q || 
        (c.firstName?.toLowerCase() || "").includes(q.toLowerCase()) ||
        (c.lastName?.toLowerCase() || "").includes(q.toLowerCase()) ||
        (c.email?.toLowerCase() || "").includes(q.toLowerCase()) ||
        (c.phoneNumber || "").includes(q) ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q.toLowerCase())
    );
    
    const filteredVehicles = vehicles.filter(v => 
        !q || 
        (v.vehicleNumber?.toLowerCase() || "").includes(q.toLowerCase()) ||
        (v.brand?.toLowerCase() || "").includes(q.toLowerCase()) ||
        (v.model?.toLowerCase() || "").includes(q.toLowerCase())
    );
    
    const filteredParts = parts.filter(p => 
        !q || 
        (p.partName?.toLowerCase() || "").includes(q.toLowerCase()) ||
        (p.brand?.toLowerCase() || "").includes(q.toLowerCase()) ||
        (p.sku?.toLowerCase() || "").includes(q.toLowerCase())
    );
    
    // Load data on mount
    useEffect(() => {
        loadCustomers();
        loadVehicles();
        loadParts();
    }, []);
    
    const loadCustomers = useCallback(async () => {
        try {
            const data = await getCustomers();
            const customersList = Array.isArray(data) ? data : data?.items || data?.$values || [];
            setCustomers(customersList);
        } catch (error) {
            console.error("Failed to load customers:", error);
        }
    }, []);
    
    const loadVehicles = useCallback(async () => {
        try {
            const data = await getAllVehicles();
            const vehiclesList = Array.isArray(data) ? data : data?.items || data?.$values || [];
            setVehicles(vehiclesList);
        } catch (error) {
            console.error("Failed to load vehicles:", error);
        }
    }, []);
    
    const loadParts = useCallback(async () => {
        try {
            const data = await getParts();
            const partsList = Array.isArray(data) ? data : data?.items || data?.$values || [];
            setParts(partsList);
        } catch (error) {
            console.error("Failed to load parts:", error);
        }
    }, []);
    
    return (
        <div>
            <PageHeader title="Search" description="Find customers, vehicles, or parts instantly."/>
            
            <div className="relative mb-4">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                <input 
                    autoFocus 
                    value={q} 
                    onChange={e => setQ(e.target.value)} 
                    placeholder="Type a name, phone, plate, brand…" 
                    className="w-full h-14 pl-12 pr-4 text-lg rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>
            
            <div className="flex gap-1 border-b border-border mb-6">
                {[
                    ["customers", `Customers (${filteredCustomers.length})`], 
                    ["vehicles", `Vehicles (${filteredVehicles.length})`], 
                    ["parts", `Parts (${filteredParts.length})`]
                ].map(([k, l]) => (
                    <button 
                        key={k} 
                        onClick={() => setTab(k)} 
                        className={`px-4 py-2.5 text-sm border-b-2 -mb-px ${tab === k ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground"}`}
                    >
                        {l}
                    </button>
                ))}
            </div>
            
            <div className="bg-card border border-border rounded-lg overflow-hidden">
                {tab === "customers" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="text-left px-6 py-3">ID</th>
                                    <th className="text-left px-6 py-3">Name</th>
                                    <th className="text-left px-6 py-3">Phone</th>
                                    <th className="text-left px-6 py-3">Email</th>
                                    <th className="text-left px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.length === 0 ? (
                                    <tr className="border-t border-border">
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                            No customers found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map(c => (
                                        <tr key={c.customerId} className="border-t border-border hover:bg-surface cursor-pointer">
                                            <td className="px-6 py-3 font-mono text-xs">{c.customerId}</td>
                                            <td className="px-6 py-3 font-medium">{c.firstName} {c.lastName}</td>
                                            <td className="px-6 py-3 font-mono text-xs">{c.phoneNumber}</td>
                                            <td className="px-6 py-3 text-muted-foreground">{c.email}</td>
                                            <td className="px-6 py-3">
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                                                    c.status === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {c.status === 0 ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {tab === "vehicles" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="text-left px-6 py-3">Vehicle Number</th>
                                    <th className="text-left px-6 py-3">Brand</th>
                                    <th className="text-left px-6 py-3">Model</th>
                                    <th className="text-left px-6 py-3">Color</th>
                                    <th className="text-left px-6 py-3">Year</th>
                                    <th className="text-left px-6 py-3">Customer ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVehicles.length === 0 ? (
                                    <tr className="border-t border-border">
                                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                            No vehicles found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVehicles.map(v => (
                                        <tr key={v.vehicleId} className="border-t border-border hover:bg-surface">
                                            <td className="px-6 py-3 font-mono text-xs">{v.vehicleNumber}</td>
                                            <td className="px-6 py-3 font-medium">{v.brand}</td>
                                            <td className="px-6 py-3">{v.model}</td>
                                            <td className="px-6 py-3 text-muted-foreground">{v.color || '-'}</td>
                                            <td className="px-6 py-3">{v.year}</td>
                                            <td className="px-6 py-3 font-mono text-xs">{v.customerId}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {tab === "parts" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="text-left px-6 py-3">ID</th>
                                    <th className="text-left px-6 py-3">Name</th>
                                    <th className="text-left px-6 py-3">Brand</th>
                                    <th className="text-right px-6 py-3">Stock</th>
                                    <th className="text-right px-6 py-3">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredParts.length === 0 ? (
                                    <tr className="border-t border-border">
                                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                            No parts found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredParts.map(p => (
                                        <tr key={p.partId} className="border-t border-border hover:bg-surface">
                                            <td className="px-6 py-3 font-mono text-xs">{p.partId}</td>
                                            <td className="px-6 py-3 font-medium">{p.partName}</td>
                                            <td className="px-6 py-3 text-muted-foreground">{p.brand || '-'}</td>
                                            <td className={`px-6 py-3 text-right ${p.stockQuantity < 10 ? 'text-red-600 font-semibold' : ''}`}>
                                                {p.stockQuantity}
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono">
                                                Rs. {(p.unitPrice || p.partPrice || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// API endpoint functions
function getCustomers() {
    return apiFetch("/customers");
}

async function getAllVehicles() {
    // First get all customers to then get their vehicles
    try {
        const customers = await getCustomers();
        const allVehicles = [];
        
        for (const customer of customers) {
            try {
                const vehicles = await apiFetch(`/vehicle/customer/${customer.customerId}`);
                if (Array.isArray(vehicles)) {
                    allVehicles.push(...vehicles);
                } else if (vehicles?.$values) {
                    allVehicles.push(...vehicles.$values);
                }
            } catch (err) {
                console.error(`Failed to load vehicles for customer ${customer.customerId}:`, err);
            }
        }
        
        return allVehicles;
    } catch (error) {
        console.error("Failed to load vehicles:", error);
        return [];
    }
}

function getParts() {
    return apiFetch("/parts");
}

export default SearchPage;