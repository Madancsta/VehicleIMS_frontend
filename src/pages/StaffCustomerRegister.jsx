import { PageHeader } from "../components/PageHeader";
import { useState } from "react";
import { apiFetch } from '../api/clientApi';

function StaffCustomerRegister() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [registeredCustomerId, setRegisteredCustomerId] = useState(null);
    
    // Personal Information
    const [customerData, setCustomerData] = useState({
        firstName: "",
        lastName: "",
        userName: "",
        email: "",
        phoneNumber: "",
        address: "",
        password: "",
        confirmPassword: ""
    });
    
    // Vehicle Information
    const [vehicleData, setVehicleData] = useState({
        vehicleNumber: "",
        brand: "",
        model: "",
        color: "",
        year: new Date().getFullYear()
    });
    
    const handleCustomerSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!customerData.firstName || !customerData.lastName || !customerData.userName || 
            !customerData.email || !customerData.phoneNumber || !customerData.password) {
            setMessage("Please fill in all required fields.");
            setMessageType("error");
            return;
        }
        
        if (customerData.password !== customerData.confirmPassword) {
            setMessage("Passwords do not match.");
            setMessageType("error");
            return;
        }
        
        if (customerData.password.length < 6) {
            setMessage("Password must be at least 6 characters.");
            setMessageType("error");
            return;
        }
        
        setLoading(true);
        setMessage("");
        
        try {
            const registerResult = await registerCustomer({
                firstName: customerData.firstName,
                lastName: customerData.lastName,
                userName: customerData.userName,
                email: customerData.email,
                phoneNumber: customerData.phoneNumber,
                address: customerData.address,
                password: customerData.password,
                confirmPassword: customerData.confirmPassword
            });
            
            if (registerResult.success) {
                setRegisteredCustomerId(registerResult.customerId);
                setMessage(`Customer ${customerData.firstName} ${customerData.lastName} registered successfully!`);
                setMessageType("success");
                setStep(2);
            } else {
                setMessage(registerResult.message || "Registration failed.");
                setMessageType("error");
            }
        } catch (err) {
            setMessage(err.message || "Unable to register customer.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };
    
    const handleVehicleSubmit = async (e) => {
        e.preventDefault();
        
        if (!vehicleData.vehicleNumber || !vehicleData.brand || !vehicleData.model) {
            setMessage("Please fill in vehicle number, brand, and model.");
            setMessageType("error");
            return;
        }
        
        setLoading(true);
        
        try {
            await registerVehicle({
                customerId: registeredCustomerId,
                vehicleNumber: vehicleData.vehicleNumber,
                brand: vehicleData.brand,
                model: vehicleData.model,
                color: vehicleData.color,
                year: vehicleData.year
            });
            
            setMessage("Vehicle added successfully!");
            setMessageType("success");
            
            // Reset after 2 seconds
            setTimeout(() => {
                resetAll();
                setStep(1);
            }, 2000);
        } catch (err) {
            setMessage(err.message || "Unable to add vehicle.");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };
    
    const resetAll = () => {
        setCustomerData({
            firstName: "",
            lastName: "",
            userName: "",
            email: "",
            phoneNumber: "",
            address: "",
            password: "",
            confirmPassword: ""
        });
        setVehicleData({
            vehicleNumber: "",
            brand: "",
            model: "",
            color: "",
            year: new Date().getFullYear()
        });
        setRegisteredCustomerId(null);
        setMessage("");
    };
    
    const updateCustomerField = (field, value) => {
        setCustomerData(prev => ({ ...prev, [field]: value }));
    };
    
    const updateVehicleField = (field, value) => {
        setVehicleData(prev => ({ ...prev, [field]: value }));
    };
    
    return (
        <div>
            <PageHeader 
                title="Register Customer" 
                description={step === 1 ? "Add a new customer" : "Add vehicle for customer"}
            />
            
            {message && (
                <div className={`mb-6 rounded-lg border p-4 text-sm shadow-sm ${
                    messageType === "success" 
                        ? "border-green-500 bg-green-50 text-green-700" 
                        : "border-red-500 bg-red-50 text-red-700"
                }`}>
                    {message}
                </div>
            )}
            
            {step === 1 ? (
                <form onSubmit={handleCustomerSubmit}>
                    <div className="bg-card border border-border rounded-lg p-8 max-w-3xl">
                        <div className="font-display font-semibold mb-4">Personal Information</div>
                        <div className="grid grid-cols-2 gap-5">
                            <Field 
                                label="First Name" 
                                placeholder="Enter first name"
                                value={customerData.firstName}
                                onChange={(e) => updateCustomerField("firstName", e.target.value)}
                                required
                            />
                            <Field 
                                label="Last Name" 
                                placeholder="Enter last name"
                                value={customerData.lastName}
                                onChange={(e) => updateCustomerField("lastName", e.target.value)}
                                required
                            />
                            <Field 
                                label="Username" 
                                placeholder="Enter username"
                                value={customerData.userName}
                                onChange={(e) => updateCustomerField("userName", e.target.value)}
                                 autoComplete="new-username"
                                required
                            />
                            <Field 
                                label="Email" 
                                type="email"
                                placeholder="customer@example.com"
                                value={customerData.email}
                                onChange={(e) => updateCustomerField("email", e.target.value)}
                                required
                            />
                            <Field 
                                label="Phone Number" 
                                placeholder="+977-XXXXXXXXXX"
                                value={customerData.phoneNumber}
                                onChange={(e) => updateCustomerField("phoneNumber", e.target.value)}
                                required
                            />
                            <Field 
                                label="Address" 
                                placeholder="Enter address"
                                value={customerData.address}
                                onChange={(e) => updateCustomerField("address", e.target.value)}
                            />
                            <Field 
                                label="Password" 
                                type="password"
                                placeholder="Minimum 6 characters"
                                value={customerData.password}
                                onChange={(e) => updateCustomerField("password", e.target.value)}
                                autoComplete="new-password" 
                                required
                            />
                            <Field 
                                label="Confirm Password" 
                                type="password"
                                placeholder="Re-enter password"
                                value={customerData.confirmPassword}
                                onChange={(e) => updateCustomerField("confirmPassword", e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-8 pt-6 border-t border-border">
                            <button 
                                type="button"
                                onClick={resetAll}
                                className="px-5 h-11 rounded-md border border-border hover:bg-surface transition-colors"
                            >
                                Clear
                            </button>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="px-6 h-11 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Registering..." : "Continue to Vehicle"}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleVehicleSubmit}>
                    <div className="bg-card border border-border rounded-lg p-8 max-w-3xl">
                        <div className="font-display font-semibold mb-4">
                            Add Vehicle for {customerData.firstName} {customerData.lastName}
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs uppercase tracking-wider text-muted-foreground">Brand *</label>
                                <input 
                                    placeholder="e.g., Honda, Toyota, BMW"
                                    className="mt-1 w-full h-11 px-3 rounded-md border border-input bg-background"
                                    value={vehicleData.brand}
                                    onChange={(e) => updateVehicleField("brand", e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-muted-foreground">Model *</label>
                                <input 
                                    placeholder="e.g., Civic, Corolla, X5"
                                    className="mt-1 w-full h-11 px-3 rounded-md border border-input bg-background"
                                    value={vehicleData.model}
                                    onChange={(e) => updateVehicleField("model", e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-muted-foreground">Vehicle Number *</label>
                                <input 
                                    placeholder="e.g., BA 01 KHA 1234"
                                    className="mt-1 w-full h-11 px-3 rounded-md border border-input bg-background"
                                    value={vehicleData.vehicleNumber}
                                    onChange={(e) => updateVehicleField("vehicleNumber", e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-muted-foreground">Color</label>
                                <input 
                                    placeholder="e.g., Red, Black, White"
                                    className="mt-1 w-full h-11 px-3 rounded-md border border-input bg-background"
                                    value={vehicleData.color}
                                    onChange={(e) => updateVehicleField("color", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-muted-foreground">Year</label>
                                <select 
                                    className="mt-1 w-full h-11 px-3 rounded-md border border-input bg-background"
                                    value={vehicleData.year}
                                    onChange={(e) => updateVehicleField("year", parseInt(e.target.value))}
                                >
                                    <option value="">Select Year</option>
                                    {Array.from({ length: 30 }, (_, i) => {
                                        const yearOption = new Date().getFullYear() - i;
                                        return <option key={yearOption} value={yearOption}>{yearOption}</option>;
                                    })}
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-8 pt-6 border-t border-border">
                            <button 
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-5 h-11 rounded-md border border-border hover:bg-surface transition-colors"
                            >
                                Back
                            </button>
                            <button 
                                type="button"
                                onClick={() => setStep(1)}
                                className="px-5 h-11 rounded-md border border-border hover:bg-surface transition-colors"
                            >
                                Skip for Now
                            </button>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="px-6 h-11 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Adding..." : "Add Vehicle"}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}

function Field({ label, placeholder, type = "text", value, onChange, required = false }) {
    return (
        <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input 
                type={type}
                placeholder={placeholder}
                className="mt-1 w-full h-11 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={value}
                onChange={onChange}
                required={required}
            />
        </div>
    );
}

async function registerCustomer(data) {
    return apiFetch("/customers/register", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

async function registerVehicle(data) {
    return apiFetch("/vehicle", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export default StaffCustomerRegister;