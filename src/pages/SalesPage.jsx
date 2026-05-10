import { PageHeader } from "../components/PageHeader";
import { parts, customers } from "../lib/dummy-data";
import { Plus, Trash2, Mail, Printer } from "lucide-react";
import { useState, useEffect } from "react";

// Service charge mapping based on Vehicle Type and Service Type
const serviceChargeMap = {
  Car: {
    "Basic Service": 2500,
    "Full Service": 5000,
    "Oil Change": 1500,
    "Brake Repair": 3000,
    "Engine Tune-up": 4500,
    "AC Service": 2000,
    "Tire Replacement": 1800,
    "Battery Replacement": 1200
  },
  SUV: {
    "Basic Service": 3500,
    "Full Service": 7000,
    "Oil Change": 2000,
    "Brake Repair": 4000,
    "Engine Tune-up": 6000,
    "AC Service": 3000,
    "Tire Replacement": 2500,
    "Battery Replacement": 1800
  },
  Truck: {
    "Basic Service": 5000,
    "Full Service": 10000,
    "Oil Change": 3500,
    "Brake Repair": 6000,
    "Engine Tune-up": 8500,
    "AC Service": 4500,
    "Tire Replacement": 4000,
    "Battery Replacement": 3000
  },
  Bike: {
    "Basic Service": 1200,
    "Full Service": 2500,
    "Oil Change": 800,
    "Brake Repair": 1500,
    "Engine Tune-up": 2000,
    "AC Service": 0,
    "Tire Replacement": 1000,
    "Battery Replacement": 900
  },
  Bus: {
    "Basic Service": 8000,
    "Full Service": 15000,
    "Oil Change": 5000,
    "Brake Repair": 9000,
    "Engine Tune-up": 12000,
    "AC Service": 7000,
    "Tire Replacement": 6000,
    "Battery Replacement": 4500
  }
};

function SalesPage() {
    const [items, setItems] = useState([
        { partId: "P-1001", name: "Brake Pad — Front", qty: 2, price: 2400 },
        { partId: "P-1002", name: "Engine Oil 10W-40 (1L)", qty: 1, price: 850 },
    ]);
    
    const [selectedVehicleType, setSelectedVehicleType] = useState("");
    const [selectedServiceType, setSelectedServiceType] = useState("");
    const [serviceCharge, setServiceCharge] = useState(0);
    
    // Calculate service charge when vehicle type or service type changes
    useEffect(() => {
        if (selectedVehicleType && selectedServiceType) {
            const charge = serviceChargeMap[selectedVehicleType]?.[selectedServiceType] || 0;
            setServiceCharge(charge);
        } else {
            setServiceCharge(0);
        }
    }, [selectedVehicleType, selectedServiceType]);
    
    const partsTotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    const subtotal = partsTotal + serviceCharge;
    const discount = Math.round(subtotal * 0.1);
    const total = subtotal - discount;
    
    return (<div>
      <PageHeader title="Sales / Invoice" description="Create a new sale and generate invoice."/>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="font-display font-semibold mb-4">Customer Information</div>
            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
              {customers.map(c => <option key={c.id}>{c.name} — {c.phone}</option>)}
            </select>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="font-display font-semibold mb-4">Service Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Vehicle Type</label>
                <select 
                  value={selectedVehicleType}
                  onChange={(e) => {
                    setSelectedVehicleType(e.target.value);
                    setSelectedServiceType(""); // Reset service type when vehicle type changes
                  }}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="Car">Car</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck</option>
                  <option value="Bike">Bike</option>
                  <option value="Bus">Bus</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Service Type</label>
                <select 
                  value={selectedServiceType}
                  onChange={(e) => setSelectedServiceType(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  disabled={!selectedVehicleType}
                >
                  <option value="">Select Service Type</option>
                  {selectedVehicleType && Object.keys(serviceChargeMap[selectedVehicleType]).map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {serviceCharge > 0 && (
              <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/20">
                <div className="text-sm flex justify-between items-center">
                  <div>
                    <span className="font-medium">Service Summary:</span> 
                    <span> {selectedVehicleType} • {selectedServiceType}</span>
                  </div>
                  <div className="font-mono font-semibold text-primary">
                    Rs. {serviceCharge.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="font-display font-semibold">Parts & Items</div>
              <button className="px-3 h-9 rounded-md bg-primary text-primary-foreground text-sm flex items-center gap-1.5"><Plus className="h-3.5 w-3.5"/> Add Part</button>
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-sm">
                <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-6 py-3">Part</th>
                    <th className="text-right px-6 py-3">Qty</th>
                    <th className="text-right px-6 py-3">Price</th>
                    <th className="text-right px-6 py-3">Total</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i, idx) => (
                    <tr key={idx} className="border-t border-border">
                      <td className="px-6 py-3 font-medium">{i.name}</td>
                      <td className="px-6 py-3 text-right">{i.qty}</td>
                      <td className="px-6 py-3 text-right font-mono">Rs. {i.price.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right font-medium">Rs. {(i.qty * i.price).toLocaleString()}</td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => setItems(items.filter((_, x) => x !== idx))} className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-surface text-destructive">
                          <Trash2 className="h-3.5 w-3.5"/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="font-display font-semibold mb-4">Quick add part</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {parts.slice(0, 6).map(p => (
                <button 
                  key={p.id} 
                  onClick={() => setItems([...items, { partId: p.id, name: p.name, qty: 1, price: p.price }])} 
                  className="p-3 rounded-md border border-border hover:bg-surface text-left"
                >
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">Rs. {p.price.toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 h-fit sticky top-8">
          <div className="font-display font-semibold mb-4">Invoice Summary</div>
          <div className="space-y-2 text-sm">
            <Row label="Parts Total" value={`Rs. ${partsTotal.toLocaleString()}`}/>
            {serviceCharge > 0 && (
              <Row label={`Service Charge (${selectedVehicleType} - ${selectedServiceType})`} value={`Rs. ${serviceCharge.toLocaleString()}`}/>
            )}
            <Row label="Subtotal" value={`Rs. ${subtotal.toLocaleString()}`}/>
            <Row label="Loyalty discount (10%)" value={`- Rs. ${discount.toLocaleString()}`} muted/>
            <div className="border-t border-border pt-3 mt-3">
              <Row label="Total" value={`Rs. ${total.toLocaleString()}`} bold/>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Payment</label>
            <select className="w-full h-10 px-3 rounded-md border border-input bg-background">
              <option>Cash</option>
              <option>Card</option>
              <option>Credit</option>
            </select>
          </div>

          <button 
            onClick={() => {
              if (!selectedVehicleType || !selectedServiceType) {
                alert("Please select both Vehicle Type and Service Type");
                return;
              }
              if (items.length === 0 && serviceCharge === 0) {
                alert("Please add at least one part/item or select a service");
                return;
              }
              // Handle complete sale logic here
              console.log({ 
                selectedVehicleType, 
                selectedServiceType, 
                serviceCharge,
                items, 
                partsTotal,
                subtotal,
                discount,
                total 
              });
              alert("Sale completed successfully!");
            }}
            className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium mt-4"
          >
            Complete Sale
          </button>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button className="h-10 rounded-md border border-border text-sm flex items-center justify-center gap-1.5">
              <Printer className="h-4 w-4"/> Print
            </button>
            <button className="h-10 rounded-md border border-border text-sm flex items-center justify-center gap-1.5">
              <Mail className="h-4 w-4"/> Email
            </button>
          </div>
        </div>
      </div>
    </div>);
}

function Row({ label, value, muted, bold }) {
    return (<div className="flex justify-between">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={`font-mono ${bold ? "font-bold text-base" : ""}`}>{value}</span>
    </div>);
}

export default SalesPage;