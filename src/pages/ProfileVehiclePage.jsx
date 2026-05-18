import { useCallback, useEffect, useState } from "react";
import { Car, Plus } from "lucide-react";
import CustomerLayout from "../components/CustomerLayout";
import { Field, inputCls, Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5229/api"
).replace(/\/$/, "");

function ProfileVehiclePage() {
  const customerId = localStorage.getItem("customerId");
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [profileForm, setProfileForm] = useState(toProfileForm());
  const [vehicleForm, setVehicleForm] = useState(toVehicleForm());

  const loadProfile = useCallback(async () => {
    if (!customerId) {
      setMessage("Create a customer account before managing profile details.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const data = await getCustomerProfile(customerId);
      setProfile(data);
      setProfileForm(toProfileForm(data));
    } catch (err) {
      setMessage(err.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function openAddVehicle() {
    setVehicleForm(toVehicleForm());
    setAddOpen(true);
  }

  function openEditVehicle(vehicle) {
    setVehicleForm(toVehicleForm(vehicle));
    setEditingVehicle(vehicle);
  }

  async function handleProfileUpdate(event) {
    event.preventDefault();

    try {
      setLoading(true);
      await updateCustomerProfile(customerId, profileForm);
      await loadProfile();
      setMessage("Profile updated successfully.");
    } catch (err) {
      setMessage(err.message || "Unable to update profile.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVehicleSubmit(event) {
    event.preventDefault();

    const payload = {
      vehicleNumber: vehicleForm.vehicleNumber,
      brand: vehicleForm.brand,
      model: vehicleForm.model,
      color: vehicleForm.color,
      year: Number(vehicleForm.year),
    };

    try {
      setLoading(true);

      if (editingVehicle) {
        const vehicleId = getVehicleId(editingVehicle);

        if (!vehicleId) {
          throw new Error("Vehicle ID was not found for update.");
        }

        await updateVehicle(customerId, vehicleId, payload);
      } else {
        await addVehicle(customerId, payload);
      }

      setAddOpen(false);
      setEditingVehicle(null);
      setVehicleForm(toVehicleForm());
      await loadProfile();
      setMessage(
        editingVehicle
          ? "Vehicle updated successfully."
          : "Vehicle added successfully.",
      );
    } catch (err) {
      setMessage(err.message || "Unable to save vehicle.");
    } finally {
      setLoading(false);
    }
  }

  const vehicles = profile?.vehicles || [];

  return (
    <CustomerLayout>
      <PageHeader
        title="Profile & Vehicles"
        description="Manage your personal info and registered vehicles."
      />

      {message && <MessageBox message={message} />}

      <div className="space-y-6">
        <form
          onSubmit={handleProfileUpdate}
          className="rounded-lg border border-border bg-card p-6"
        >
          <div className="font-display mb-4 font-semibold">
            Personal Information
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name">
              <input
                className={inputCls}
                value={profileForm.firstName}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    firstName: event.target.value,
                  })
                }
              />
            </Field>
            <Field label="Last name">
              <input
                className={inputCls}
                value={profileForm.lastName}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    lastName: event.target.value,
                  })
                }
              />
            </Field>
            <Field label="Username">
              <input
                className={inputCls}
                value={profileForm.userName}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    userName: event.target.value,
                  })
                }
              />
            </Field>
            <Field label="Email">
              <input
                className={`${inputCls} text-muted-foreground`}
                value={profile?.email || ""}
                disabled
              />
            </Field>
            <Field label="Phone">
              <input
                className={inputCls}
                value={profileForm.phoneNumber}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    phoneNumber: event.target.value,
                  })
                }
              />
            </Field>
            <Field label="Address">
              <input
                className={inputCls}
                value={profileForm.address}
                onChange={(event) =>
                  setProfileForm({
                    ...profileForm,
                    address: event.target.value,
                  })
                }
              />
            </Field>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading || !customerId}
              className="h-10 rounded-md bg-primary px-5 font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="font-display font-semibold">My Vehicles</div>
            <button
              type="button"
              onClick={openAddVehicle}
              disabled={!customerId}
              className="flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Vehicle
            </button>
          </div>

          {vehicles.length > 0 ? (
            vehicles.map((vehicle) => (
              <div
                key={getVehicleId(vehicle) || getVehicleValue(vehicle, "vehicleNumber", "VehicleNumber")}
                className="mb-2 flex items-center gap-4 rounded-md border border-border p-4 last:mb-0"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface">
                  <Car className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {getVehicleValue(vehicle, "brand", "Brand")}{" "}
                    {getVehicleValue(vehicle, "model", "Model")} (
                    {getVehicleValue(vehicle, "year", "Year")})
                  </div>
                  <div className="font-mono mt-1 text-xs text-muted-foreground">
                    {getVehicleValue(vehicle, "vehicleNumber", "VehicleNumber")} -{" "}
                    {getVehicleValue(vehicle, "color", "Color")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openEditVehicle(vehicle)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Edit
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No vehicles registered yet.
            </p>
          )}
        </div>
      </div>

      <VehicleFormModal
        open={addOpen || !!editingVehicle}
        onClose={() => {
          setAddOpen(false);
          setEditingVehicle(null);
          setVehicleForm(toVehicleForm());
        }}
        onSubmit={handleVehicleSubmit}
        title={editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
        vehicleForm={vehicleForm}
        setVehicleForm={setVehicleForm}
        loading={loading}
      />
    </CustomerLayout>
  );
}

function VehicleFormModal({
  open,
  onClose,
  onSubmit,
  title,
  vehicleForm,
  setVehicleForm,
  loading,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Vehicle make, model, and registration."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md border border-border px-4 text-sm hover:bg-surface"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="vehicle-form"
            disabled={loading}
            className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Saving..." : title}
          </button>
        </>
      }
    >
      <form id="vehicle-form" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Brand">
            <input
              className={inputCls}
              value={vehicleForm.brand}
              onChange={(event) =>
                setVehicleForm({ ...vehicleForm, brand: event.target.value })
              }
              placeholder="Toyota"
              required
            />
          </Field>
          <Field label="Model">
            <input
              className={inputCls}
              value={vehicleForm.model}
              onChange={(event) =>
                setVehicleForm({ ...vehicleForm, model: event.target.value })
              }
              placeholder="Corolla"
              required
            />
          </Field>
          <Field label="Year">
            <input
              className={inputCls}
              type="number"
              value={vehicleForm.year}
              onChange={(event) =>
                setVehicleForm({ ...vehicleForm, year: event.target.value })
              }
              required
            />
          </Field>
          <Field label="Color">
            <input
              className={inputCls}
              value={vehicleForm.color}
              onChange={(event) =>
                setVehicleForm({ ...vehicleForm, color: event.target.value })
              }
              placeholder="Black"
              required
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="License plate">
              <input
                className={inputCls}
                value={vehicleForm.vehicleNumber}
                onChange={(event) =>
                  setVehicleForm({
                    ...vehicleForm,
                    vehicleNumber: event.target.value,
                  })
                }
                placeholder="BA 1 PA 1234"
                required
              />
            </Field>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function toProfileForm(data = {}) {
  return {
    userName: data.userName || "",
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    phoneNumber: data.phoneNumber || "",
    address: data.address || "",
  };
}

function toVehicleForm(vehicle = {}) {
  return {
    vehicleNumber: getVehicleValue(vehicle, "vehicleNumber", "VehicleNumber"),
    brand: getVehicleValue(vehicle, "brand", "Brand"),
    model: getVehicleValue(vehicle, "model", "Model"),
    color: getVehicleValue(vehicle, "color", "Color"),
    year: getVehicleValue(vehicle, "year", "Year"),
  };
}

function getVehicleId(vehicle = {}) {
  return getVehicleValue(vehicle, "vehicleId", "VehicleId", "id", "Id");
}

function getVehicleValue(vehicle = {}, ...keys) {
  for (const key of keys) {
    if (vehicle?.[key] !== undefined && vehicle?.[key] !== null) {
      return vehicle[key];
    }
  }

  return "";
}

function MessageBox({ message }) {
  return (
    <div className="mb-6 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: getAuthHeaders(options.headers),
  });
  return readApiResponse(res);
}

function getAuthHeaders(headers = {}) {
  const accessToken = localStorage.getItem("accessToken");

  return {
    ...headers,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

async function readApiResponse(res) {
  const text = await res.text();

  if (!res.ok) {
    let errorMessage = text || "Request failed.";

    try {
      const parsed = JSON.parse(text);
      errorMessage =
        parsed.message || parsed.Message || parsed.title || errorMessage;
    } catch {
      // Plain-text backend errors are already handled above.
    }

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

function getCustomerProfile(customerId) {
  return apiFetch(`/customers/${customerId}/profile`);
}

function updateCustomerProfile(customerId, data) {
  return apiFetch(`/customers/${customerId}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

function addVehicle(customerId, data) {
  return apiFetch(`/customers/${customerId}/vehicles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

function updateVehicle(customerId, vehicleId, data) {
  return apiFetch(`/customers/${customerId}/vehicles/${vehicleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export default ProfileVehiclePage;
