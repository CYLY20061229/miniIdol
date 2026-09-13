const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "请求失败");
  }
  return data;
}

export const api = {
  createIntent(intentPayload) {
    return request("/api/intents", {
      method: "POST",
      body: JSON.stringify(intentPayload)
    });
  },
  getIntent(intentId) {
    return request(`/api/intents/${intentId}`);
  },
  createPreview(intentId) {
    return request(`/api/intents/${intentId}/preview`, { method: "POST" });
  },
  redeem(intentId, code) {
    return request("/api/redeem", {
      method: "POST",
      body: JSON.stringify({ intentId, code })
    });
  },
  getJob(jobId) {
    return request(`/api/jobs/${jobId}`);
  },
  getResult(jobId) {
    return request(`/api/results/${jobId}`);
  }
};
