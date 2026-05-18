import { PageHeader } from "../components/PageHeader";
import { parts } from "../lib/dummy-data";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { searchCustomers } from "../api/customerApi";

function SearchPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("customers");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!q.trim()) {
      setCustomers([]);
      setError("Please enter name, phone, customer ID, or vehicle number.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await searchCustomers(q);
      setCustomers(data);
    } catch (err) {
      setError("Failed to search customers. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const vehicles = customers.flatMap((customer) =>
    customer.vehicles?.map((vehicle) => ({
      ...vehicle,
      customerName: `${customer.firstName} ${customer.lastName}`,
      phoneNumber: customer.phoneNumber,
    })) || []
  );

  const fp = parts.filter(
    (p) =>
      !q ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.brand.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Search"
        description="Find customers by name, phone, ID, or vehicle number."
      />

      <div className="relative mb-4">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Type customer name, phone, ID, or vehicle number..."
          className="w-full h-14 pl-12 pr-28 text-lg rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-md bg-primary text-primary-foreground"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-1 border-b border-border mb-6">
        {[
          ["customers", `Customers (${customers.length})`],
          ["vehicles", `Vehicles (${vehicles.length})`],
          ["parts", `Parts (${fp.length})`],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2.5 text-sm border-b-2 -mb-px ${
              tab === k
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {tab === "customers" && (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-6 py-3">ID</th>
                  <th className="text-left px-6 py-3">Name</th>
                  <th className="text-left px-6 py-3">Phone</th>
                  <th className="text-left px-6 py-3">Email</th>
                  <th className="text-left px-6 py-3">Vehicles</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.customerId}
                    className="border-t border-border hover:bg-surface"
                  >
                    <td className="px-6 py-3 font-mono text-xs">
                      {c.customerId}
                    </td>
                    <td className="px-6 py-3 font-medium">
                      {c.firstName} {c.lastName}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs">
                      {c.phoneNumber}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {c.email}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {c.vehicles?.length || 0}
                    </td>
                  </tr>
                ))}

                {!loading && customers.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      Search customer data from backend.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "vehicles" && (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-6 py-3">Vehicle No.</th>
                  <th className="text-left px-6 py-3">Vehicle</th>
                  <th className="text-left px-6 py-3">Year</th>
                  <th className="text-left px-6 py-3">Color</th>
                  <th className="text-left px-6 py-3">Customer</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr
                    key={v.vehicleId}
                    className="border-t border-border hover:bg-surface"
                  >
                    <td className="px-6 py-3 font-mono text-xs">
                      {v.vehicleNumber}
                    </td>
                    <td className="px-6 py-3 font-medium">
                      {v.brand} {v.model}
                    </td>
                    <td className="px-6 py-3">{v.year}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {v.color}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {v.customerName}
                    </td>
                  </tr>
                ))}

                {!loading && vehicles.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No vehicle results yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "parts" && (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-6 py-3">SKU</th>
                  <th className="text-left px-6 py-3">Name</th>
                  <th className="text-left px-6 py-3">Brand</th>
                  <th className="text-right px-6 py-3">Stock</th>
                  <th className="text-right px-6 py-3">Price</th>
                </tr>
              </thead>
              <tbody>
                {fp.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-border hover:bg-surface"
                  >
                    <td className="px-6 py-3 font-mono text-xs">{p.id}</td>
                    <td className="px-6 py-3 font-medium">{p.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {p.brand}
                    </td>
                    <td className="px-6 py-3 text-right">{p.stock}</td>
                    <td className="px-6 py-3 text-right font-mono">
                      Rs. {p.price.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;