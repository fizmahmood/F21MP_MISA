// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../api/api";
// import useFacts from "../hooks/useFacts";
// import { Container, Card, Button, Form, Spinner, } from "react-bootstrap";

// interface UserFacts {
//   father: number;
//   mother: number;
//   brothers: number;
//   sisters: number;
//   husband: number;
//   wife: number;
//   sons: number;
//   daughters: number;
//   grandsons: number;
//   granddaughters: number;
//   paternal_grandfather: number;
//   paternal_grandmother: number;
//   maternal_grandfather: number;
//   maternal_grandmother: number;
//   will_amount: number;
//   networth: number;
//   Users_user_id: number;
//   facts_id: number;
// }

// const EditableForm: React.FC = () => {
//   const [userFacts, setUserFacts] = useState<UserFacts | null>(null);
//   const [isEditing, setIsEditing] = useState<boolean>(false);
//   const [formData, setFormData] = useState<UserFacts | null>(null);
//   const [userId, setUserId] = useState<number | null>(null);
//   // Set dark mode to true by default
//   const [darkMode] = useState<boolean>(true);
//   const [errors, setErrors] = useState<Record<string, string>>({}); // Validation errors
//   const navigate = useNavigate();

//   // Fields that can only be 0 or 1
//   const binaryFields = ["father", "mother", "paternal_grandfather", "paternal_grandmother", "husband", "wife"];

//   // Fields with a limit of 0 - 99 
//   const maxFields = ["brothers", "sisters", "sons", "daughters", "grandsons", "granddaughters"];

//   // Retrieve user ID from localStorage
//   useEffect(() => {
//     const storedUserInfo = localStorage.getItem("userInfo");
//     if (storedUserInfo) {
//       try {
//         const parsedUserInfo = JSON.parse(storedUserInfo);
//         if (parsedUserInfo.user_id) {
//           setUserId(parsedUserInfo.user_id);
//         } else {
//           console.error("❌ User ID not found in localStorage");
//         }
//       } catch (error) {
//         console.error("❌ Error parsing userInfo from localStorage:", error);
//       }
//     }
//     else{navigate("/welcome")}
//   }, []);

//   // Fetch user facts when userId is set
//   const { facts, loading } = useFacts(userId ?? null);

//   useEffect(() => {
//     if (facts) {
//       console.log("✅ Setting user facts:", facts);
//       setFormData(facts);
//       setUserFacts(facts);
//     }
//   }, [facts]);

//   // Format number with thousand separator
//   const formatNumber = (num: number) => num.toLocaleString();

//   // Handle input validation
//   const validateInput = (name: string, value: number) => {
//     let errorMessage = "";

//     if (binaryFields.includes(name) && ![0, 1].includes(value)) {
//       errorMessage = "Must be 0 or 1";
//     } 
//     else if (maxFields.includes(name) && value > 99) {
//       errorMessage = "Cannot exceed 99";
//     }
//     else if (value < 0) {
//       errorMessage = "Cannot be negative";
//     }

//     setErrors((prevErrors) => ({
//       ...prevErrors,
//       [name]: errorMessage,
//     }));

//     return errorMessage === ""; // Return true if no error
//   };

//   // Cross-field validation for spouse fields:
//   // If both husband and wife are greater than 0, set an error for both.
//   useEffect(() => {
//     if (formData && formData.husband > 0 && formData.wife > 0) {
//       setErrors((prevErrors) => ({
//         ...prevErrors,
//         husband: "Only one spouse can be selected",
//         wife: "Only one spouse can be selected",
//       }));
//     } else {
//       // Clear spouse-related errors if the condition is not met
//       setErrors((prevErrors) => {
//         const { husband, wife, ...rest } = prevErrors;
//         return rest;
//       });
//     }
//   }, [formData?.husband, formData?.wife]);

//   // Handle input changes
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!formData) return;
//     const { name, value } = e.target;
//     const numericValue = Number(value);

//     // Validate input before updating state
//     if (validateInput(name, numericValue)) {
//       setFormData({
//         ...formData,
//         [name]: numericValue,
//       });
//     }
//   };

//   // Check if form has errors before submitting
//   const hasErrors = () => Object.values(errors).some((error) => error !== "");

//   // Handle form submission
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData || !userId || hasErrors()) return;

//     api
//       .put(`/update_facts/${userId}`, formData)
//       .then((response) => {
//         if (response.data.success) {
//           setUserFacts(formData);
//           setIsEditing(false);
//           alert("✅ Data updated successfully!");
//         } else {
//           alert("❌ Failed to update data.");
//         }
//       })
//       .catch((error) => {
//         console.error("❌ Error updating user facts:", error);
//       });
//   };

//   if (loading)
//     return (
//       <div className="text-center mt-4">
//         <Spinner animation="border" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </Spinner>
//       </div>
//     );

//   if (!userId) return <p className="text-danger text-center">❌ Error: User ID not found in localStorage.</p>;
//   if (!userFacts) return <p className="text-warning text-center">⚠️ No data found for this user.</p>;

//   return (
//     <div className={darkMode ? "dark-mode" : "light-mode"}>
//       <Container className="mt-5">
//         <Card className="shadow-lg">
//           <Card.Header><h2>User Information</h2></Card.Header>
//           <Card.Body>
//             <p>Family information can be updated here, you can add more family memebers such as grandparents and grandchildren here.
//             </p>
//           </Card.Body>
//         </Card>
//       </Container>
//       <Container className="mt-5">
//         <Card className={`shadow ${darkMode ? "bg-dark text-light" : "bg-light text-dark"}`}>
//           <Card.Header className="d-flex justify-content-between align-items-center">
          
//             {/* Dark mode toggle button removed */}
//           </Card.Header>

//           <Card.Body>
//             {isEditing ? (
//               <Form onSubmit={handleSubmit}>
//                 {Object.keys(userFacts)
//                   .filter((key) => key !== "facts_id") // Exclude facts_id from being displayed
//                   .map((key) =>
//                     key !== "Users_user_id" ? (
//                       <Form.Group className="mb-3" key={key}>
//                         <Form.Label>{key.replace(/_/g, " ")}:</Form.Label>
//                         <Form.Control
//                           type="number"
//                           name={key}
//                           value={formData ? formData[key as keyof UserFacts] : ""}
//                           onChange={handleChange}
//                           className={`text-center ${errors[key] ? "is-invalid" : ""}`}
//                         />
//                         {errors[key] && <div className="text-danger">{errors[key]}</div>}
//                       </Form.Group>
//                     ) : null
//                   )}
//                 <div className="d-flex justify-content-end">
//                   <Button variant="success" type="submit" className="me-2" disabled={hasErrors()}>
//                     Save Changes
//                   </Button>
//                   <Button variant="secondary" onClick={() => setIsEditing(false)}>
//                     Cancel
//                   </Button>
//                 </div>
//               </Form>
//             ) : (
//               <div>
//                 {Object.entries(userFacts)
//                   .filter(([key]) => key !== "facts_id") // Exclude facts_id from being displayed
//                   .map(([key, value]) =>
//                     key !== "Users_user_id" ? (
//                       <p key={key}>
//                         <strong>{key.replace(/_/g, " ")}:</strong> {formatNumber(value as number)}
//                       </p>
//                     ) : null
//                   )}
//                 <div className="d-flex justify-content-end">
//                   <Button variant="primary" onClick={() => setIsEditing(true)}>
//                     Edit
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </Card.Body>
//         </Card>
//       </Container>
//     </div>
//   );
// };

// export default EditableForm;