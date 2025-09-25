import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:5001/gemstone",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-user-type": "seller", // Default user type for development
  },
});

// Request interceptor to add auth headers
api.interceptors.request.use(
  (config) => {
    // Add user type header based on current user context
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userType = user.role || "seller";
    console.log("User type from localStorage:", userType);
    config.headers["x-user-type"] = userType;

    // Debug logging for development
    if (import.meta.env.DEV) {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        {
          headers: config.headers,
          data: config.data,
        }
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Debug logging for successful responses
    if (import.meta.env.DEV) {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (import.meta.env.DEV) {
      console.error(
        `❌ API Error: ${error.config?.method?.toUpperCase()} ${
          error.config?.url
        }`,
        {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        }
      );
    }
    return Promise.reject(error);
  }
);

// Gemstone API functions
export const gemstoneAPI = {
  // Create a new gemstone listing
  createGemstone: async (formData) => {
    try {
      const response = await api.post("/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to create gemstone listing" }
      );
    }
  },

  // Get all gemstones with filters
  getGemstones: async (params = {}) => {
    try {
      const response = await api.get("/", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch gemstones" };
    }
  },

  // Get single gemstone by ID
  getGemstone: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch gemstone" };
    }
  },

  // Update gemstone
  updateGemstone: async (id, formData) => {
    try {
      const response = await api.put(`/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update gemstone" };
    }
  },

  // Delete gemstone
  deleteGemstone: async (id, permanent = false) => {
    try {
      const response = await api.delete(`/${id}?permanent=${permanent}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete gemstone" };
    }
  },

  // Admin functions
  verifyGemstone: async (id, verificationNotes = "") => {
    try {
      const response = await api.post(`/${id}/verify`, { verificationNotes });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to verify gemstone" };
    }
  },

  rejectGemstone: async (id, rejectionReason, suggestions = "") => {
    try {
      const response = await api.post(`/${id}/reject`, {
        rejectionReason,
        suggestions,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to reject gemstone" };
    }
  },

  // Bulk operations
  bulkUpdate: async (gemstoneIds, updateData) => {
    try {
      const response = await api.patch("/bulk/update", {
        gemstoneIds,
        updateData,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to perform bulk update" }
      );
    }
  },

  // Get filter options
  getFilterOptions: async () => {
    try {
      const response = await api.get("/filters/options");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch filter options" }
      );
    }
  },

  // Get statistics (admin only)
  getStatistics: async () => {
    try {
      const response = await api.get("/stats/overview");
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch statistics" };
    }
  },

  // Search gemstones
  searchGemstones: async (query, filters = {}) => {
    try {
      const response = await api.get("/search/advanced", {
        params: { q: query, ...filters },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to search gemstones" };
    }
  },

  getPendingGemstones: async () => {
    try {
      const response = await api.get("/");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch pending gemstones" }
      );
    }
  },
};

// Utility functions
export const createFormData = (data, files = []) => {
  const formData = new FormData();

  // Add all form fields
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      if (typeof data[key] === "object" && !Array.isArray(data[key])) {
        // Handle nested objects
        Object.keys(data[key]).forEach((subKey) => {
          if (data[key][subKey] !== null && data[key][subKey] !== undefined) {
            formData.append(`${key}.${subKey}`, data[key][subKey]);
          }
        });
      } else if (Array.isArray(data[key])) {
        // Handle arrays
        data[key].forEach((item, index) => {
          if (typeof item === "object") {
            Object.keys(item).forEach((subKey) => {
              formData.append(`${key}[${index}].${subKey}`, item[subKey]);
            });
          } else {
            formData.append(`${key}[${index}]`, item);
          }
        });
      } else {
        formData.append(key, data[key]);
      }
    }
  });

  // Add files
  files.forEach((file) => {
    if (file instanceof File) {
      formData.append("images", file);
    }
  });

  return formData;
};

// User type management
export const setUserType = (role) => {
  localStorage.setItem("role", role);
  api.defaults.headers["x-user-type"] = role;
};

export const getUserType = () => {
  return localStorage.getItem("role") || "seller";
};

export default api;
