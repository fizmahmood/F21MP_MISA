import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { api } from "../api/api";

const UserDataLoader: React.FC = () => {
  useEffect(() => {
    const loadUserData = async () => {
      // Retrieve the UUID from localStorage, if available.
      let userUUID = localStorage.getItem("userUUID");

      // Case A: If no UUID exists, generate one and post it.
      if (!userUUID) {
        userUUID = uuidv4();
        localStorage.setItem("userUUID", userUUID);
        console.log("Generated new UUID:", userUUID);

        try {
          const postResponse = await api.post("/generate_user", { uuid: userUUID });
          console.log("User UUID stored:", postResponse.data.message);
        } catch (error) {
          console.error("Error storing UUID:", error);
          return; // Exit early if POST fails.
        }
      } else {
        console.log("User UUID found:", userUUID);
      }

      // Case B & C: Check if user info is already available in localStorage.
      let storedUserInfo = localStorage.getItem("userInfo");
      if (!storedUserInfo) {
        // If user info is missing, fetch it from the backend.
        try {
          const getResponse = await api.get(`/get_user/${userUUID}`);
          if (getResponse.data.success) {
            const userData = getResponse.data.user_data;
            console.log("Retrieved User Data from Backend:", userData);
            localStorage.setItem("userInfo", JSON.stringify(userData));
          } else {
            console.warn("No user data found for UUID:", userUUID);
          }
        } catch (error) {
          console.error("Error retrieving user data:", error);
        }
      } else {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        console.log("Loaded user data from localStorage:", parsedUserInfo);
        console.log("User ID:", parsedUserInfo?.user_id || "Not Found");
      }
    };

    loadUserData();
  }, []);

  return null; // This component does not render any UI.
};

export default UserDataLoader;