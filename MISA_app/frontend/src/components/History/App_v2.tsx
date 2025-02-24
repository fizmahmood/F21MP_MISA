// import "bootstrap/dist/css/bootstrap.min.css";
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import InputGroup from "./components/InputGroup";
// import {
//   HashRouter as Router,
//   Routes,
//   Route,
//   useNavigate,
// } from "react-router-dom";
// import ResultsPage from "./components/ResultsPage";
// import { v4 as uuidv4 } from "uuid";

// const HomePage: React.FC = () => {
//   // Form state
//   const [formData, setFormData] = useState({
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
//     Users_iduser: 0, // Will be updated from localStorage or API
//   });

//   const navigate = useNavigate();
//   const [result, setResult] = useState<string | null>(null);

//   // ✅ **Refactored `useEffect`**
//   useEffect(() => {
//     let userUUID = localStorage.getItem("userUUID");

//     if (!userUUID) {
//       userUUID = uuidv4();
//       localStorage.setItem("userUUID", userUUID);
//       console.log("Generated new UUID:", userUUID);

//       // Store new user UUID in backend
//       axios.post("http://localhost:5001/generate_user", { uuid: userUUID })
//         .then(response => console.log("User UUID stored:", response.data.message))
//         .catch(error => console.error("Error storing UUID:", error));
//     } else {
//       console.log("User UUID found:", userUUID);
//     }

//     // ✅ Check if user info is in localStorage to avoid unnecessary API calls
//     const storedUserInfo = localStorage.getItem("userInfo");
//     if (storedUserInfo) {
//       const parsedUserInfo = JSON.parse(storedUserInfo);
//       console.log("Loaded user data from localStorage:", parsedUserInfo);
//       console.log("User ID:", parsedUserInfo.data.UserID);

//       setFormData(prev => ({
//         ...prev,
        
//         Users_iduser: parsedUserInfo.data.UserID || 0, // Ensure the correct key
//       }));
//     } else {
//       // Fetch from backend only if `userInfo` is missing
//       axios.get(`http://localhost:5001/get_user/${userUUID}`)
//         .then(response => {
//           if (response.data.success) {
//             const userData = response.data.user_data;
//             console.log("Retrieved User Data from Backend:", userData);

//             // Store in localStorage for future use
//             localStorage.setItem("userInfo", JSON.stringify(userData));

//             // Update formData
//             setFormData(prev => ({
//               ...prev,
//               Users_iduser: userData.UserID || 0,
//             }));
//           } else {
//             console.warn("No user data found for UUID:", userUUID);
//           }
//         })
//         .catch(error => console.error("Error retrieving user data:", error));
//     }
//   }, []);

//   // ✅ **Refactored Input Handling**
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: Number(value),
//     }));
//   };

//   // ✅ **Refactored Form Submission**
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
      
//       console.log("Submitting Data:", formData);

//       // ✅ Store data in the database
//       await axios.post("http://localhost:5001/store_details", formData);

//       // ✅ Run inheritance calculation
//       const response = await axios.post("http://localhost:5001/run_inheritance", formData);
//       const resultData = response.data.result;

//       // ✅ Navigate to results page with computed data
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
//         {/* ✅ Cleaned-up input fields */}
//         {["father", "mother", "sons", "daughters", "brothers", "sisters", "grandsons", "granddaughters",
//           "grandfather", "grandmother", "husband", "wife", "networth", "will"].map((field) => (
//           <InputGroup
//             key={field}
//             label={field.replace("_", " ")} // Formatting labels dynamically
//             name={field}
//             value={formData[field as keyof typeof formData]} // Type-safe dynamic access
//             onChange={handleChange}
//           />
//         ))}

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

// // ✅ **Refactored Router**
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