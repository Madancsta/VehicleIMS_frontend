import { Link } from "../components/Link";
import { Wrench, ArrowRight } from "lucide-react";
import loginImage from "../assets/register_image.jpeg";

function LoginPage() {
    return (<div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — brand */}
      <div className="relative hidden min-h-screen overflow-hidden bg-[#DADDD8] lg:block">
        <img
          src={loginImage}
          alt="Workshop"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/90 via-[#1C1C1C]/35 to-transparent" />

        <div className="absolute bottom-12 left-12 right-12 text-[#FAFAFF]">
          <h2 className="max-w-xl text-5xl font-extrabold leading-tight tracking-[-0.04em]">
            Welcome back to VehicleIMS.
          </h2>

          <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
            Log in to manage your vehicles, bookings, part requests, and
            service reviews all in one place.
          </p>
        </div>
      </div>


      {/* Right — form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <h2 className="font-display text-3xl font-bold">Sign in</h2>
            <p className="text-muted-foreground text-sm mt-2">
              Enter your email and password to access your account.
            </p>
          </div>

          <form className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
              <input type="email" defaultValue="user@autohub.com" className="mt-1 w-full h-11 px-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"/>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
              <input type="password" defaultValue="demo1234" className="mt-1 w-full h-11 px-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"/>
            </div>
            <button className="px-6 h-11 rounded-md bg-primary text-primary-foreground font-medium">Login</button>
          </form>

          <div className="text-xs text-muted-foreground text-center">
            New customer?{" "}
            <Link to="/register" className="text-foreground font-medium underline underline-offset-2">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>);
}
export default LoginPage;
