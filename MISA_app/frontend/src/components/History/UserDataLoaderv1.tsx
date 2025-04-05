// import React, { useEffect } from "react";
// import { v4 as uuidv4 } from "uuid";
// // import axios from "axios";
// import { api } from "../api/api";

// const UserDataLoader: React.FC = () => {
//   useEffect(() => {
//     let userUUID = localStorage.getItem("userUUID");

//     if (!userUUID) {
//       userUUID = uuidv4();
//       localStorage.setItem("userUUID", userUUID);
//       console.log("Generated new UUID:", userUUID);

//       // Store new user UUID in backend
//       api
//         .post("/generate_user", { uuid: userUUID })
//         .then((response) =>
//           console.log("User UUID stored:", response.data.message)
//         )
//         .catch((error) => console.error("Error storing UUID:", error));
//     } else {
//       console.log("User UUID found:", userUUID);
//     }

//     // ✅ Check if user info is in localStorage to avoid unnecessary API calls
//     const storedUserInfo = localStorage.getItem("userInfo");
//     if (storedUserInfo) {
//       const parsedUserInfo = JSON.parse(storedUserInfo);
//       console.log("Loaded user data from localStorage:", parsedUserInfo);
//       console.log("User ID:", parsedUserInfo?.UserID || "Not Found");
//     } else {
//       // Fetch from backend only if `userInfo` is missing
//       api
//         .get(`/get_user/${userUUID}`)
//         .then((response) => {
//           if (response.data.success) {
//             const userData = response.data.user_data;
//             console.log("Retrieved User Data from Backend:", userData);

//             // Store in localStorage for future use
//             localStorage.setItem("userInfo", JSON.stringify(userData));
//           } else {
//             console.warn("No user data found for UUID:", userUUID);
//           }
//         })
//         .catch((error) => console.error("Error retrieving user data:", error));
//     }
//   }, []);

//   return null; // This component does not render anything
// };

// export default UserDataLoader;


// ==================================================================================================================================
// import React, { useEffect } from "react";
// import { v4 as uuidv4 } from "uuid";
// import { api } from "../api/api";

// const UserDataLoader: React.FC = () => {
//   useEffect(() => {
//     const loadUserData = async () => {
//       // Retrieve or generate the UUID
//       let userUUID = localStorage.getItem("userUUID");
//       if (!userUUID) {
//         userUUID = uuidv4();
//         localStorage.setItem("userUUID", userUUID);
//         console.log("Generated new UUID:", userUUID);

//         // POST to create the user
//         try {
//           const postResponse = await api.post("/generate_user", { uuid: userUUID });
//           console.log("User UUID stored:", postResponse.data.message);
//         } catch (postError) {
//           console.error("Error storing UUID:", postError);
//           return; // Exit if user creation fails
//         }
//       } else {
//         console.log("User UUID found:", userUUID);
//       }

//       // Fetch the user info after ensuring the user exists
//       try {
//         const getResponse = await api.get(`/get_user/${userUUID}`);
//         if (getResponse.data.success) {
//           const userData = getResponse.data.user_data;
//           console.log("Retrieved User Data from Backend:", userData);
//           // Save user info for future use
//           localStorage.setItem("userInfo", JSON.stringify(userData));
//         } else {
//           console.warn("No user data found for UUID:", userUUID);
//         }
//       } catch (getError) {
//         console.error("Error retrieving user data:", getError);
//       }
//     };

//     loadUserData();
//   }, []);

//   return null; // This component does not render anything
// };

// export default UserDataLoader;