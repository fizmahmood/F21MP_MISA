// // import Message from "./Message";
// // import FormFacts from "./components/FormFacts";
// //import axios from "axios";
// import "bootstrap/dist/css/bootstrap.min.css";
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import InputGroup from "./components/InputGroup";
// // import ResultsPage from "./components/ResultsPage";
// // import ResultsOnlyPage from "./components/ResultsOnlyPage";
// import {
//   HashRouter as Router,
//   Routes,
//   Route,
//   useNavigate,
// } from "react-router-dom";
// import ResultsPage from "./components/ResultsPage";
// import { v4 as uuidv4 } from "uuid";

// const HomePage: React.FC = () => {
//   const [formData, setFormData] = useState({
//     //
//     father: 0,
//     mother: 0,
//     sons: 0,
//     daughters: 0,
//     brothers: 0,
//     sisters: 0,
//     grandsons: 0,
//     granddaughters: 0,
//     grandfather: 0,
//     grandmother: 0,
//     husband: 0,
//     wife: 0,
//     networth: 0,
//     will: 0,
//     //uuid: "",
//     User_idUser: 0,
//   });

//   // const [userInfo, setUserInfo] = useState({
//   //   idUser: 0,
//   //   uuid: "",
//   //   created_at: "",
//   // });

//   // Hook for navigation
//   const navigate = useNavigate();

//   const [result, setResult] = useState<string | null>(null);

//   // UUID for user
//   // Update this later to store in the database, and redirect to correct page
//   // useEffect(() => {
//   //   let userUUID = localStorage.getItem("userUUID");
//   //   if (!userUUID) {
//   //     userUUID = uuidv4();
//   //     localStorage.setItem("userUUID", userUUID);
//   //     console.log("Generated new UUID:", userUUID);

//   //     // Store the UUID in the database
//   //     axios
//   //       .post("http://localhost:5001/generate_user", { uuid: userUUID })
//   //       .then((response) => {
//   //         console.log(
//   //           "User UUID stored in the database.",
//   //           response.data.message
//   //         );
//   //       })
//   //       .catch((error) => {
//   //         console.error("Error storing user UUID:", error);
//   //       });
//   //   } else {
//   //     console.log("User UUID:", userUUID);
//   //   }
    
//   //   // Check if the user is already in local storage
//   //   const storedUserInfo = localStorage.getItem("userInfo");

//   //   if (storedUserInfo) {
//   //     console.log("Loaded user data from localStorage");
//   //     setUserInfo(JSON.parse(storedUserInfo)); // Load data from localStorage
//   //   } else {
//   //     // Fetch user data from the backend
//   //     axios.get(`http://localhost:5001/get_user/${userUUID}`)
//   //       .then(response => {
//   //         if (response.data.success) {
//   //           console.log("Retrieved User Data:", response.data.user_data);
  
//   //           // Store user data in localStorage
//   //           localStorage.setItem("userInfo", JSON.stringify(response.data.user_data));
  
//   //           // Update React state
//   //           setUserInfo(response.data.user_data);
//   //         } else {
//   //           console.warn("No user data found for UUID:", userUUID);
//   //         }
//   //       })
//   //       .catch(error => {
//   //         console.error("Error retrieving user data:", error);
//   //       });
//   //   }

//   //   // Retrieve the user UUID from DB
//   // //   axios
//   // //     .get(`http://localhost:5001/get_user/${userUUID}`)
//   // //     .then((response) => {
//   // //       if (response.data && response.data.user_data) {
//   // //         const userData = response.data.user_data;
//   // //         console.log("User data:", userData);

//   // //         setUserInfo(userData);
//   // //         console.log("User Data", userInfo);
//   // //         // Update formData with the user ID safely
//   // //         setFormData((prev) => ({
//   // //           ...prev,
//   // //           User_idUser: userData.idUser ?? 0, // Ensure idUser is set properly
//   // //         }));
//   // //       } else {
//   // //         console.warn("No user data returned from API");
//   // //       }
//   // //     })
//   // //     .catch((error) => {
//   // //       console.error("Error retrieving user data:", error);
//   // //     });
//   // // }, []);
//   //   axios
//   //     .get(`http://localhost:5001/get_user/${userUUID}`)
//   //     .then((response) => {
//   //       const userData = response.data;
//   //       console.log("User data const:", userData);

//   //       setUserInfo(userData);
//   //       console.log("User Info", userInfo);

//   //       // update the form data with the user ID
//   //       setFormData((prev) => ({
//   //         ...prev,
//   //         User_idUser: userData.id,
//   //       }));
//   //     })
//   //     .catch((error) => {
//   //       console.error("Error retrieving user data:", error);
//   //     });
//   // }, []);

//   // useEffect(() => {
//   //   let userUUID = localStorage.getItem("userUUID");
  
//   //   // If no UUID exists, generate one and store it
//   //   if (!userUUID) {
//   //     userUUID = uuidv4();
//   //     localStorage.setItem("userUUID", userUUID);
//   //     console.log("Generated new UUID:", userUUID);
  
//   //     // Store UUID in the backend
//   //     axios
//   //       .post("http://localhost:5001/generate_user", {
//   //         uuid: userUUID,
//   //       })
//   //       .then((response) => {
//   //         console.log("User UUID stored:", response.data.message);
//   //       })
//   //       .catch((error) => {
//   //         console.error("Error storing UUID:", error);
//   //       });
//   //   } else {
//   //     console.log("User UUID found:", userUUID);
//   //   }
  
//   //   // Check if user info is already in localStorage
//   //   const storedUserInfo = localStorage.getItem("userInfo");
  
//   //   if (storedUserInfo) {
//   //     console.log("Loaded user data from localStorage", storedUserInfo);
//   //     const parsedUserInfo = JSON.parse(storedUserInfo);

  
//   //     // Update state from localStorage
//   //     setUserInfo(parsedUserInfo);
//   //     console.log("User Info:", userInfo);
//   //     setFormData((prev) => ({
//   //       ...prev,
//   //       User_idUser: parsedUserInfo.idUser, // Ensure correct key
//   //     }));
//   //   } else {
//   //     // Fetch user data from the backend
//   //     axios
//   //       .get(`http://localhost:5001/get_user/${userUUID}`)
//   //       .then((response) => {
//   //         if (response.data.success) {
//   //           const userData = response.data;
//   //           console.log("Retrieved User Data:", userData);
  
//   //           // Store user data in localStorage
//   //           localStorage.setItem("userInfo", JSON.stringify(userData));
  
//   //           // Update state
//   //           setUserInfo(userData);
//   //           setFormData((prev) => ({
//   //             ...prev,
//   //             User_idUser: userData.idUser, // Ensure correct key
//   //           }));
//   //         } else {
//   //           console.warn("No user data found for UUID:", userUUID);
//   //         }
//   //       })
//   //       .catch((error) => {
//   //         console.error("Error retrieving user data:", error);
//   //       });
//   //   }
//   // }, []);

//   //-------------------------------------------------------------------------------- 
//   useEffect(() => {
//     let userUUID = localStorage.getItem("userUUID");
  
//     if (!userUUID) {
//       userUUID = uuidv4();
//       localStorage.setItem("userUUID", userUUID);
//       console.log("Generated new UUID:", userUUID);
  
//       // Store UUID in the backend
//       axios.post("http://localhost:5001/generate_user", { uuid: userUUID })
//         .then(response => {
//           console.log("User UUID stored:", response.data.message);
//         })
//         .catch(error => console.error("Error storing UUID:", error));
//     } else {
//       console.log("User UUID found:", userUUID);
//     }
  
//     // Check if user info is already in localStorage
//     const storedUserInfo = localStorage.getItem("userInfo");
  
//     if (storedUserInfo) {
//       console.log("Loaded user data from localStorage", storedUserInfo);
//       const parsedUserInfo = JSON.parse(storedUserInfo);
  
//       if (parsedUserInfo.success && parsedUserInfo.data) {
//         console.log("Parsed User Data:", parsedUserInfo.data);
  
//         // Correcting the structure when setting state
//         setUserInfo({
//           idUser: parsedUserInfo.data.UserID || 0,
//           uuid: parsedUserInfo.data.uuid || "",
//           created_at: parsedUserInfo.data.created_at || "", // Ensure it’s handled correctly
//         });
  
//         setFormData(prev => ({
//           ...prev,
//           User_idUser: parsedUserInfo.data.UserID || 0,
//         }));
//       } else {
//         console.warn("Invalid user data format in localStorage.");
//       }
//     } else {
//       // Fetch user data from backend if not in localStorage
//       axios.get(`http://localhost:5001/get_user/${userUUID}`)
//         .then(response => {
//           if (response.data.success) {
//             const userData = response.data.user_data;
//             console.log("Retrieved User Data from Backend:", userData);
  
//             // Store user data in localStorage
//             localStorage.setItem("userInfo", JSON.stringify({
//               success: true,
//               data: userData,
//             }));
  
//             // Set user info correctly
//             setUserInfo({
//               idUser: userData.UserID || 0,
//               uuid: userData.uuid || "",
//               created_at: userData.created_at || "",
//             });
  
//             setFormData(prev => ({
//               ...prev,
//               User_idUser: userData.UserID || 0,
//             }));
//           } else {
//             console.warn("No user data found for UUID:", userUUID);
//           }
//         })
//         .catch(error => console.error("Error retrieving user data:", error));
//     }
//   }, []);
//   // ---------------------------------------------------------------------------  
//   // Handle form input changes
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: Number(value),
//     }));
//   };

//   // Handle form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       console.log("Submitting Data:", formData);
//       // Store data into the database
//       await axios.post("http://localhost:5001/store_details", formData);

//       const response = await axios.post(
//         "http://localhost:5001/run_inheritance",
//         //"https://f21mp-misa.onrender.com/run_inheritance",
//         formData
//       );
//       const resultData = response.data.result;

//       //
//       // setResult(response.data.result);

//       // Navigate to the result page
//       navigate("/result", { state: { result: resultData } });
//     } catch (error) {
//       console.error("Error:", error);
//       setResult("Error calculating inheritance.");
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h2>Islamic Inheritance System</h2>
//       <form onSubmit={handleSubmit}>
//         <InputGroup
//           label="Father Alive (1/0)"
//           name="father"
//           value={formData.father}
//           onChange={handleChange}
//         />
//         <InputGroup
//           label="Mother Alive (1/0)"
//           name="mother"
//           value={formData.mother}
//           onChange={handleChange}
//         />
//         <InputGroup
//           label="Number of Sons"
//           name="sons"
//           value={formData.sons}
//           onChange={handleChange}
//         />
//         <InputGroup
//           label="Number of Daughters"
//           name="daughters"
//           value={formData.daughters}
//           onChange={handleChange}
//         />
//         <InputGroup
//           label="Number of Brothers"
//           name="brothers"
//           value={formData.brothers}
//           onChange={handleChange}
//         />
//         <InputGroup
//           label="Number of Sisters"
//           name="sisters"
//           value={formData.sisters}
//           onChange={handleChange}
//         />
//         <InputGroup
//           label="Number of Grandsons"
//           name="grandsons"
//           value={formData.grandsons}
//           onChange={handleChange}
//         />
//         <InputGroup
//           label="Number of Granddaughters"
//           name="granddaughters"
//           value={formData.granddaughters}
//           onChange={handleChange}
//         />
//         <InputGroup
//           label="Number of Grandfathers"
//           name="grandfather"
//           value={formData.grandfather}
//           onChange={handleChange}
//         />
//         <InputGroup
//           label="Number of Grandmothers"
//           name="grandmother"
//           value={formData.grandmother}
//           onChange={handleChange}
//         />
//         <InputGroup
//           label="Number of Husbands"
//           name="husband"
//           value={formData.husband}
//           onChange={handleChange}
//         />
//         <InputGroup
//           label="Number of Wives"
//           name="wife"
//           value={formData.wife}
//           onChange={handleChange}
//         />
//         <InputGroup
//           label="Net Worth"
//           name="networth"
//           value={formData.networth}
//           onChange={handleChange}
//         />
//         <InputGroup
//           label="Will (Wasiya Amount)"
//           name="will"
//           value={formData.will}
//           onChange={handleChange}
//         />
//         <button type="submit" className="btn btn-primary mt-3">
//           Calculate
//         </button>
//       </form>

//       {result && (
//         <div className="mt-3">
//           <h4>Results:</h4>
//           <pre>{result}</pre>
//         </div>
//       )}
//     </div>
//   );
// };

// const App: React.FC = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/result" element={<ResultsPage />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;

