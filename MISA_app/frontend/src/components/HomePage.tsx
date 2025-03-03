// import React, { useEffect, useState } from "react";
// import { api } from "../api/api";
// import { useNavigate } from "react-router-dom";
// import useFacts from "../hooks/useFacts";

// const HomePage: React.FC = () => {
//   const navigate = useNavigate();

//   const [user, setUser] = useState<{
//     user_id: number;
//     facts_id: number;
//     uuid: string;
//   } | null>(null);

//   const [systemName, setSystemName] = useState<{
//     idInheritanceSystem: number;
//     system_name: string;
//   } | null>(null);

//   // ✅ Retrieve user from localStorage BEFORE running `useFacts`
//   useEffect(() => {
//     const storedUserInfo = localStorage.getItem("userInfo");
//     const storedFactId = localStorage.getItem("facts_id");

//     console.log("📝 Retrieved from localStorage:", storedUserInfo, storedFactId);

//     if (storedUserInfo && storedFactId) {
//       try {
//         const parsedUserInfo = JSON.parse(storedUserInfo);
//         if (parsedUserInfo.user_id) {
//           setUser({
//             user_id: parsedUserInfo.user_id,
//             facts_id: parseInt(storedFactId),
//             uuid: parsedUserInfo.uuid,
//           });
//           console.log("✅ User set:", parsedUserInfo);
//         } else {
//           console.error("❌ User ID not found in localStorage data.");
//         }
//       } catch (error) {
//         console.error("❌ Error parsing userInfo from localStorage:", error);
//       }
//     } else {
//       console.warn("⚠️ User info or facts_id missing from localStorage.");
      
//     }
//   }, []);

  

//   // ✅ Only run `useFacts` once `user` is available
//   const { facts, loading, error } = useFacts(user?.user_id ? user.user_id : null);

//   // ✅ Log when `useFacts` updates
//   useEffect(() => {
//     console.log("🔥 useFacts Hook Triggered!");
//     console.log("User ID:", user?.user_id);
//     console.log("Loading State:", loading);
//     console.log("Error State:", error);
//     console.log("Fetched Facts Data:", facts);
//   }, [facts, loading, error]);

//   useEffect(() => {
//     if (!systemName || !user) return;

//     api
//       .post("http://localhost:5001/share_inheritance", {
//         user_id: user.user_id,
//         system_name: systemName.system_name,
//         InheritanceSystem_id: systemName.idInheritanceSystem,
//         Facts_id: user.facts_id, 
//       })
//       .then((response) => {
//         if (response.data.success) {
//           console.log(
//             `✅ Inheritance shared successfully for ${systemName.system_name}:`,
//             response.data
//           );
//           // navigate("/result",{state: {result: response.data.json_result}});
//         } else {
//           console.error(
//             `❌ Failed to share inheritance for ${systemName.system_name}:`,
//             response
//           );
//         }
//       })
//       .catch((error) => {
//         console.error(`❌ Error sharing inheritance for ${systemName.system_name}:`, error);
//       });
//   }, [systemName, user]);

//   const handleGenerateResults = async (selectedSystem: string) => {
//     if (!user) {
//       console.error("❌ User data not available.");
//       return;
//     }

//     try {
//       const sysResponse = await api.get("/get_system", {
//         params: { system_name: selectedSystem },
//       });

//       if (!sysResponse.data.success) {
//         console.error("❌ System details not found:", sysResponse.data);
//         return;
//       }

//       const systemData = sysResponse.data.system;
//       console.log("✅ Fetched system details:", systemData);

//       setSystemName({
//         idInheritanceSystem: systemData.idInheritanceSystem,
//         system_name: systemData.system_name,
//       });

//       const response = await api.post("/share_inheritance", {
//         user_id: user.user_id,
//         system_name: systemName?.system_name,
//         Facts_id: user.facts_id,
//         InheritanceSystem_id: systemName?.idInheritanceSystem,
//       });

//       if (response.data.success) {
//         console.log(
//           `✅ Inheritance shared successfully for ${selectedSystem}:`,
//           response.data
//         );

//         navigate("/result", {
//           state: {
//             result: response.data.json_result,
//             details: response.data.results_for_db,
//           },
//         });
//       } else {
//         console.error(
//           `❌ Failed to share inheritance for ${selectedSystem}:`,
//           response
//         );
//       }
//     } catch (error) {
//       console.error(
//         `❌ Error fetching system details or sharing inheritance:`,
//         error
//       );
//     }
//   };

//   return (
//     <>
//       <nav className="navbar navbar-expand-lg bg-body-tertiary">
//         <div className="container-fluid">
//           <a className="navbar-brand" href="#">Navbar</a>
//           <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
//             <span className="navbar-toggler-icon"></span>
//           </button>
//           <div className="collapse navbar-collapse" id="navbarNav">
//             <ul className="navbar-nav">
//               <li className="nav-item"><a className="nav-link active" href="#">Home</a></li>
//             </ul>
//           </div>
//         </div>
//       </nav>

//       <div className="row">
//         <div className="col-sm-6 mb-3 mb-sm-0">
//           <div className="card">
//             <div className="card-body">
//               <h5 className="card-title">Islamic Inheritance System</h5>
//               <p className="card-text">This system calculates inheritance using Islamic rules.</p>
//               <button onClick={() => handleGenerateResults("Islamic Inheritance")} className="btn btn-primary">
//                 Generate results
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="col-sm-6">
//           <div className="card">
//             <div className="card-body">
//               <h5 className="card-title">Hindu Inheritance System</h5>
//               <p className="card-text">This system calculates inheritance using Hindu rules.</p>
//               <button onClick={() => handleGenerateResults("Hindu Inheritance")} className="btn btn-primary">
//                 Generate results
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ✅ Display Facts Data */}
//       {loading ? (
//         <p>Loading facts...</p>
//       ) : error ? (
//         <p>Error fetching facts: {error}</p>
//       ) : (
//         facts && (
//           <div className="mt-4">
//             <h3>User Facts</h3>
//             <table className="table table-bordered">
//               <thead>
//                 <tr>
//                   <th>Attribute</th>
//                   <th>Value</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {Object.entries(facts).map(([key, value], idx) => (
//                   <tr key={idx}>
//                     <td>{key.replace(/_/g, " ")}</td>
//                     <td>{value}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )
//       )}
//     </>
//   );
// };

// export default HomePage;