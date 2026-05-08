import { PageHeader } from "../components/PageHeader";
import { Modal, Field, inputCls } from "../components/Modal";
import { staff } from "../lib/dummy-data";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
function StaffPage() {
    const [addOpen, setAddOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    return (<div>
      <PageHeader title="Staff Management" description="Manage staff accounts, roles, and access levels." actions={<button onClick={() => setAddOpen(true)} className="px-4 h-10 rounded-md bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90">
            <Plus className="h-4 w-4"/> Add Staff
          </button>}/>

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
                <th className="text-left px-6 py-3">Joined</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-right px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (<tr key={s.id} className="border-t border-border hover:bg-surface">
                  <td className="px-6 py-3 font-mono text-xs">{s.id}</td>
                  <td className="px-6 py-3 font-medium">{s.name}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${s.role === "Admin" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>{s.role}</span>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{s.email}</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono text-xs">{s.phone}</td>
                  <td className="px-6 py-3 text-muted-foreground">{s.joined}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs ${s.status === "Active" ? "text-success" : "text-muted-foreground"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.status === "Active" ? "bg-success" : "bg-muted-foreground"}`}/>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing(s)} className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-surface" aria-label="Edit">
                      <Edit className="h-3.5 w-3.5"/>
                    </button>
                    <button className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-surface text-destructive" aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5"/>
                    </button>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>

      <StaffFormModal open={addOpen} onClose={() => setAddOpen(false)} title="Add Staff Member"/>
      <StaffFormModal open={!!editing} onClose={() => setEditing(null)} title="Edit Staff Member" member={editing}/>
    </div>);
}
function StaffFormModal({ open, onClose, title, member, }) {
    return (<Modal open={open} onClose={onClose} title={title} description="Account details and permissions." footer={<>
          <button onClick={onClose} className="px-4 h-10 rounded-md border border-border text-sm hover:bg-surface">
            Cancel
          </button>
          <button onClick={onClose} className="px-4 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            {member ? "Save changes" : "Create account"}
          </button>
        </>}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full name">
          <input className={inputCls} defaultValue={member?.name ?? ""} placeholder="Jane Doe"/>
        </Field>
        <Field label="Role">
          <select className={inputCls} defaultValue={member?.role ?? "Staff"}>
            <option>Admin</option>
            <option>Staff</option>
          </select>
        </Field>
        <Field label="Email">
          <input className={inputCls} type="email" defaultValue={member?.email ?? ""} placeholder="name@autohub.com"/>
        </Field>
        <Field label="Phone">
          <input className={inputCls} defaultValue={member?.phone ?? ""} placeholder="+977-98XXXXXXXX"/>
        </Field>
        <Field label="Joined">
          <input className={inputCls} type="date" defaultValue={member?.joined ?? ""}/>
        </Field>
        <Field label="Status">
          <select className={inputCls} defaultValue={member?.status ?? "Active"}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </Field>
      </div>
    </Modal>);
}
export default StaffPage;
