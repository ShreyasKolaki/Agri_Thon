const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8010";
const MODEL_URL = import.meta.env.VITE_MODEL_URL ?? "http://localhost:8001";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.detail || payload.error || "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export interface Crop {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  farmer_id: string;
  status: string;
  image_url?: string;
}

export interface Order {
  _id: string;
  crop_id: string;
  farmer_id: string;
  buyer_id: string;
  quantity: number;
  total_price: number;
  status: string;
  delivery_id?: string;
}

export const api = {
  signup: (body: { role: string; email?: string; phone?: string; password: string }) =>
    request<{ message?: string; error?: string }>(`${BACKEND_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  login: (body: { role: string; email?: string; phone?: string; password: string }) =>
    request<{ message?: string; role?: string; error?: string }>(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  addCrop: (formData: FormData) =>
    request<{ message: string; data: Crop }>(`${BACKEND_URL}/farmer/add-crop`, {
      method: "POST",
      body: formData,
    }),

  browseCrops: () => request<Crop[]>(`${BACKEND_URL}/buyer/browse`),

  placeOrder: (body: { crop_id: string; buyer_id: string; quantity: number }) =>
    request<{ message: string; order: Order }>(`${BACKEND_URL}/buyer/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  availableDeliveries: () => request<Order[]>(`${BACKEND_URL}/delivery/available`),

  acceptDelivery: (body: { order_id: string; driver_id: string }) =>
    request<{ message: string; order_id: string; driver_id: string }>(`${BACKEND_URL}/delivery/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),

  predictPrice: (commodity: string) =>
    request<{ predicted_price: number; suggestion: string }>(
      `${MODEL_URL}/predict?commodity=${encodeURIComponent(commodity)}`
    ),

  chat: (query: string) =>
    request<{ response: string }>(`${MODEL_URL}/chatbot?query=${encodeURIComponent(query)}`),
};
