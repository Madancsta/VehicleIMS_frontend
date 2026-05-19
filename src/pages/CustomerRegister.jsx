import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import registerImage from "../assets/register_image.jpeg";
import { Link } from "../components/Link";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL).replace(
  /\/$/,
  "",
);

function Register() {
  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        userName: formData.userName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        password: formData.password,
      };

      const result = await registerCustomer(payload);

      const registeredCustomerId = result?.customerId ?? result?.CustomerId ?? result?.id;
      const accessToken = result?.token ?? result?.Token ?? result?.accessToken ?? result?.AccessToken;
      const refreshToken = result?.refreshToken ?? result?.RefreshToken;
      const roles = result?.roles ?? result?.Roles ?? [];

      if (!registeredCustomerId) {
        throw new Error("Registration completed but no customer ID was returned.");
      }

      if (!accessToken || !refreshToken) {
        throw new Error("Registration completed but tokens were not returned.");
      }

      localStorage.setItem("customerId", String(registeredCustomerId));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("roles", JSON.stringify(roles));

      if (result?.userId || result?.UserId) {
        localStorage.setItem("userId", result.userId ?? result.UserId);
      }

      if (result?.email || result?.Email) {
        localStorage.setItem("email", result.email ?? result.Email);
      }

      if (result?.userName || result?.UserName) {
        localStorage.setItem("userName", result.userName ?? result.UserName);
      }

      navigateTo("/customer/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFF] font-['DM_Sans','Segoe_UI',sans-serif]">
      <section className="grid min-h-screen w-full lg:grid-cols-[1fr_1fr]">
        {/* LEFT SIDE IMAGE */}
        <div className="relative hidden min-h-screen overflow-hidden bg-[#DADDD8] lg:block">
          <img src={registerImage} alt="Workshop" className="h-full w-full object-cover" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/90 via-[#1C1C1C]/35 to-transparent" />

          <div className="absolute bottom-12 left-12 right-12 text-[#FAFAFF]">
            <h2 className="max-w-xl text-5xl font-extrabold leading-tight tracking-[-0.04em]">
              Register and manage your service account.
            </h2>

            <p className="mt-5 max-w-lg text-base leading-7 text-white/75">
              Create your customer profile, then manage vehicles, appointments, unavailable part
              requests, and service reviews.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-20">
          <form onSubmit={handleSubmit} className="w-full max-w-[600px]">
            <h1 className="text-3xl font-extrabold text-[#1C1C1C]">Create an Account</h1>

            <p className="mt-2 mb-2 text-sm text-[#6B7280]">
              Register as a customer and manage your profile.
            </p>

            {error && <p className="mb-6 text-sm font-medium text-red-600">{error}</p>}

            <input
              name="userName"
              value={formData.userName}
              placeholder="Username"
              onChange={handleChange}
              className="input mb-5"
              required
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <input
                name="firstName"
                value={formData.firstName}
                placeholder="First Name"
                onChange={handleChange}
                className="input"
                required
              />

              <input
                name="lastName"
                value={formData.lastName}
                placeholder="Last Name"
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <input
              name="email"
              type="email"
              value={formData.email}
              placeholder="Email"
              onChange={handleChange}
              className="input mt-5"
              required
            />

            <div className="grid gap-5 sm:grid-cols-2 mt-5">
              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                placeholder="Phone Number"
                onChange={handleChange}
                className="input"
                required
              />

              <input
                name="address"
                value={formData.address}
                placeholder="Address"
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div className="relative mt-5">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                placeholder="Password"
                onChange={handleChange}
                className="input pr-12"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <input
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              placeholder="Confirm Password"
              onChange={handleChange}
              className="input mt-5"
              required
            />

            <label className="mt-6 flex items-center gap-3 text-sm text-[#374151]">
              <input
                type="checkbox"
                name="acceptedTerms"
                checked={formData.acceptedTerms}
                onChange={handleChange}
                required
              />
              <span>
                I agree to the{" "}
                <span className="cursor-pointer font-bold underline">Terms & Conditions</span>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 h-12 w-full rounded-xl bg-[#1C1C1C] text-white font-semibold"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="mt-5 text-center text-sm text-[#6B7280]">
              Already have an account?{" "}
              <Link to="/" className="font-bold text-[#1C1C1C] underline underline-offset-4">
                Login
              </Link>
            </p>
          </form>
        </div>
      </section>

      <style>{`
        .input {
          height: 48px;
          width: 100%;
          border-radius: 12px;
          border: 1px solid #DADDD8;
          padding: 0 16px;
        }
      `}</style>
    </div>
  );
}

function navigateTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("app:navigate"));
}

async function registerCustomer(data) {
  const res = await fetch(`${API_BASE_URL}/customers/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return readApiResponse(res);
}

async function readApiResponse(res) {
  const text = await res.text();

  if (!res.ok) {
    let errorMessage = text || "Registration failed.";

    try {
      const parsed = JSON.parse(text);
      errorMessage = parsed.message || parsed.Message || parsed.title || errorMessage;
    } catch {}

    throw new Error(errorMessage);
  }

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default Register;
