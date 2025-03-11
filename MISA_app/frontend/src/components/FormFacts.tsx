import React, { useState, useEffect } from "react";
import {
  Form,
  Container,
  Row,
  Col,
  Button,
  Card,
  CardBody,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
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
  children: string;
}

export default function InheritanceForm() {
  const [formData, setFormData] = useState<FormData>({
    gender: "",
    married: "",
    children: "",
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

  const [errors, setErrors] = useState<Record<string, string>>({}); // Validation errors
  const userInfo = useUserInfo();
  const navigate = useNavigate();

  // ✅ Validation Rules
  const maxFields = ["brothers", "sisters", "sons", "daughters", "grandsons", "granddaughters"];
  const moneyFields = ["networth", "will_amount"];
  const binaryFields = ["father", "mother", "husband", "wife", "paternal_grandfather", "paternal_grandmother", "maternal_grandfather", "maternal_grandmother"];

  // ✅ Function to render tooltips
  const renderTooltip = (message: string) => <Tooltip id="tooltip">{message}</Tooltip>;

  // ✅ Set `Users_user_id` when user info is loaded
  useEffect(() => {
    if (userInfo) {
      setFormData((prev) => ({
        ...prev,
        Users_user_id: userInfo.user_id, // ✅ Ensures correct user ID
      }));
    }
  }, [userInfo]);

  // ✅ Auto-set Wife/Husband when Gender & Marriage status change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      wife: prev.gender === "Male" && prev.married === "Yes" ? 1 : 0,
      husband: prev.gender === "Female" && prev.married === "Yes" ? 1 : 0,
    }));
  }, [formData.gender, formData.married]);

  // ✅ Validate input before updating state
  const validateInput = (name: string, value: number) => {
    let errorMessage = "";

    if (binaryFields.includes(name) && ![0, 1].includes(value)) {
      errorMessage = "Must be 0 or 1";
    } else if (maxFields.includes(name) && (value < 0 || value > 31 )) {
      errorMessage = "Must be between 0 and 30";
    } else if (moneyFields.includes(name) && value < 0 || value > 9999999999) {
      errorMessage = "Max value is 9,999,999,999";
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));

    return errorMessage === ""; // ✅ Return true if no error
  };

  // ✅ Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const numericValue = value === "" ? 0 : Number(value);
    let updatedValue;

    if (type === "checkbox") {
      updatedValue = checked ? 1 : 0;
    } else if (binaryFields.includes(name) || maxFields.includes(name) || moneyFields.includes(name)) {
      updatedValue = numericValue;
    } else {
      updatedValue = value;
    }

    if (validateInput(name, numericValue)) {
      setFormData((prev) => ({
        ...prev,
        [name]: updatedValue,
      }));
    }
  };

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("✅ Submitting Data:", formData);
    try {
    //   await axios.post("http://localhost:5001/store_details", formData);
    //   navigate("/home"); // ✅ Redirect on success
    } catch (error) {
    //   console.error("Error:", error);
    }
  };

  return (
    <Container fluid className="mt-4">
      {/* 🔹 Form Section */}
      <Row className="justify-content-center mt-4">
        <Col md={8}>
          <Card className="p-4 shadow-lg">
            <h2 className="text-center mb-4">Inheritance Information Form</h2>
            <Form onSubmit={handleSubmit}>
              {/* Gender & Married */}
              <Card className="mb-3">
                <Card.Body>
                  <h5>Personal Information</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Label>Gender:</Form.Label>
                      <div >
                        <Form.Check
                          inline
                          type="radio"
                          label="Male"
                          name="gender"
                          value="Male"
                          onChange={handleChange}
                          required
                        />
                        <Form.Check
                          inline
                          type="radio"
                          label="Female"
                          name="gender"
                          value="Female"
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </Col>
                    <Col md={6}>
                      <Form.Label>Married?</Form.Label>
                      <div >
                        <Form.Check
                          inline
                          type="radio"
                          label="Yes"
                          name="married"
                          value="Yes"
                          onChange={handleChange}
                          required
                        />
                        <Form.Check
                          inline
                          type="radio"
                          label="No"
                          name="married"
                          value="No"
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Children */}
              <Card className="mb-3">
                <Card.Body>
                  <h5>
                    Family Information
                    <OverlayTrigger
                      placement="top"
                      overlay={renderTooltip(
                        "Enter the details of your immediate family members."
                      )}
                    >
                      <span
                        className="text-primary ms-2"
                        style={{ cursor: "pointer" }}
                      >
                        ⓘ
                      </span>
                    </OverlayTrigger>
                  </h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Is Father Alive?</Form.Label>
                        <div>
                          <Form.Check
                            inline
                            type="radio"
                            label="Yes"
                            name="father"
                            value="1"
                            onChange={handleChange}
                            required
                          />
                          <Form.Check
                            inline
                            type="radio"
                            label="No"
                            name="father"
                            value="0"
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      {/* Is Mother Alive */}
                      <Form.Group>
                        <Form.Label>Is Mother Alive?</Form.Label>
                        <div>
                          <Form.Check
                            inline
                            type="radio"
                            label="Yes"
                            name="mother"
                            value="1"
                            onChange={handleChange}
                            required
                          />
                          <Form.Check
                            inline
                            type="radio"
                            label="No"
                            name="mother"
                            value="0"
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Form.Label>Do you have children?</Form.Label>
                    <div>
                      <Form.Check
                        inline
                        type="radio"
                        label="Yes"
                        name="children"
                        value="Yes"
                        onChange={handleChange}
                        required
                      />
                      <Form.Check
                        inline
                        type="radio"
                        label="No"
                        name="children"
                        value="No"
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </Row>

                  {/* Show Sons & Daughters only if children exist */}
                  {formData.children === "Yes" && (
                    <Row>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Number of Sons:</Form.Label>
                          <Form.Control
                            type="number"
                            name="sons"
                            min="0"
                            max="30"
                            value={formData.sons}
                            onChange={handleChange}
                            required
                          />
                          {errors.sons && <div className="text-danger">{errors.sons}</div>}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Number of Daughters:</Form.Label>
                          <Form.Control
                            type="number"
                            name="daughters"
                            min="0"
                            max="30"
                            value={formData.daughters}
                            onChange={handleChange}
                            required
                          />
                          {errors.daughters && <div className="text-danger">{errors.daughters}</div>}
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
                  {/* Siblings */}
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Number of Brothers:</Form.Label>
                        <Form.Control
                          type="number"
                          name="brothers"
                          min="0"
                          max="30"
                          value={formData.brothers}
                          onChange={handleChange}
                          required
                        />
                        {errors.brothers && <div className="text-danger">{errors.brothers}</div>}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Number of Sisters:</Form.Label>
                        <Form.Control
                          type="number"
                          name="sisters"
                          min="0"
                          max="30"
                          value={formData.sisters}
                          onChange={handleChange}
                          required
                        />
                        {errors.sisters && <div className="text-danger">{errors.sisters}</div>}
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card>
                <CardBody>
                  {/* Net Worth & Will */}
                  <Row>
                  <Col md={6}>
                  <Form.Group className="mt-3">
                    <Form.Label>
                      Net Worth ($):
                      <OverlayTrigger
                        placement="top"
                        overlay={renderTooltip(
                          "This is the total value of your assets."
                        )}
                      >
                        <span
                          className="text-primary ms-2"
                          style={{ cursor: "pointer" }}
                        >
                          ⓘ
                        </span>
                      </OverlayTrigger>
                    </Form.Label>

                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <Form.Control
                        type="number"
                        name="networth"
                        min="0"
                        max="999999999999"
                        value={formData.networth}
                        onChange={handleChange}
                        className="form-control"
                        aria-label="Networth (in dollars)"
                        required
                      />
                      <span className="input-group-text">.00</span>
                    </div>
                    {errors.networth && (
                      <div className="text-danger">{errors.networth}</div>
                    )}
                  </Form.Group>
                  </Col>
                  <Col md={6}>
                  <Form.Group className="mt-3">
                    <Form.Label>
                      Will Amount ($):
                      <OverlayTrigger
                        placement="top"
                        overlay={renderTooltip(
                          "In the application, we ask for net worth and will amount; however, some inheritance-sharing frameworks impose limitations on the will amount. For instance, Islamic inheritance follows the Wasiyya rule, which allows a maximum of one-third (⅓) of the total net worth, while Brazil limits it to 50%, and other systems have their own restrictions."
                        )}
                      >
                        <span
                          className="text-primary ms-2"
                          style={{ cursor: "pointer" }}
                        >
                          ⓘ
                        </span>
                      </OverlayTrigger>
                    </Form.Label>

                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <Form.Control
                        type="number"
                        name="will_amount"
                        min="0"
                        value={formData.will_amount}
                        onChange={handleChange}
                        className="form-control"
                        aria-label="Will Amount (in dollars)"
                        required
                      />
                      <span className="input-group-text">.00</span>
                    </div>
                    {errors.will_amount && (
                      <div className="text-danger">{errors.will_amount}</div>
                    )}
                  </Form.Group>
                  </Col>
                  </Row>
                
            
                  
                </CardBody>
              </Card>

              {/* Submit Button */}
              <Button type="submit" className="btn btn-primary w-100 mt-3">
                Save & Proceed
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
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
