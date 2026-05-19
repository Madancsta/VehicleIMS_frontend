// src/api/apiClient.js

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL
).replace(/\/$/, "");

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: getAuthHeaders(options.headers),
  });

  return readApiResponse(res);
}

function getAuthHeaders(headers = {}) {
  const accessToken = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    ...headers,
    ...(accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {}),
  };
}

async function readApiResponse(res) {
  const text = await res.text();

  if (!res.ok) {
    let errorMessage = text || "Request failed.";

    try {
      const parsed = JSON.parse(text);

      errorMessage =
        parsed.message ||
        parsed.Message ||
        parsed.title ||
        errorMessage;
    } catch {
      // plain text response
    }

    if (res.status === 401) {
      errorMessage = "Authentication required. Please login again.";
    }

    if (res.status === 403) {
      errorMessage = "Admin access required.";
    }

    throw new Error(errorMessage);
  }

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}