"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, clearCredentials } from "@/app/store/slices/authSlice";
import apiClient from "../lib/api-client";

export function useHydrateAuth() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const { data } = await apiClient.get("/user/stats");
        dispatch(
          setCredentials({
            user: {
              id: data._id,
              name: data.name,
              email: data.email,
              profileImage: data.profileImage,
              phone: data.phone,
            },
            role: data.role,
            totalProperties: data.totalProperties,
            totalFavorites: data.totalFavorites,
          }),
        );
      } catch (err) {
        dispatch(clearCredentials());
      }
    };

    fetchUserStats();
  }, [dispatch]);
}
