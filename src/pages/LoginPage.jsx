import { Link } from "../components/Link";
import loginImage from "../assets/register_image.jpeg";
import { useState } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL).replace(
    /\/$/,
    "",
);

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userName: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const accessToken = data.token ?? data.Token ?? data.accessToken ?? data.AccessToken;
                const refreshToken = data.refreshToken ?? data.RefreshToken;
                const customerId = data.customerId ?? data.CustomerId;
                const roles = data.roles ?? data.Roles ?? [];

                if (!accessToken || !refreshToken) {
                    setError("Login succeeded, but tokens were not returned.");
                    return;
                }

                localStorage.setItem("token", accessToken);
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                localStorage.setItem("roles", JSON.stringify(roles));

                if (data.userId || data.UserId) {
                    localStorage.setItem("userId", data.userId ?? data.UserId);
                }

                if (data.email || data.Email) {
                    localStorage.setItem("userEmail", data.email ?? data.Email);
                    localStorage.setItem("email", data.email ?? data.Email);
                }

                if (data.userName || data.UserName) {
                    localStorage.setItem("userName", data.userName ?? data.UserName);
                }

                if (customerId) {
                    localStorage.setItem("customerId", String(customerId));
                } else {
                    localStorage.removeItem("customerId");
                }

                // Redirect based on role
                if (roles.includes("Admin")) {
                    window.location.href = "/admin";
                } else if (roles.includes("Staff")) {
                    window.location.href = "/staff";
                } else if (roles.includes("Customer")) {
                    if (!customerId) {
                        setError("Customer login succeeded, but no customer profile is linked to this account.");
                        return;
                    }

                    window.location.href = "/customer/dashboard";
                } else {
                    window.location.href = "/";
                }
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            setError("Cannot connect to server. Make sure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left side - image */}
            <div className="relative hidden min-h-screen overflow-hidden bg-[#DADDD8] lg:block">
                <img src={loginImage} alt="Workshop" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/90 via-[#1C1C1C]/35 to-transparent" />
                <div className="absolute bottom-12 left-12 right-12 text-[#FAFAFF]">
                    <h2 className="max-w-xl text-5xl font-extrabold leading-tight">Welcome back to VehicleIMS.</h2>
                    <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
                        Log in to manage your vehicles, bookings, part requests, and service reviews all in one place.
                    </p>
                </div>
            </div>

            {/* Right side - form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-sm space-y-8">
                    <div>
                        <h2 className="font-display text-3xl font-bold">Sign in</h2>
                        <p className="text-muted-foreground text-sm mt-2">Enter your email and password to access your account.</p>
                    </div>

                    {error && (
                        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-xs uppercase tracking-wider text-muted-foreground">Email or Username</label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 w-full h-11 px-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="admin@vehicleims.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs uppercase tracking-wider text-muted-foreground">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full h-11 px-3 rounded-md border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-70"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="text-xs text-muted-foreground text-center">
                        New customer?{" "}
                        <Link to="/register" className="text-foreground font-medium underline">
                            Create an account
                        </Link>
                    </div>

                    {/* Test credentials */}
                    <div className="mt-6 p-3 rounded-md bg-surface border border-border text-xs">
                        <p className="font-medium mb-2">Test Accounts:</p>
                        <p>Admin: admin@vehicleims.com / Admin@123</p>
                        <p>Staff: staff@vehicleims.com / Staff@123</p>
                        <p>Customer: customer@vehicleims.com / Customer@123</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
