export const staff = [
    { id: "S001", name: "Ichha Sharma", role: "Staff", email: "ichha@autohub.com", phone: "+977-9801234567", joined: "2023-04-12", status: "Active" },
    { id: "S002", name: "Madan Thapa", role: "Staff", email: "madan@autohub.com", phone: "+977-9812345678", joined: "2022-11-03", status: "Active" },
    { id: "S003", name: "Anish KC", role: "Admin", email: "anish@autohub.com", phone: "+977-9823456789", joined: "2021-06-21", status: "Active" },
    { id: "S004", name: "Pratha Lama", role: "Admin", email: "pratha@autohub.com", phone: "+977-9834567890", joined: "2024-01-15", status: "Active" },
    { id: "S005", name: "Sita Rai", role: "Staff", email: "pratyush@autohub.com", phone: "+977-9845678901", joined: "2024-08-09", status: "Inactive" },
];
export const partCategories = [
    { id: 1, name: "Brakes" },
    { id: 2, name: "Lubricants" },
    { id: 3, name: "Filters" },
    { id: 4, name: "Ignition" },
    { id: 5, name: "Electrical" },
    { id: 6, name: "Transmission" },
    { id: 7, name: "Tires" },
];
export const parts = [
    { id: "P-1001", name: "Brake Pad — Front", category: "Brakes", brand: "Bosch", stock: 42, lowStock: 10, price: 2400, vendor: "Auto World" },
    { id: "P-1002", name: "Engine Oil 10W-40 (1L)", category: "Lubricants", brand: "Shell", stock: 8, lowStock: 15, price: 850, vendor: "Lube Center" },
    { id: "P-1003", name: "Air Filter", category: "Filters", brand: "K&N", stock: 24, lowStock: 10, price: 1800, vendor: "Auto World" },
    { id: "P-1004", name: "Spark Plug NGK", category: "Ignition", brand: "NGK", stock: 120, lowStock: 30, price: 320, vendor: "Spark Co." },
    { id: "P-1005", name: "Headlight Bulb H4", category: "Electrical", brand: "Philips", stock: 5, lowStock: 12, price: 1100, vendor: "Bright Auto" },
    { id: "P-1006", name: "Clutch Cable", category: "Transmission", brand: "TVS", stock: 18, lowStock: 8, price: 950, vendor: "Auto World" },
    { id: "P-1007", name: "Tire 110/70-17", category: "Tires", brand: "MRF", stock: 14, lowStock: 6, price: 5200, vendor: "Tyre Mart" },
    { id: "P-1008", name: "Battery 12V 9Ah", category: "Electrical", brand: "Exide", stock: 3, lowStock: 5, price: 6800, vendor: "Bright Auto" },
];
export const vendors = [
    { id: "V01", name: "Auto World", contact: "Ramesh Pandey", phone: "+977-9801111222", email: "sales@autoworld.com", address: "Kalanki, Kathmandu", outstanding: 28500 },
    { id: "V02", name: "Lube Center", contact: "Sunil Maharjan", phone: "+977-9802223344", email: "info@lubecenter.com", address: "Patan", outstanding: 0 },
    { id: "V03", name: "Spark Co.", contact: "Hari Bhandari", phone: "+977-9803334455", email: "hari@sparkco.com", address: "Bhaktapur", outstanding: 12000 },
    { id: "V04", name: "Bright Auto", contact: "Nisha Karki", phone: "+977-9804445566", email: "nisha@brightauto.com", address: "New Road", outstanding: 4500 },
    { id: "V05", name: "Tyre Mart", contact: "Bikram Shah", phone: "+977-9805556677", email: "bikram@tyremart.com", address: "Balaju", outstanding: 0 },
];
export const customers = [
    { id: "C-2001", name: "Rajesh Adhikari", phone: "+977-9841000001", email: "rajesh@gmail.com", address: "Lalitpur", joined: "2023-02-11", totalSpent: 84500, credit: 0, loyalty: true },
    { id: "C-2002", name: "Sunita Gurung", phone: "+977-9841000002", email: "sunita@gmail.com", address: "Kathmandu", joined: "2023-06-04", totalSpent: 152000, credit: 4500, loyalty: true },
    { id: "C-2003", name: "Bishal Tamang", phone: "+977-9841000003", email: "bishal@gmail.com", address: "Bhaktapur", joined: "2024-01-19", totalSpent: 21000, credit: 0, loyalty: false },
    { id: "C-2004", name: "Priya Shrestha", phone: "+977-9841000004", email: "priya@gmail.com", address: "Pokhara", joined: "2022-09-30", totalSpent: 245000, credit: 12000, loyalty: true },
    { id: "C-2005", name: "Kabir Magar", phone: "+977-9841000005", email: "kabir@gmail.com", address: "Lalitpur", joined: "2024-07-12", totalSpent: 9500, credit: 2500, loyalty: false },
];
export const vehicles = [
    { id: "VH-01", customerId: "C-2001", make: "Honda", model: "Shine", year: 2020, plate: "BA 12 PA 4567", type: "Motorcycle" },
    { id: "VH-02", customerId: "C-2002", make: "Toyota", model: "Corolla", year: 2018, plate: "BA 2 CHA 8901", type: "Car" },
    { id: "VH-03", customerId: "C-2003", make: "Bajaj", model: "Pulsar 150", year: 2021, plate: "BA 18 PA 1122", type: "Motorcycle" },
    { id: "VH-04", customerId: "C-2004", make: "Hyundai", model: "i20", year: 2022, plate: "BA 5 CHA 3344", type: "Car" },
    { id: "VH-05", customerId: "C-2005", make: "TVS", model: "Apache", year: 2023, plate: "BA 22 PA 5566", type: "Motorcycle" },
];
export const sales = [
    { id: "INV-9001", customerId: "C-2001", customer: "Rajesh Adhikari", date: "2026-04-22", items: 3, total: 5400, paid: 5400, status: "Paid" },
    { id: "INV-9002", customerId: "C-2002", customer: "Sunita Gurung", date: "2026-04-23", items: 2, total: 8200, paid: 3700, status: "Credit" },
    { id: "INV-9003", customerId: "C-2003", customer: "Bishal Tamang", date: "2026-04-24", items: 1, total: 1800, paid: 1800, status: "Paid" },
    { id: "INV-9004", customerId: "C-2004", customer: "Priya Shrestha", date: "2026-04-25", items: 5, total: 22400, paid: 10400, status: "Credit" },
    { id: "INV-9005", customerId: "C-2001", customer: "Rajesh Adhikari", date: "2026-04-26", items: 2, total: 3200, paid: 3200, status: "Paid" },
    { id: "INV-9006", customerId: "C-2005", customer: "Kabir Magar", date: "2026-04-27", items: 1, total: 2500, paid: 0, status: "Credit" },
];
export const purchaseInvoices = [
    { id: "PI-501", vendor: "Auto World", date: "2026-04-10", items: 12, total: 48000, status: "Paid" },
    { id: "PI-502", vendor: "Lube Center", date: "2026-04-15", items: 50, total: 32000, status: "Paid" },
    { id: "PI-503", vendor: "Spark Co.", date: "2026-04-18", items: 200, total: 12000, status: "Pending" },
    { id: "PI-504", vendor: "Bright Auto", date: "2026-04-22", items: 8, total: 18500, status: "Pending" },
];
export const bookings = [
    { id: "BK-301", customer: "Rajesh Adhikari", vehicle: "Honda Shine", service: "Full Service", date: "2026-05-02", status: "Confirmed" },
    { id: "BK-302", customer: "Sunita Gurung", vehicle: "Toyota Corolla", service: "Brake Replacement", date: "2026-05-04", status: "Pending" },
    { id: "BK-303", customer: "Priya Shrestha", vehicle: "Hyundai i20", service: "Oil Change", date: "2026-05-05", status: "Completed" },
];
export const reviews = [
    { id: "R1", customer: "Rajesh Adhikari", rating: 5, text: "Excellent service, quick turnaround.", date: "2026-04-20" },
    { id: "R2", customer: "Sunita Gurung", rating: 4, text: "Good experience, fair pricing.", date: "2026-04-21" },
    { id: "R3", customer: "Priya Shrestha", rating: 5, text: "Professional and courteous staff.", date: "2026-04-25" },
];
export const notifications = [
    { id: "N1", type: "low-stock", message: "Battery 12V 9Ah is critically low (3 left)", time: "2h ago" },
    { id: "N2", type: "low-stock", message: "Headlight Bulb H4 below threshold", time: "5h ago" },
    { id: "N3", type: "credit", message: "Priya Shrestha has Rs. 12,000 unpaid credit", time: "1d ago" },
    { id: "N4", type: "credit", message: "Sunita Gurung credit overdue by 7 days", time: "2d ago" },
];
export const monthlyRevenue = [
    { month: "Nov", revenue: 185000, expenses: 92000 },
    { month: "Dec", revenue: 210000, expenses: 105000 },
    { month: "Jan", revenue: 198000, expenses: 88000 },
    { month: "Feb", revenue: 232000, expenses: 110000 },
    { month: "Mar", revenue: 268000, expenses: 125000 },
    { month: "Apr", revenue: 295000, expenses: 138000 },
];
