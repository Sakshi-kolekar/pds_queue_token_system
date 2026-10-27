const API_BASE = "http://127.0.0.1:8000/api";

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
}

// Turn a Django error response into one readable message
function errorMessage(data, fallback) {
  if (!data || typeof data !== "object") return fallback;
  if (data.detail) return data.detail;

  const messages = Object.values(data).flat().filter(Boolean);
  return messages.length ? messages.join(" ") : fallback;
}

async function postJson(path, body) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export async function login(username, password) {
  const { response, data } = await postJson("/auth/login/", {
    username,
    password,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid username or password.");
    }
    throw new Error("Login failed. Please try again.");
  }

  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data.user;
}

export async function logout() {
  const access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  try {
    await fetch(`${API_BASE}/auth/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify({ refresh }),
    });
  } catch {
    // The local session is cleared below even if the server is unreachable
  }

  clearSession();
}

export async function register(username, email, password) {
  const { response, data } = await postJson("/auth/register/", {
    username,
    email,
    password,
  });

  if (!response.ok) {
    throw new Error(errorMessage(data, "Registration failed."));
  }

  return data;
}

export async function forgotPassword(email) {
  const { response, data } = await postJson("/auth/forgot-password/", {
    email,
  });

  if (!response.ok) {
    throw new Error(errorMessage(data, "Could not send the reset link."));
  }

  return data.detail;
}

export async function resetPassword(uid, token, newPassword) {
  const { response, data } = await postJson("/auth/reset-password/", {
    uid,
    token,
    new_password: newPassword,
  });

  if (!response.ok) {
    throw new Error(errorMessage(data, "Could not reset the password."));
  }

  return data.detail;
}
// Get a new access token using the refresh token
async function refreshAccess() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return false;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    localStorage.setItem("access", data.access);
    return true;
  } catch {
    return false;
  }
}

// GET request with the login token. Retries once if the token has expired.
export async function apiGet(path) {
  function request() {
    return fetch(`${API_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    });
  }

  let response;

  try {
    response = await request();

    if (response.status === 401 && (await refreshAccess())) {
      response = await request();
    }
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  if (response.status === 401) {
    clearSession();
    window.location.href = "/login";
    throw new Error("Your session has expired. Please log in again.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("You are not allowed to view this.");
    }
    throw new Error(errorMessage(data, "Request failed."));
  }

  return data;
}
// POST request with the login token. Retries once if the token has expired.
export async function apiPost(path, body) {
  function request() {
    return fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
      body: JSON.stringify(body),
    });
  }

  let response;

  try {
    response = await request();

    if (response.status === 401 && (await refreshAccess())) {
      response = await request();
    }
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  if (response.status === 401) {
    clearSession();
    window.location.href = "/login";
    throw new Error("Your session has expired. Please log in again.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      response.status === 403
        ? "You are not allowed to do this."
        : errorMessage(data, "Request failed.")
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// DELETE request with the login token. Retries once if the token has expired.
export async function apiDelete(path) {
  function request() {
    return fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    });
  }

  let response;

  try {
    response = await request();

    if (response.status === 401 && (await refreshAccess())) {
      response = await request();
    }
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  if (response.status === 401) {
    clearSession();
    window.location.href = "/login";
    throw new Error("Your session has expired. Please log in again.");
  }

  // A successful delete has no response body
  if (response.status === 204) return true;

  const data = await response.json().catch(() => ({}));

  throw new Error(
    response.status === 403
      ? "You are not allowed to do this."
      : errorMessage(data, "Request failed.")
  );
}

// PUT request with the login token. Retries once if the token has expired.
export async function apiPut(path, body) {
  function request() {
    return fetch(`${API_BASE}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
      body: JSON.stringify(body),
    });
  }

  let response;

  try {
    response = await request();

    if (response.status === 401 && (await refreshAccess())) {
      response = await request();
    }
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  if (response.status === 401) {
    clearSession();
    window.location.href = "/login";
    throw new Error("Your session has expired. Please log in again.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      response.status === 403
        ? "You are not allowed to do this."
        : errorMessage(data, "Request failed.")
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// PATCH request with the login token. Retries once if the token has expired.
export async function apiPatch(path, body) {
  function request() {
    return fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
      body: JSON.stringify(body),
    });
  }

  let response;

  try {
    response = await request();

    if (response.status === 401 && (await refreshAccess())) {
      response = await request();
    }
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  if (response.status === 401) {
    clearSession();
    window.location.href = "/login";
    throw new Error("Your session has expired. Please log in again.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      response.status === 403
        ? "You are not allowed to do this."
        : errorMessage(data, "Request failed.")
    );
  }

  return data;
}