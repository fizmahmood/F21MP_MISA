import React, { useState, useEffect } from "react";
import { Form, Container, Row, Col, Button, Card } from "react-bootstrap";
import axios from "axios";
import useUserInfo from "../hooks/useUserInfo";
import { useNavigate } from "react-router-dom";

// ✅ Define the TypeScript interface for form data
interface FormData {
  gender: string;
  married: string;
  father: number;
  mother: number;
  sons: number;
  daughters: number;
  brothers: number;
  sisters: number;
  will_amount: number;
  networth: number;
  husband: number;
  wife: number;
  paternal_grandfather: number;
  paternal_grandmother: number;
  maternal_grandfather: number;
  maternal_grandmother: number;
  grandparents: string;
  Users_user_id: number;
  grandsons: number;
  granddaughters: number;
}

export default function InheritanceForm() {
  const [formData, setFormData] = useState<FormData>({
    gender: "",
    married: "",
    father: 0,
    mother: 0,
    sons: 0,
    daughters: 0,
    brothers: 0,
    sisters: 0,
    will_amount: 0,
    networth: 0,
    husband: 0,
    wife: 0,
    paternal_grandfather: 0,
    paternal_grandmother: 0,
    maternal_grandfather: 0,
    maternal_grandmother: 0,
    grandparents: "",
    Users_user_id: 0,
    grandsons: 0,
    granddaughters: 0,
  });

  const userInfo = useUserInfo();
  const navigate = useNavigate();

  //
  //   useEffect(() => {
  //     const userInfo = localStorage.getItem("userInfo");
  //     if (userInfo) {
  //       try {
  //         const parsedUserInfo = JSON.parse(userInfo);
  //         console.log("ParsedUserInfo without data", parsedUserInfo.user_id);
  //         console.log("ParsedUserInfo with data", parsedUserInfo.data.user_id);
  //         const user_id = parsedUserInfo.user_id || parsedUserInfo?.data?.user_id;
  // setFormData((prevFormData) => ({ ...prevFormData, Users_user_id: user_id }));
  //         if (parsedUserInfo.user_id) {
  //           setFormData((prev) => ({
  //             ...prev,
  //             Users_user_id: parsedUserInfo.user_id, // ✅ Set Users_user_id
  //           }));
  //         }
  //       } catch (error) {
  //         console.error("Error parsing userInfo from localStorage:", error);
  //       }
  //     }
  //   }, []);


  // useEffect(() => {
  //   const userInfo = localStorage.getItem("userInfo");

  //   if (userInfo) {
  //     try {
  //       const parsedUserInfo = JSON.parse(userInfo);
  //       console.log("ParsedUserInfo:", parsedUserInfo);

  //       // ✅ Handle both cases: Directly stored or nested inside 'data'
  //       const user_id = parsedUserInfo.user_id || parsedUserInfo?.data?.user_id;

  //       if (user_id) {
  //         setFormData((prev) => ({
  //           ...prev,
  //           Users_user_id: user_id, // ✅ Set Users_user_id correctly
  //         }));
  //       } else {
  //         console.warn("Warning: 'user_id' not found in 'userInfo'");
  //       }
  //     } catch (error) {
  //       console.error("Error parsing userInfo from localStorage:", error);
  //     }
  //   } else {
  //     console.warn("Warning: No 'userInfo' found in localStorage");
  //   }
  // }, []);

  useEffect(() => {
    if (userInfo) {
      setFormData((prev) => ({
        ...prev,
        Users_user_id: userInfo.user_id, // ✅ Set Users_user_id correctly
      }));
    }
  }, [userInfo]); 

  // ✅ Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      let updatedValue;

      if (type === "checkbox") {
        // ✅ Convert checkboxes to 1 (checked) or 0 (unchecked)
        updatedValue = checked ? 1 : 0;
      } else if (
        [
          "father",
          "mother",
          "sons",
          "daughters",
          "brothers",
          "sisters",
          "networth",
          "will_amount",
          "husband",
          "wife",
          "paternal_grandfather",
          "paternal_grandmother",
          "maternal_grandfather",
          "maternal_grandmother",
          "grandsons",
          "granddaughters",

        ].includes(name)
      ) {
        // ✅ Convert numeric input fields to numbers
        updatedValue = value === "" ? 0 : Number(value);
      } else {
        // ✅ Keep other values as strings
        updatedValue = value;
      }

      return {
        ...prev,
        [name]: updatedValue,
      };
    });
  };

  useEffect(() => {
    if (formData.married === "Yes" && formData.gender === "Male") {
      setFormData((prev) => ({
        ...prev,
        wife: 1, // ✅ Automatically set wife = 1 if male and married
      }));
    } 
    else if(formData.married === "Yes" && formData.gender === "Female") {
      setFormData((prev) => ({
        ...prev,
        husband: 1, // 
      }));
    } 
    else if (formData.gender === "Male") {
      setFormData((prev) => ({
        ...prev,
        wife: 0, // Reset wife field if conditions are not met
      }));
    }
    else if (formData.gender === "Female") {
      setFormData((prev) => ({
        ...prev,
        husband: 0, 
      }));
    }

  }, [formData.married, formData.gender]); // ✅ Runs when married or gender changes

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("✅ Form Data:", formData);
    try {
      console.log("Submitting Data:", formData);

      // ✅ Store data in the database
      await axios.post("http://localhost:5001/store_details", formData);

      // // ✅ Run inheritance calculation
      // const response = await axios.post(
      //   "http://localhost:5001/run_inheritance",
      //   formData
      // );
      // const resultData = response.data.result;

      // ✅ Navigate to results page with computed data
      // navigate("/result", { state: { result: resultData } });
      navigate("/home");
    } catch (error) {
      console.error("Error:", error);
      // setResult("Error calculating inheritance.");
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-4 shadow-lg">
            <h2 className="text-center mb-4">Inheritance Information Form</h2>
            <Form onSubmit={handleSubmit}>
              {/* 🔹 Gender & Married Card */}
              <Card className="mb-3">
                <Card.Body>
                  <h5>Personal Information</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Label>Gender:</Form.Label>
                      <div className="d-flex">
                        <Form.Check inline type="radio" label="Male" name="gender" value="Male" onChange={handleChange} required />
                        <Form.Check inline type="radio" label="Female" name="gender" value="Female" onChange={handleChange} required />
                      </div>
                    </Col>
                    <Col md={6}>
                      <Form.Label>Are you Married?</Form.Label>
                      <div className="d-flex">
                        <Form.Check inline type="radio" label="Yes" name="married" value="Yes" onChange={handleChange} required />
                        <Form.Check inline type="radio" label="No" name="married" value="No" onChange={handleChange} required />
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* 🔹 Parents & Grandparents Card */}
              <Card className="mb-3">
                <Card.Body>
                  <h5>Family Information</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Label>Is Father Alive?</Form.Label>
                      <div className="d-flex">
                        <Form.Check inline type="radio" label="Yes" name="father" value="1" onChange={handleChange} required />
                        <Form.Check inline type="radio" label="No" name="father" value="0" onChange={handleChange} required />
                      </div>
                    </Col>
                    <Col md={6}>
                      <Form.Label>Is Mother Alive?</Form.Label>
                      <div className="d-flex">
                        <Form.Check inline type="radio" label="Yes" name="mother" value="1" onChange={handleChange} required />
                        <Form.Check inline type="radio" label="No" name="mother" value="0" onChange={handleChange} required />
                      </div>
                    </Col>
                  </Row>
                  <Row>
                              {/* Grandparents Selection */}
              <Form.Group>
                <Form.Label>Do you have grandparents?</Form.Label>
                <Form.Check
                  type="radio"
                  label="Yes"
                  name="grandparents"
                  value="Yes"
                  onChange={handleChange}
                  required
                />
                <Form.Check
                  type="radio"
                  label="No"
                  name="grandparents"
                  value="No"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {formData.grandparents === "Yes" && (
                <Form.Group>
                  <Form.Label className="d-block text-center fw-bold">
                    Select the ones that are alive
                  </Form.Label>
                  <Row>
                    {/* Paternal Side */}
                    <Col md={6} className="border p-3">
                      <h5 className="text-center">Father's Side</h5>
                      <Form.Check
                        type="checkbox"
                        label="Paternal Grandfather"
                        name="paternal_grandfather"
                        checked={formData.paternal_grandfather === 1}
                        onChange={handleChange}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Paternal Grandmother"
                        name="paternal_grandmother"
                        checked={formData.paternal_grandmother === 1}
                        onChange={handleChange}
                      />
                    </Col>

                    {/* Maternal Side */}
                    <Col md={6} className="border p-3">
                      <h5 className="text-center">Mother's Side</h5>
                      <Form.Check
                        type="checkbox"
                        label="Maternal Grandfather"
                        name="maternal_grandfather"
                        checked={formData.maternal_grandfather === 1}
                        onChange={handleChange}
                      />
                      <Form.Check
                        type="checkbox"
                        label="Maternal Grandmother"
                        name="maternal_grandmother"
                        checked={formData.maternal_grandmother === 1}
                        onChange={handleChange}
                      />
                    </Col>
                  </Row>
                </Form.Group>
              )}
                  </Row>
                </Card.Body>
              </Card>

              {/* 🔹 Siblings Inputs Side-by-Side */}
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Number of Brothers:</Form.Label>
                    <Form.Control type="number" name="brothers" min="0" max="99" value={formData.brothers} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Number of Sisters:</Form.Label>
                    <Form.Control type="number" name="sisters" min="0" max="99" value={formData.sisters} onChange={handleChange} required />
                  </Form.Group>
                </Col>
              </Row>

              {/* 🔹 Net Worth & Will Amount */}
              <Form.Group className="mt-3">
                <Form.Label>Net Worth ($):</Form.Label>
                <Form.Control type="number" name="networth" min="0" value={formData.networth} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Will Amount ($):</Form.Label>
                <Form.Control type="number" name="will_amount" min="0" value={formData.will_amount} onChange={handleChange} required />
              </Form.Group>

              {/* Submit Button */}
              <Button type="submit" className="btn btn-primary w-100 mt-3">
                Save
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>


    // <Container
    //   fluid
    //   className="vh-100 d-flex align-items-center justify-content-center"
    // >
    //   <Row className="w-100">
    //     <Col md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
    //       <div className="p-4 border rounded bg-light">
    //         <h2 className="text-center">Inheritance Information Form</h2>
    //         <Form onSubmit={handleSubmit}>
    //           {/* Gender */}
    //           <Form.Group>
    //             <Form.Label>Gender:</Form.Label>
    //             <Form.Check
    //               type="radio"
    //               label="Male"
    //               name="gender"
    //               value="Male"
    //               onChange={handleChange}
    //               required
    //             />
    //             <Form.Check
    //               type="radio"
    //               label="Female"
    //               name="gender"
    //               value="Female"
    //               onChange={handleChange}
    //               required
    //             />
    //           </Form.Group>

    //           {/* Married */}
    //           <Form.Group>
    //             <Form.Label>Are you Married?</Form.Label>
    //             <Form.Check
    //               type="radio"
    //               label="Yes"
    //               name="married"
    //               value="Yes"
    //               onChange={handleChange}
    //               required
    //             />
    //             <Form.Check
    //               type="radio"
    //               label="No"
    //               name="married"
    //               value="No"
    //               onChange={handleChange}
    //               required
    //             />
    //           </Form.Group>
              
    //           {/* Parents */}
    //           <Form.Group>
    //             <Form.Label>Is Father Alive?</Form.Label>
    //             <Form.Check
    //               type="radio"
    //               label="Yes"
    //               name="father"
    //               value="1"
    //               onChange={handleChange}
    //               required
    //             />
    //             <Form.Check
    //               type="radio"
    //               label="No"
    //               name="father"
    //               value="0"
    //               onChange={handleChange}
    //               required
    //             />
    //           </Form.Group>

    //           <Form.Group>
    //             <Form.Label>Is Mother Alive?</Form.Label>
    //             <Form.Check
    //               type="radio"
    //               label="Yes"
    //               name="mother"
    //               value="1"
    //               onChange={handleChange}
    //               required
    //             />
    //             <Form.Check
    //               type="radio"
    //               label="No"
    //               name="mother"
    //               value="0"
    //               onChange={handleChange}
    //               required
    //             />
    //           </Form.Group>

              // {/* Grandparents Selection */}
              // <Form.Group>
              //   <Form.Label>Do you have grandparents?</Form.Label>
              //   <Form.Check
              //     type="radio"
              //     label="Yes"
              //     name="grandparents"
              //     value="Yes"
              //     onChange={handleChange}
              //     required
              //   />
              //   <Form.Check
              //     type="radio"
              //     label="No"
              //     name="grandparents"
              //     value="No"
              //     onChange={handleChange}
              //     required
              //   />
              // </Form.Group>

              // {formData.grandparents === "Yes" && (
              //   <Form.Group>
              //     <Form.Label className="d-block text-center fw-bold">
              //       Select the ones that are alive
              //     </Form.Label>
              //     <Row>
              //       {/* Paternal Side */}
              //       <Col md={6} className="border p-3">
              //         <h5 className="text-center">Father's Side</h5>
              //         <Form.Check
              //           type="checkbox"
              //           label="Paternal Grandfather"
              //           name="paternal_grandfather"
              //           checked={formData.paternal_grandfather === 1}
              //           onChange={handleChange}
              //         />
              //         <Form.Check
              //           type="checkbox"
              //           label="Paternal Grandmother"
              //           name="paternal_grandmother"
              //           checked={formData.paternal_grandmother === 1}
              //           onChange={handleChange}
              //         />
              //       </Col>

              //       {/* Maternal Side */}
              //       <Col md={6} className="border p-3">
              //         <h5 className="text-center">Mother's Side</h5>
              //         <Form.Check
              //           type="checkbox"
              //           label="Maternal Grandfather"
              //           name="maternal_grandfather"
              //           checked={formData.maternal_grandfather === 1}
              //           onChange={handleChange}
              //         />
              //         <Form.Check
              //           type="checkbox"
              //           label="Maternal Grandmother"
              //           name="maternal_grandmother"
              //           checked={formData.maternal_grandmother === 1}
              //           onChange={handleChange}
              //         />
              //       </Col>
              //     </Row>
              //   </Form.Group>
              // )}

    //           {/* Number Inputs */}
    //           {formData.married === "Yes" && (
    //             <>
    //               <Form.Group>
    //                 <Form.Label>Number of Sons:</Form.Label>
    //                 <Form.Control
    //                   type="number"
    //                   name="sons"
    //                   min="0"
    //                   value={formData.sons}
    //                   onChange={handleChange}
    //                   required
    //                 />
    //               </Form.Group>

    //               <Form.Group>
    //                 <Form.Label>Number of Daughters:</Form.Label>
    //                 <Form.Control
    //                   type="number"
    //                   name="daughters"
    //                   min="0"
    //                   value={formData.daughters}
    //                   onChange={handleChange}
    //                   required
    //                 />
    //               </Form.Group>
    //             </>
    //           )}

    //           <Form.Group>
    //             <Form.Label>Number of Brothers:</Form.Label>
    //             <Form.Control
    //               type="number"
    //               name="brothers"
    //               min="0"
    //               value={formData.brothers}
    //               onChange={handleChange}
    //               required
    //             />
    //           </Form.Group>

    //           <Form.Group>
    //             <Form.Label>Number of Sisters:</Form.Label>
    //             <Form.Control
    //               type="number"
    //               name="sisters"
    //               min="0"
    //               value={formData.sisters}
    //               onChange={handleChange}
    //               required
    //             />
    //           </Form.Group>

    //           <Form.Group>
    //             <Form.Label>Net Worth</Form.Label>
    //             <Form.Control
    //               type="number"
    //               name="networth"
    //               min="0"
    //               value={formData.networth}
    //               onChange={handleChange}
    //               required
    //             />
    //           </Form.Group>

    //           {/* Submit Button */}
    //           <Button type="submit" className="btn btn-primary w-100 mt-3">
    //             Save
    //           </Button>
    //         </Form>
    //       </div>
    //     </Col>
    //   </Row>
    // </Container>
  );
}

// import React, { useState } from "react";
// import { Form } from "react-bootstrap";

// // Define the type for form data
// interface FormData {
//   grandparents: string;
//   gender: string;
//   married: string;
//   father: number;
//   mother: number;
//   sons: number;
//   daughters: number;
//   brothers: number;
//   sisters: number;
//   will_amount: number;
//   networth: number;
//   husband: number;
//   wife: number;
//   paternal_grandfather: number;
//   paternal_grandmother: number;
//   maternal_grandfather: number;
//   maternal_grandmother: number;
// }

// export default function InheritanceForm() {
//   const [formData, setFormData] = useState<FormData>({
//     gender: "",
//     married: "",
//     father: 0,
//     mother: 0,
//     sons: 0,
//     daughters: 0,
//     brothers: 0,
//     sisters: 0,
//     will_amount: 0,
//     networth: 0,
//     husband: 0,
//     wife: 0,
//     paternal_grandfather: 0,
//     paternal_grandmother: 0,
//     maternal_grandfather: 0,
//     maternal_grandmother: 0,
//     grandparents: "",
//   });

//   // Handle input changes
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;

//     // Define fields that should be numbers
//     const numericFields = [
//       "father",
//       "mother",
//       "sons",
//       "daughters",
//       "brothers",
//       "sisters",
//     ];

//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: numericFields.includes(name) ? Number(value) : value, // Convert only numeric fields
//     }));
//   };

//   // Handle form submission
//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     console.log("Form Data:", formData);
//   };

//   return (
//     <div className="container mt-4">
//       <h2>Inheritance Information Form</h2>
//       <Form onSubmit={handleSubmit}>
//         {/* Gender */}
//         <Form.Group>
//           <Form.Label>Gender:</Form.Label>
//           <Form.Check
//             type="radio"
//             label="Male"
//             name="gender"
//             value="Male"
//             onChange={handleChange}
//             required
//           />
//           <Form.Check
//             type="radio"
//             label="Female"
//             name="gender"
//             value="Female"
//             onChange={handleChange}
//             required
//           />
//         </Form.Group>

//         {/* Is Father Alive */}
//         <Form.Group>
//           <Form.Label>Is Father Alive?</Form.Label>
//           <Form.Check
//             type="radio"
//             label="Yes"
//             name="father"
//             value="1"
//             onChange={handleChange}
//             required
//           />
//           <Form.Check
//             type="radio"
//             label="No"
//             name="father"
//             value="0"
//             onChange={handleChange}
//             required
//           />
//         </Form.Group>

//         {/* Is Mother Alive */}
//         <Form.Group>
//           <Form.Label>Is Mother Alive?</Form.Label>
//           <Form.Check
//             type="radio"
//             label="Yes"
//             name="mother"
//             value="1"
//             onChange={handleChange}
//             required
//           />
//           <Form.Check
//             type="radio"
//             label="No"
//             name="mother"
//             value="0"
//             onChange={handleChange}
//             required
//           />
//         </Form.Group>
//         <Form.Group>
//           <Form.Label>Do you have grandparents?</Form.Label>
//           <Form.Check
//             type="radio"
//             label="Yes"
//             name="grandparents"
//             value="Yes"
//             onChange={handleChange}
//             required
//           />
//           <Form.Check
//             type="radio"
//             label="No"
//             name="grandparents"
//             value="No"
//             onChange={handleChange}
//             required
//           />
//         </Form.Group>
//         {formData.grandparents === "Yes" && (
//           <Form.Group>
//           <Form.Label>Select the ones that are alive</Form.Label>
//           <Form.Check
//             type="checkbox"
//             label="Paternal Grandfather"
//             name="paternal_grandfather"
//             checked={formData.paternal_grandfather === 1}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 paternal_grandfather: e.target.checked ? 1 : 0,
//               }))
//             }
//           />
//           <Form.Check
//             type="checkbox"
//             label="Paternal Grandmother"
//             name="paternal_grandmother"
//             checked={formData.paternal_grandmother === 1}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 paternal_grandmother: e.target.checked ? 1 : 0,
//               }))
//             }
//           />
//           <Form.Check
//             type="checkbox"
//             label="Maternal Grandfather"
//             name="maternal_grandfather"
//             checked={formData.maternal_grandfather === 1}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 maternal_grandfather: e.target.checked ? 1 : 0,
//               }))
//             }
//           />
//           <Form.Check
//             type="checkbox"
//             label="Maternal Grandmother"
//             name="maternal_grandmother"
//             checked={formData.maternal_grandmother === 1}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 maternal_grandmother: e.target.checked ? 1 : 0,
//               }))
//             }
//           />
//         </Form.Group>)}
//         {/* Are You Married */}
//         <Form.Group>
//           <Form.Label>Are you Married?</Form.Label>
//           <Form.Check
//             type="radio"
//             label="Yes"
//             name="married"
//             value="Yes"
//             onChange={handleChange}
//             required
//           />
//           <Form.Check
//             type="radio"
//             label="No"
//             name="married"
//             value="No"
//             onChange={handleChange}
//             required
//           />
//         </Form.Group>

//         {/* Number Inputs */}
//         {/* Conditionally Render Sons and Daughters if Married is "Yes" */}
//         {formData.married === "Yes" && (
//           <>
//             <Form.Group>
//               <Form.Label>Number of Sons:</Form.Label>
//               <Form.Control
//                 type="number"
//                 name="sons"
//                 min="0"
//                 value={formData.sons}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>

//             <Form.Group>
//               <Form.Label>Number of Daughters:</Form.Label>
//               <Form.Control
//                 type="number"
//                 name="daughters"
//                 min="0"
//                 value={formData.daughters}
//                 onChange={handleChange}
//                 required
//               />
//             </Form.Group>
//           </>
//         )}

//         <Form.Group>
//           <Form.Label>Number of Brothers:</Form.Label>
//           <Form.Control
//             type="number"
//             name="brothers"
//             min="0"
//             value={formData.brothers}
//             onChange={handleChange}
//             required
//           />
//         </Form.Group>

//         <Form.Group>
//           <Form.Label>Number of Sisters:</Form.Label>
//           <Form.Control
//             type="number"
//             name="sisters"
//             min="0"
//             value={formData.sisters}
//             onChange={handleChange}
//             required
//           />
//         </Form.Group>
//         <button type="submit">Save</button>
//       </Form>
//     </div>
//   );
// }
