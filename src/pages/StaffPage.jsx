import { PageHeader } from "../components/PageHeader";
import { Modal, Field, inputCls } from "../components/Modal";
import { Plus, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from '../api/clientApi';

function StaffPage() {
    const [addOpen, setAddOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    // Fetch all staff
    const fetchStaff = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getStaff();
            const staffListData = Array.isArray(data) ? data : data?.items || data?.$values || [];
            setStaffList(staffListData);
        } catch (err) {
            console.error("Failed to fetch staff:", err);
            setError(err.message || "Failed to load staff members");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    // Clear message after 3 seconds
    const clearMessage = () => {
        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 3000);
    };

    // Show confirmation modal
    const showConfirm = (action, userId, name) => {
        setPendingAction({ action, userId, name });
        setShowConfirmModal(true);
    };

    // Execute the action after confirmation
    const executeAction = async () => {
        if (!pendingAction) return;
        
        const { action, userId, name } = pendingAction;
        
        setShowConfirmModal(false);
        
        if (action === "deactivate") {
            setLoading(true);
            try {
                await deactivateStaff(userId);
                setMessage(`${name} has been deactivated.`);
                setMessageType("success");
                await fetchStaff();
                clearMessage();
            } catch (err) {
                console.error("Failed to deactivate staff:", err);
                setMessage(err.message || "Failed to deactivate staff member");
                setMessageType("error");
                clearMessage();
            } finally {
                setLoading(false);
            }
        } else if (action === "activate") {
            setLoading(true);
            try {
                await activateStaff(userId);
                setMessage(`${name} has been activated.`);
                setMessageType("success");
                await fetchStaff();
                clearMessage();
            } catch (err) {
                console.error("Failed to activate staff:", err);
                setMessage(err.message || "Failed to activate staff member");
                setMessageType("error");
                clearMessage();
            } finally {
                setLoading(false);
            }
        }
        
        setPendingAction(null);
    };

    // Cancel action
    const cancelAction = () => {
        setShowConfirmModal(false);
        setPendingAction(null);
    };

    // Validate form data
    const validateStaffForm = (formData, isEdit = false) => {
        if (!formData.firstName.trim()) {
            setMessage("First name is required");
            setMessageType("error");
            return false;
        }
        if (!formData.lastName.trim()) {
            setMessage("Last name is required");
            setMessageType("error");
            return false;
        }
        if (!formData.email.trim()) {
            setMessage("Email is required");
            setMessageType("error");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setMessage("Please enter a valid email address");
            setMessageType("error");
            return false;
        }
        if (!formData.phoneNumber.trim()) {
            setMessage("Phone number is required");
            setMessageType("error");
            return false;
        }
        if (!formData.address.trim()) {
            setMessage("Address is required");
            setMessageType("error");
            return false;
        }
        if (!isEdit) {
            if (!formData.password) {
                setMessage("Password is required");
                setMessageType("error");
                return false;
            }
            if (formData.password.length < 6) {
                setMessage("Password must be at least 6 characters");
                setMessageType("error");
                return false;
            }
            const hasUpper = /[A-Z]/.test(formData.password);
            const hasLower = /[a-z]/.test(formData.password);
            const hasDigit = /[0-9]/.test(formData.password);
            if (!hasUpper || !hasLower || !hasDigit) {
                setMessage("Password must contain uppercase, lowercase, and number");
                setMessageType("error");
                return false;
            }
        }
        return true;
    };

    // Create staff
    const handleCreate = async (formData) => {
        if (!validateStaffForm(formData, false)) {
            clearMessage();
            return;
        }

        setLoading(true);
        setMessage("");
        try {
            await createStaff(formData);
            setMessage(`Staff member ${formData.firstName} ${formData.lastName} created successfully!`);
            setMessageType("success");
            await fetchStaff();
            setAddOpen(false);
            clearMessage();
        } catch (err) {
            console.error("Failed to create staff:", err);
            setMessage(err.message || "Failed to create staff member. Email may already exist.");
            setMessageType("error");
            clearMessage();
        } finally {
            setLoading(false);
        }
    };

    // Update staff
    const handleUpdate = async (userId, formData) => {
        if (!validateStaffForm(formData, true)) {
            clearMessage();
            return;
        }

        setLoading(true);
        setMessage("");
        try {
            await updateStaff(userId, formData);
            setMessage("Staff member updated successfully!");
            setMessageType("success");
            await fetchStaff();
            setEditing(null);
            clearMessage();
        } catch (err) {
            console.error("Failed to update staff:", err);
            setMessage(err.message || "Failed to update staff member");
            setMessageType("error");
            clearMessage();
        } finally {
            setLoading(false);
        }
    };

    // Change role
    const handleChangeRole = async (userId, newRole, name) => {
        setLoading(true);
        try {
            await changeStaffRole(userId, newRole);
            setMessage(`${name}'s role changed to ${newRole}.`);
            setMessageType("success");
            await fetchStaff();
            clearMessage();
        } catch (err) {
            console.error("Failed to change role:", err);
            setMessage(err.message || "Failed to change staff role");
            setMessageType("error");
            clearMessage();
        } finally {
            setLoading(false);
        }
    };

    if (loading && staffList.length === 0) {
        return <div className="p-8 text-center">Loading staff...</div>;
    }

    return (
        <div>
            <PageHeader 
                title="Staff Management" 
                description="Manage staff accounts, roles, and access levels." 
                actions={
                    <button 
                        onClick={() => setAddOpen(true)} 
                        className="px-4 h-10 rounded-md bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" /> Add Staff
                    </button>
                }
            />

            {message && (
                <div className={`mb-4 p-3 rounded-md text-sm ${
                    messageType === "success" 
                        ? "bg-green-50 text-green-700 border border-green-200" 
                        : "bg-red-50 text-red-600 border border-red-200"
                }`}>
                    {message}
                </div>
            )}

            {error && (
                <div className="mb-4 p-3 rounded-md bg-red-50 text-red-600 text-sm border border-red-200">
                    {error}
                </div>
            )}

            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <th className="text-left px-6 py-3">ID</th>
                                <th className="text-left px-6 py-3">Name</th>
                                <th className="text-left px-6 py-3">Role</th>
                                <th className="text-left px-6 py-3">Email</th>
                                <th className="text-left px-6 py-3">Phone</th>
                                <th className="text-left px-6 py-3">Status</th>
                                <th className="text-right px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map((s) => (
                                <tr key={s.userId} className="border-t border-border hover:bg-surface">
                                    <td className="px-6 py-3 font-mono text-xs">{s.userId?.slice(0, 8)}...</td>
                                    <td className="px-6 py-3 font-medium">{s.firstName} {s.lastName}</td>
                                    <td className="px-6 py-3">
                                        <select 
                                            value={s.role} 
                                            onChange={(e) => handleChangeRole(s.userId, e.target.value, `${s.firstName} ${s.lastName}`)}
                                            className="text-xs px-2 py-1 rounded-full border bg-accent text-accent-foreground"
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="Staff">Staff</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-3 text-muted-foreground">{s.email}</td>
                                    <td className="px-6 py-3 text-muted-foreground font-mono text-xs">{s.phoneNumber}</td>
                                    <td className="px-6 py-3">
                                        {s.status === 0 ? (
                                            <button
                                                onClick={() => showConfirm("deactivate", s.userId, `${s.firstName} ${s.lastName}`)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border-2 border-green-500 bg-green-50 text-green-700 hover:bg-green-100 transition-colors cursor-pointer"
                                            >
                                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                                Active
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => showConfirm("activate", s.userId, `${s.firstName} ${s.lastName}`)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border-2 border-red-400 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                            >
                                                <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                                                Inactive
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-right whitespace-nowrap">
                                        <button 
                                            onClick={() => setEditing(s)} 
                                            className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-surface" 
                                            aria-label="Edit"
                                        >
                                            <Edit className="h-3.5 w-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {staffList.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-muted-foreground">
                                        No staff members found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && pendingAction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card rounded-lg max-w-md w-full mx-4 overflow-hidden shadow-xl">
                        <div className="p-6">
                            <h3 className="font-display text-lg font-semibold mb-2">
                                {pendingAction.action === "deactivate" ? "Deactivate Staff Member" : "Activate Staff Member"}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                {pendingAction.action === "deactivate" 
                                    ? "Are you sure you want to deactivate " + pendingAction.name + "? They will no longer have access to the system."
                                    : "Are you sure you want to activate " + pendingAction.name + "? They will regain access to the system."
                                }
                            </p>
                        </div>
                        <div className="border-t border-border p-4 flex justify-end gap-3">
                            <button
                                onClick={cancelAction}
                                className="px-4 py-2 rounded-md border border-border text-sm hover:bg-surface transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeAction}
                                className={"px-4 py-2 rounded-md text-sm font-medium text-white transition-colors " + (
                                    pendingAction.action === "deactivate" 
                                        ? "bg-red-600 hover:bg-red-700" 
                                        : "bg-green-600 hover:bg-green-700"
                                )}
                            >
                                {pendingAction.action === "deactivate" ? "Deactivate" : "Activate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <StaffFormModal 
                open={addOpen} 
                onClose={() => setAddOpen(false)} 
                title="Add Staff Member"
                onSubmit={handleCreate}
                isEdit={false}
            />
            <StaffFormModal 
                open={!!editing} 
                onClose={() => setEditing(null)} 
                title="Edit Staff Member"
                member={editing}
                onSubmit={handleUpdate}
                isEdit={true}
            />
        </div>
    );
}

function StaffFormModal({ open, onClose, title, member, onSubmit, isEdit }) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        password: "",
        role: "Staff"
    });

    useEffect(() => {
        if (member) {
            setFormData({
                firstName: member.firstName || "",
                lastName: member.lastName || "",
                email: member.email || "",
                phoneNumber: member.phoneNumber || "",
                address: member.address || "",
                password: "",
                role: member.role || "Staff"
            });
        } else {
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phoneNumber: "",
                address: "",
                password: "",
                role: "Staff"
            });
        }
    }, [member, open]);

    const handleSubmit = () => {
        if (isEdit) {
            onSubmit(member.userId, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                address: formData.address,
                status: member?.status || 0
            });
        } else {
            onSubmit({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                address: formData.address,
                password: formData.password,
                role: formData.role
            });
        }
    };

    return (
        <Modal 
            open={open} 
            onClose={onClose} 
            title={title} 
            description="Account details and permissions." 
            footer={
                <>
                    <button onClick={onClose} className="px-4 h-10 rounded-md border border-border text-sm hover:bg-surface">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                        {isEdit ? "Save changes" : "Create account"}
                    </button>
                </>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name">
                    <input 
                        className={inputCls} 
                        value={formData.firstName} 
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                        placeholder="John"
                        required
                    />
                </Field>
                <Field label="Last Name">
                    <input 
                        className={inputCls} 
                        value={formData.lastName} 
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                        placeholder="Doe"
                        required
                    />
                </Field>
                <Field label="Email">
                    <input 
                        className={inputCls} 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                        placeholder="name@autohub.com"
                        required
                    />
                </Field>
                <Field label="Phone">
                    <input 
                        className={inputCls} 
                        value={formData.phoneNumber} 
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                        placeholder="+977-98XXXXXXXX"
                        required
                    />
                </Field>
                <Field label="Address" className="sm:col-span-2">
                    <input 
                        className={inputCls} 
                        value={formData.address} 
                        onChange={(e) => setFormData({...formData, address: e.target.value})} 
                        placeholder="Kathmandu, Nepal"
                        required
                    />
                </Field>
                {!isEdit && (
                    <>
                        <Field label="Password">
                            <input 
                                className={inputCls} 
                                type="password" 
                                value={formData.password} 
                                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                placeholder="••••••••"
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Must be at least 6 characters with uppercase, lowercase, and number
                            </p>
                        </Field>
                        <Field label="Role">
                            <select 
                                className={inputCls} 
                                value={formData.role} 
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="Staff">Staff</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </Field>
                    </>
                )}
            </div>
        </Modal>
    );
}

// API Functions using apiFetch
async function getStaff() {
    return apiFetch("/staff");
}

async function createStaff(data) {
    return apiFetch("/staff", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

async function updateStaff(userId, data) {
    return apiFetch(`/staff/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

async function deactivateStaff(userId) {
    return apiFetch(`/staff/deactivate/${userId}`, {
        method: "PUT",
    });
}

async function activateStaff(userId) {
    return apiFetch(`/staff/activate/${userId}`, {
        method: "PUT",
    });
}

async function changeStaffRole(userId, role) {
    return apiFetch("/staff/change-role", {
        method: "PUT",
        body: JSON.stringify({ userId, role }),
    });
}

export default StaffPage;