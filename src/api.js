async function request(path, options) {
  const response = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.status === 204 ? null : response.json();
}

export const getBatches = () => request("/batches");

export const updateBatch = (id, details) =>
  request(`/batches/${id}`, {
    method: "PUT",
    body: JSON.stringify(details),
  });

export const updateCandidate = (id, details) =>
  request(`/candidates/${encodeURIComponent(id)}/outcome`, {
    method: "PUT",
    body: JSON.stringify(details),
  });
