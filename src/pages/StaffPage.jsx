import { PageHeader } from "../components/PageHeader";
import { Modal, Field, inputCls } from "../components/Modal";
import { Plus, Edit, Trash2 } from "lucide-react";
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
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    // Create staff
    const handleCreate = async (formData) => {
        setLoading(true);
        setMessage("");
        try {
            await createStaff(formData);
            setMessage(`Staff member ${formData.firstName} ${formData.lastName} created successfully!`);
            setMessageType("success");
            await fetchStaff();
            setAddOpen(false);
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setMessage("");
            }, 3000);
        } catch (err) {
            console.error("Failed to create staff:", err);
            setMessage(err.message || "Failed to create staff member");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    // Update staff
    const handleUpdate = async (userId, formData) => {
        setLoading(true);
        setMessage("");
        try {
            await updateStaff(userId, formData);
            setMessage(`Staff member updated successfully!`);
            setMessageType("success");
            await fetchStaff();
            setEditing(null);
            
            setTimeout(() => {
                setMessage("");
            }, 3000);
        } catch (err) {
            console.error("Failed to update staff:", err);
            setMessage(err.message || "Failed to update staff member");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    // Deactivate staff
    const handleDeactivate = async (userId, name) => {
        if (!confirm(`Deactivate ${name}? They will no longer have access to the system.`)) return;
        
        setLoading(true);
        try {
            await deactivateStaff(userId);
            setMessage(`${name} has been deactivated.`);
            setMessageType("success");
            await fetchStaff();
            
            setTimeout(() => {
                setMessage("");
            }, 3000);
        } catch (err) {
            console.error("Failed to deactivate staff:", err);
            setMessage(err.message || "Failed to deactivate staff member");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    // Activate staff
    const handleActivate = async (userId, name) => {
        setLoading(true);
        try {
            await activateStaff(userId);
            setMessage(`${name} has been activated.`);
            setMessageType("success");
            await fetchStaff();
            
            setTimeout(() => {
                setMessage("");
            }, 3000);
        } catch (err) {
            console.error("Failed to activate staff:", err);
            setMessage(err.message || "Failed to activate staff member");
            setMessageType("error");
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
            
            setTimeout(() => {
                setMessage("");
            }, 3000);
        } catch (err) {
            console.error("Failed to change role:", err);
            setMessage(err.message || "Failed to change staff role");
            setMessageType("error");
        } finally {
            setLoading(false);
        }
    };

    if (loading && staffList.length === 0) {
        return <div className="p-8 text-center">Loading staff...</div>;
    }

    return (<div>
      <PageHeader title="Staff Management" description="Manage staff accounts, roles, and access levels." actions={<button onClick={() => setAddOpen(true)} className="px-4 h-10 rounded-md bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90">
            <Plus className="h-4 w-4"/> Add Staff
          </button>}/>

      {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
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
              {staffList.map((s) => (<tr key={s.userId} className="border-t border-border hover:bg-surface">
                  <td className="px-6 py-3 font-mono text-xs">{s.userId?.slice(0, 8)}...</td>
                  <td className="px-6 py-3 font-medium">{s.firstName} {s.lastName}</td>
                  <td className="px-6 py-3">
                    <select 
                      value={s.role} 
                      onChange={(e) => handleChangeRole(s.userId, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border ${s.role === "Admin" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                      <option value="Admin">Admin</option>
                      <option value="Staff">Staff</option>
                    </select>
                   </td>
                  <td className="px-6 py-3 text-muted-foreground">{s.email}</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono text-xs">{s.phoneNumber}</td>
                  <td className="px-6 py-3">
                    <button 
                      onClick={() => s.status === 0 ? handleActivate(s.userId) : handleDeactivate(s.userId)}
                      className={`inline-flex items-center gap-1.5 text-xs ${s.status === 0 ? "text-success" : "text-muted-foreground"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.status === 0 ? "bg-success" : "bg-muted-foreground"}`}/>
                      {s.status === 0 ? "Active" : "Inactive"}
                    </button>
                   </td>
                  <td className="px-6 py-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(s)} className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-surface" aria-label="Edit">
                      <Edit className="h-3.5 w-3.5"/>
                    </button>
                  </td>
                 </tr>))}
              {staffList.length === 0 && !loading && (
                <tr><td colSpan="7" className="text-center py-8 text-muted-foreground">No staff members found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>);
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

    return (<Modal open={open} onClose={onClose} title={title} description="Account details and permissions." footer={<>
          <button onClick={onClose} className="px-4 h-10 rounded-md border border-border text-sm hover:bg-surface">Cancel</button>
          <button onClick={handleSubmit} className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            {isEdit ? "Save changes" : "Create account"}
          </button>
        </>}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First Name">
          <input className={inputCls} value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} placeholder="John"/>
        </Field>
        <Field label="Last Name">
          <input className={inputCls} value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} placeholder="Doe"/>
        </Field>
        <Field label="Email">
          <input className={inputCls} type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="name@autohub.com"/>
        </Field>
        <Field label="Phone">
          <input className={inputCls} value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} placeholder="+977-98XXXXXXXX"/>
        </Field>
        <Field label="Address" className="sm:col-span-2">
          <input className={inputCls} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Kathmandu, Nepal"/>
        </Field>
        {!isEdit && (
          <>
            <Field label="Password">
              <input className={inputCls} type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••"/>
            </Field>
            <Field label="Role">
              <select className={inputCls} value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option>Staff</option>
                <option>Admin</option>
              </select>
            </Field>
          </>
        )}
      </div>
    </Modal>);
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