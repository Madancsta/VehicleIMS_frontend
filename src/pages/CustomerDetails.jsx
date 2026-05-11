import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { User, Car, Phone, Mail, MapPin, Award, DollarSign, CreditCard, Edit, Save, X, Plus, ArrowLeft } from "lucide-react";
import { Modal, Field, inputCls } from "../components/Modal";

function CustomerDetails() {
    const { customerId } = useParams();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [addVehicleOpen, setAddVehicleOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [vehicleForm, setVehicleForm] = useState({});

    const API_URL = "http://localhost:5229/api/customers";
    const token = localStorage.getItem("accessToken");

    const fetchCustomer = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/${customerId}/profile`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCustomer(data);
                setEditForm({
                    userName: data.userName,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phoneNumber: data.phoneNumber,
                    address: data.address
                });
            } else if (response.status === 404) {
                setError("Customer not found");
            } else {
                setError("Failed to fetch customer details");
            }
        } catch (err) {
            setError("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomer();
    }, [customerId]);

    const handleUpdateProfile = async () => {
        try {
            const response = await fetch(`${API_URL}/${customerId}/profile`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(editForm)
            });
            if (response.ok) {
                await fetchCustomer();
                setEditing(false);
            } else {
                alert("Failed to update profile");
            }
        } catch (err) {
            alert("Error updating profile");
        }
    };

    const handleAddVehicle = async () => {
        try {
            const response = await fetch(`${API_URL}/${customerId}/vehicles`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(vehicleForm)
            });
            if (response.ok) {
                await fetchCustomer();
                setAddVehicleOpen(false);
                setVehicleForm({});
            } else {
                alert("Failed to add vehicle");
            }
        } catch (err) {
            alert("Error adding vehicle");
        }
    };

    const handleUpdateVehicle = async () => {
        try {
            const response = await fetch(`${API_URL}/vehicles/${editingVehicle.vehicleId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(vehicleForm)
            });
            if (response.ok) {
                await fetchCustomer();
                setEditingVehicle(null);
                setVehicleForm({});
            } else {
                alert("Failed to update vehicle");
            }
        } catch (err) {
            alert("Error updating vehicle");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-lg text-muted-foreground">Loading customer details...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <PageHeader 
                    title="Customer Details" 
                    description="View and manage customer information"
                    actions={
                        <Link 
                            to="/admin/customers-report" 
                            className="px-4 h-10 rounded-md border border-border flex items-center gap-2 hover:bg-surface"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Customers
                        </Link>
                    }
                />
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!customer) return null;

    const totalSpent = customer.totalSpent || 0;
    const creditBalance = customer.creditBalance || 0;
    const loyaltyPoints = customer.loyaltyPoints || 0;
    const vehicles = customer.vehicles || [];

    return (
        <div>
            <PageHeader 
                title={`${customer.firstName} ${customer.lastName}`} 
                description={`Customer ID: ${customer.customerId}`}
                actions={
                    <div className="flex gap-2">
                        <Link 
                            to="/admin/customers-report" 
                            className="px-4 h-10 rounded-md border border-border flex items-center gap-2 hover:bg-surface"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <button 
                            onClick={() => setEditing(!editing)}
                            className="px-4 h-10 rounded-md bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90"
                        >
                            {editing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                            {editing ? "Cancel" : "Edit Profile"}
                        </button>
                    </div>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Spent</div>
                            <div className="font-display text-2xl font-bold mt-2">Rs. {totalSpent.toLocaleString()}</div>
                        </div>
                        <DollarSign className="h-8 w-8 text-muted-foreground opacity-50" />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">Credit Balance</div>
                            <div className={`font-display text-2xl font-bold mt-2 ${creditBalance > 0 ? "text-destructive" : ""}`}>
                                Rs. {creditBalance.toLocaleString()}
                            </div>
                        </div>
                        <CreditCard className="h-8 w-8 text-muted-foreground opacity-50" />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">Loyalty Points</div>
                            <div className="font-display text-2xl font-bold mt-2">{loyaltyPoints}</div>
                        </div>
                        <Award className="h-8 w-8 text-muted-foreground opacity-50" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Information */}
                <div className="lg:col-span-2">
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                                <User className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h2 className="font-display text-xl font-semibold">Profile Information</h2>
                                <p className="text-sm text-muted-foreground">Personal details and contact information</p>
                            </div>
                        </div>

                        {editing ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Username</label>
                                        <input
                                            className="input mt-1 w-full"
                                            value={editForm.userName}
                                            onChange={(e) => setEditForm({ ...editForm, userName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
                                        <input
                                            className="input mt-1 w-full bg-muted"
                                            value={customer.email}
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground">First Name</label>
                                        <input
                                            className="input mt-1 w-full"
                                            value={editForm.firstName}
                                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Last Name</label>
                                        <input
                                            className="input mt-1 w-full"
                                            value={editForm.lastName}
                                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Phone Number</label>
                                        <input
                                            className="input mt-1 w-full"
                                            value={editForm.phoneNumber}
                                            onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs uppercase tracking-wider text-muted-foreground">Address</label>
                                        <textarea
                                            className="input mt-1 w-full min-h-20"
                                            value={editForm.address}
                                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={() => setEditing(false)}
                                        className="px-4 h-10 rounded-md border border-border hover:bg-surface"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateProfile}
                                        className="px-4 h-10 rounded-md bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90"
                                    >
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InfoField icon={User} label="Username" value={customer.userName} />
                                <InfoField icon={Mail} label="Email" value={customer.email} />
                                <InfoField icon={User} label="First Name" value={customer.firstName} />
                                <InfoField icon={User} label="Last Name" value={customer.lastName} />
                                <InfoField icon={Phone} label="Phone Number" value={customer.phoneNumber} />
                                <InfoField icon={MapPin} label="Address" value={customer.address} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Loyalty Status */}
                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Award className="h-8 w-8" />
                            <div>
                                <div className="font-display text-lg font-semibold">Loyalty Status</div>
                                <div className="text-sm opacity-80">
                                    {loyaltyPoints >= 100 ? "Gold Member" : loyaltyPoints >= 50 ? "Silver Member" : "Regular Customer"}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-primary-foreground/20">
                            <div className="text-sm opacity-80">
                                {loyaltyPoints >= 100 ? "Maximum tier reached" : `${100 - loyaltyPoints} points to Gold`}
                            </div>
                            <div className="mt-2 h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white rounded-full" style={{ width: `${Math.min((loyaltyPoints / 100) * 100, 100)}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicles Section */}
            <div className="mt-8">
                <div className="bg-card border border-border rounded-lg">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <div>
                            <h2 className="font-display text-xl font-semibold">Vehicles</h2>
                            <p className="text-sm text-muted-foreground">Registered vehicles for this customer</p>
                        </div>
                        <button
                            onClick={() => setAddVehicleOpen(true)}
                            className="px-4 h-10 rounded-md bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90"
                        >
                            <Plus className="h-4 w-4" />
                            Add Vehicle
                        </button>
                    </div>
                    <div className="p-6">
                        {vehicles.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No vehicles registered yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vehicles.map((vehicle) => (
                                    <div key={vehicle.vehicleId} className="border border-border rounded-lg p-4 hover:shadow-elegant transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-md bg-surface flex items-center justify-center">
                                                    <Car className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{vehicle.vehicleNumber}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setEditingVehicle(vehicle);
                                                    setVehicleForm({
                                                        vehicleNumber: vehicle.vehicleNumber,
                                                        brand: vehicle.brand,
                                                        model: vehicle.model,
                                                        color: vehicle.color,
                                                        year: vehicle.year
                                                    });
                                                }}
                                                className="h-8 w-8 rounded-md hover:bg-surface flex items-center justify-center"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                            <div><span className="text-muted-foreground">Color:</span> {vehicle.color}</div>
                                            <div><span className="text-muted-foreground">Year:</span> {vehicle.year}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Vehicle Modal */}
            <Modal
                open={addVehicleOpen}
                onClose={() => setAddVehicleOpen(false)}
                title="Add Vehicle"
                description="Register a new vehicle for this customer"
                footer={
                    <>
                        <button onClick={() => setAddVehicleOpen(false)} className="px-4 h-10 rounded-md border border-border text-sm hover:bg-surface">
                            Cancel
                        </button>
                        <button onClick={handleAddVehicle} className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                            Add Vehicle
                        </button>
                    </>
                }
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Vehicle Number">
                        <input className={inputCls} value={vehicleForm.vehicleNumber || ""} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })} placeholder="BA 01 AB 1234" />
                    </Field>
                    <Field label="Brand">
                        <input className={inputCls} value={vehicleForm.brand || ""} onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })} placeholder="Toyota" />
                    </Field>
                    <Field label="Model">
                        <input className={inputCls} value={vehicleForm.model || ""} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })} placeholder="Camry" />
                    </Field>
                    <Field label="Year">
                        <input className={inputCls} type="number" value={vehicleForm.year || ""} onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })} placeholder="2022" />
                    </Field>
                    <Field label="Color">
                        <input className={inputCls} value={vehicleForm.color || ""} onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })} placeholder="Black" />
                    </Field>
                </div>
            </Modal>

            {/* Edit Vehicle Modal */}
            <Modal
                open={!!editingVehicle}
                onClose={() => setEditingVehicle(null)}
                title="Edit Vehicle"
                description="Update vehicle information"
                footer={
                    <>
                        <button onClick={() => setEditingVehicle(null)} className="px-4 h-10 rounded-md border border-border text-sm hover:bg-surface">
                            Cancel
                        </button>
                        <button onClick={handleUpdateVehicle} className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                            Save Changes
                        </button>
                    </>
                }
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Vehicle Number">
                        <input className={inputCls} value={vehicleForm.vehicleNumber || ""} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })} />
                    </Field>
                    <Field label="Brand">
                        <input className={inputCls} value={vehicleForm.brand || ""} onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })} />
                    </Field>
                    <Field label="Model">
                        <input className={inputCls} value={vehicleForm.model || ""} onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })} />
                    </Field>
                    <Field label="Year">
                        <input className={inputCls} type="number" value={vehicleForm.year || ""} onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })} />
                    </Field>
                    <Field label="Color">
                        <input className={inputCls} value={vehicleForm.color || ""} onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })} />
                    </Field>
                </div>
            </Modal>
        </div>
    );
}

function InfoField({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-md bg-surface/50">
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
                <div className="text-sm font-medium mt-0.5">{value || "—"}</div>
            </div>
        </div>
    );
}

export default CustomerDetails;