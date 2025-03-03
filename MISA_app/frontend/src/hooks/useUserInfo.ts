import { useState, useEffect } from "react";
// import axios from "axios";
import { api } from "../api/api";

interface UserInfo {
  user_id: number;
  uuid: string;
}

const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const userUUID = localStorage.getItem("userUUID");

  useEffect(() => {
    const userInfoString = localStorage.getItem("userInfo");

    if (userInfoString) {
      try {
        const parsedUserInfo = JSON.parse(userInfoString);
        console.log("ParsedUserInfo from localStorage:", parsedUserInfo);

        const user_id = parsedUserInfo.user_id || parsedUserInfo?.data?.user_id;
        const uuid = parsedUserInfo.uuid || parsedUserInfo?.data?.uuid;

        if (user_id) {
          setUserInfo({ user_id, uuid });
        } else {
          console.warn("Warning: 'user_id' not found in 'userInfo'");
        }
      } catch (error) {
        console.error("Error parsing userInfo from localStorage:", error);
      }
    } else if (userUUID) {
      console.warn("No 'userInfo' found in localStorage. Fetching from API...");

      api.get(`/get_user/${userUUID}`)
        .then((response) => {
          if (response.data.success) {
            const userData = response.data.user_data;
            console.log("User data loaded from API:", userData);

            // ✅ Store retrieved user data in localStorage
            localStorage.setItem("userInfo", JSON.stringify(userData));

            setUserInfo({
              uuid: userData.uuid,
              user_id: userData.user_id || 0,
            });
          } else {
            console.warn("User not found in database.");
          }
        })
        .catch((error) => {
          console.error("Error retrieving user:", error);
        });
    }
  }, [userUUID]); // ✅ Depend on userUUID

  return userInfo;
};

export default useUserInfo;
// import { useState, useEffect } from "react";
// import axios from "axios";

// interface UserInfo {
//   user_id: number;
//   uuid: string;
// }

// const useUserInfo = () => {
//   const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // ✅ UseState should be at the top level
//   const userUUID = localStorage.getItem("userUUID");

//   useEffect(() => {
//     const userInfoString = localStorage.getItem("userInfo");

//     if (userInfoString) {
//       try {
//         const parsedUserInfo = JSON.parse(userInfoString);
//         console.log("ParsedUserInfo:", parsedUserInfo);

//         const user_id = parsedUserInfo.user_id || parsedUserInfo?.data?.user_id;
//         const uuid = parsedUserInfo.uuid || parsedUserInfo?.data?.uuid;

//         if (user_id) {
//           setUserInfo({ user_id, uuid });
//         } else {
//           console.warn("Warning: 'user_id' not found in 'userInfo'");
//         }
//       } catch (error) {
//         console.error("Error parsing userInfo from localStorage:", error);
//       }
//     } else if (userUUID) {
//       console.warn("No 'userInfo' found in localStorage. Fetching from API...");
//       axios
//         .get(`http://localhost:5001/get_user/${userUUID}`)
//         .then((response) => {
//           if (response.data.success) {
//             const userData = response.data.user_data;
//             console.log("User data loaded:", userData);
//             setUserInfo({
//               uuid: userData.uuid,
//               user_id: userData.user_id || 0,
//             });
//           } else {
//             console.warn("User not found");
//           }
//         })
//         .catch((error) => {
//           console.error("Error retrieving user:", error);
//         });
//     }
//   }, [userUUID]); // ✅ Depend on userUUID

//   return userInfo;
// };

// export default useUserInfo;

// // import { useState, useEffect } from "react";
// // import axios from "axios";

// // interface UserInfo {
// //   user_id: number;
// //   uuid: string;
// // }

// // const useUserInfo = () => {
// //   const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
// //   const [user, setUser] = useState<{ uuid: string; user_id: number } | null>(
// //     null
// //   );

// //   useEffect(() => {
// //     const userInfoString = localStorage.getItem("userInfo");
// //     const userUUID = localStorage.getItem("userUUID");
    

    

// //     if (userInfoString) {
// //       try {
// //         const parsedUserInfo = JSON.parse(userInfoString);
// //         console.log("ParsedUserInfo:", parsedUserInfo);

// //         // ✅ Handle both cases: Directly stored or nested inside 'data'
// //         const user_id = parsedUserInfo.user_id || parsedUserInfo?.data?.user_id;
// //         const uuid = parsedUserInfo.uuid || parsedUserInfo?.data?.uuid;

// //         if (user_id) {
// //           setUserInfo({ user_id, uuid });
// //         } else {
// //           console.warn("Warning: 'user_id' not found in 'userInfo'");
// //         }
// //       } catch (error) {
// //         console.error("Error parsing userInfo from localStorage:", error);
// //       }
// //     } else {
// //       console.warn("Warning: No 'userInfo' found in localStorage");
// //       console.log("userUUID: ", userUUID);
// //       axios
// //       .get(`http://localhost:5001/get_user/${userUUID}`)
// //       .then((response) => {
// //         if (response.data.success) {
// //           const userData = response.data.user_data;
// //           console.log("User data loaded:", userData);

// //           // ✅ Fix incorrect key name
// //           setUser({
// //             uuid: userData.uuid,
// //             user_id: userData.user_id || 0, // Ensure correct key is used
// //           });
// //           console.log("UserInfo from db:",user);
// //           // setUserInfo(user);
// //         } else {
// //           console.warn("User not found");
// //           // navigate("/welcome");
// //         }
// //       })
// //       .catch((error) => {
// //         console.error("Error retrieving user:", error);
        
// //       });


// //     }
// //   }, []);

// //   return userInfo;
// // };

// // export default useUserInfo;