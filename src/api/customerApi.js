const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function handleResponse(res) {
  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Something went wrong");
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

export async function registerCustomer(data) {
  const res = await fetch(`${API_BASE_URL}/customers/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

export async function getCustomerProfile(customerId) {
  const res = await fetch(`${API_BASE_URL}/customers/${customerId}/profile`);
  return handleResponse(res);
}

export async function updateCustomerProfile(customerId, data) {
  const res = await fetch(`${API_BASE_URL}/customers/${customerId}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

export async function addVehicle(customerId, data) {
  const res = await fetch(`${API_BASE_URL}/customers/${customerId}/vehicles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

export async function updateVehicle(vehicleId, data) {
  const res = await fetch(`${API_BASE_URL}/customers/vehicles/${vehicleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

export async function createBooking(data) {
  const res = await fetch(`${API_BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

export async function getVehicleBookings(vehicleId) {
  const res = await fetch(`${API_BASE_URL}/bookings/vehicle/${vehicleId}`);
  return handleResponse(res);
}

export async function createPartRequest(data) {
  const res = await fetch(`${API_BASE_URL}/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

export async function createReview(data) {
  const res = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

export async function getReviewsBySales(salesId) {
  const res = await fetch(`${API_BASE_URL}/reviews/sales/${salesId}`);
  return handleResponse(res);
}
