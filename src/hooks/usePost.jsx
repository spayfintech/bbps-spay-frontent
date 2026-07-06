import { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export function usePost(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cookie] = useCookies(["token"]);

  const getBearerToken = (token) => {
    if (!token) return "";

    const parts = token.split("|");
    return parts.length > 1 ? parts[1] : token;
  };

  const bearerToken = getBearerToken(cookie.token);

  const execute = async (body = {}) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      // ---------- LOGIN REQUEST ----------
      if (endpoint === "/login") {
        response = await axios.post(
          `${BASE_URL}${endpoint}`,
          {
            email: body.email,
            password: body.password,
          },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          },
        );
        return response.data;
      }

      if (
        // endpoint === "/send-mobile-otp" ||
        // endpoint === "/verify-mobile-otp" ||
        endpoint === "/otp/send-custom-mobile" ||
        endpoint === "/otp/verify-otp" ||
        endpoint === "/send-mail-otp" ||
        endpoint === "/verify-mail-otp" ||
        endpoint === "/register-new-merchant" ||
        endpoint === "/self-merchant-onboard-process"
      ) {
        const isFormData =
          typeof FormData !== "undefined" && body instanceof FormData;
        response = await axios.post(`${BASE_URL}${endpoint}`, body, {
          withCredentials: true,
          headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
          },
        });
        return response.data;
      }

      // ---------- BBPS RAW JSON REQUEST ----------
      if (
        endpoint === "/bbps/biller-info/json" ||
        endpoint === "/bbps/plan-pull/json" ||
        endpoint === "/bbps/plan-pull-test/json" ||
        endpoint === "/bbps/biller-info-test/json"
      ) {
        response = await axios.post(`${BASE_URL}${endpoint}`, body, {
          headers: {
            "Content-Type": "text/plain",
            Authorization: `Bearer ${bearerToken}`,
          },
        });
        return response;
      }

      if (endpoint === "/delete-scheme") {
        response = await axios.post(
          `${BASE_URL}${endpoint}/${body}`,
          {},
          {
            headers: {
              // "Content-Type": "text/plain",
              Authorization: `Bearer ${bearerToken}`,
            },
          },
        );
        return response;
      }

      // ---------- DEFAULT POST (FOR FORMDATA) ----------
      // const isFormData = body instanceof FormData;
      const isFormData =
        typeof FormData !== "undefined" && body instanceof FormData;

      response = await axios.post(`${BASE_URL}${endpoint}`, body, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          ...(isFormData ? {} : { "Content-Type": "application/json" }), // ❗ Correct logic
        },
      });
      setData(response.data);
      return response.data;
    } catch (err) {
      const errData = err.response?.data || "Something went wrong...";
      setError(errData);
      // throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute, setError };
}
