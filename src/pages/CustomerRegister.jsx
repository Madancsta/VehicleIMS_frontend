import { PageHeader } from "../components/PageHeader";
function CustomerRegister() {
    return (<div>
      <PageHeader title="Register Customer" description="Add a new customer with vehicle details."/>

      <div className="bg-card border border-border rounded-lg p-8 max-w-3xl">
        <div className="font-display font-semibold mb-4">Personal Information</div>
        <div className="grid grid-cols-2 gap-5">
          {[["Full name", "Rajesh Adhikari"], ["Phone", "+977-9XXXXXXXXX"], ["Email", "name@email.com"], ["Address", "Lalitpur"]].map(([l, p]) => (<Field key={l} label={l} placeholder={p}/>))}
        </div>

        <div className="font-display font-semibold mt-8 mb-4 pt-6 border-t border-border">Vehicle Information</div>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Vehicle type</label>
            <select className="mt-1 w-full h-11 px-3 rounded-md border border-input bg-background">
              <option>Motorcycle</option><option>Car</option><option>Truck</option>
            </select>
          </div>
          {[["Make", "Honda"], ["Model", "Shine"], ["Year", "2022"], ["Plate Number", "BA 12 PA 4567"], ["Chassis #", "CHS-XXXX"]].map(([l, p]) => (<Field key={l} label={l} placeholder={p}/>))}
        </div>

        <div className="flex justify-end gap-2 mt-8 pt-6 border-t border-border">
          <button className="px-5 h-11 rounded-md border border-border">Cancel</button>
          <button className="px-6 h-11 rounded-md bg-primary text-primary-foreground font-medium">Register Customer</button>
        </div>
      </div>
    </div>);
}
function Field({ label, placeholder }) {
    return (<div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <input placeholder={placeholder} className="mt-1 w-full h-11 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"/>
    </div>);
}
export default CustomerRegister;
