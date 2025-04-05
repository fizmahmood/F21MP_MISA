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
import { api } from "../api/api";
import useUserInfo from "../hooks/useUserInfo";
import { useNavigate } from "react-router-dom";

// Define the TypeScript interface for form data
interface FormData {
  gender: string;
  married: string;
  father: number;
  mother: number;
  sons: number;
  daughters: number;
  brothers: number;
  sisters: number;
  will_amount: string; // updated to string
  networth: string;    // updated to string
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
    will_amount: "0", // default as "0"
    networth: "0",    // default as "0"
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const userInfo = useUserInfo();
  const navigate = useNavigate();

  // Validation rules arrays
  const maxFields = [
    "brothers",
    "sisters",
    "sons",
    "daughters",
    "grandsons",
    "granddaughters",
  ];
  const moneyFields = ["networth", "will_amount"];
  const binaryFields = [
    "father",
    "mother",
    "husband",
    "wife",
    "paternal_grandfather",
    "paternal_grandmother",
    "maternal_grandfather",
    "maternal_grandmother",
  ];

  // Render tooltips for extra information
  const renderTooltip = (message: string) => (
    <Tooltip id="tooltip">{message}</Tooltip>
  );

  // When userInfo changes, update the form data if desired.
  useEffect(() => {
    if (userInfo) {
      setFormData((prev) => ({
        ...prev,
        Users_user_id: userInfo.user_id, // Set the user id from userInfo
      }));
    }
  }, [userInfo]);

  // Auto-set wife/husband based on gender and marriage status
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      wife: prev.gender === "Male" && prev.married === "Yes" ? 1 : 0,
      husband: prev.gender === "Female" && prev.married === "Yes" ? 1 : 0,
    }));
  }, [formData.gender, formData.married]);

  // Validate input before updating state
  const validateInput = (name: string, value: number) => {
    let errorMessage = "";

    if (binaryFields.includes(name) && ![0, 1].includes(value)) {
      errorMessage = "Must be 0 or 1";
    } else if (maxFields.includes(name) && (value < 0 || value > 31)) {
      errorMessage = "Must be between 0 and 30";
    } else if (
      moneyFields.includes(name) &&
      (value < 0 || value > 9999999999)
    ) {
      errorMessage = "Max value is 9,999,999,999";
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));

    return errorMessage === "";
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let updatedValue: any;
    
    if (type === "checkbox") {
      updatedValue = checked ? 1 : 0;
    } else if (moneyFields.includes(name)) {
      // For money fields, store the value as string.
      updatedValue = value;
    } else if (binaryFields.includes(name) || maxFields.includes(name)) {
      updatedValue = value === "" ? 0 : Number(value);
    } else {
      updatedValue = value;
    }

    if (validateInput(name, moneyFields.includes(name) ? Number(value) : Number(value))) {
      setFormData((prev) => ({
        ...prev,
        [name]: updatedValue,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Retrieve the latest userInfo directly from localStorage
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!storedUserInfo) {
      console.error("User info not available in localStorage.");
      return;
    }
    const parsedUserInfo = JSON.parse(storedUserInfo);

    // Overwrite Users_user_id with the value from localStorage
    // Also convert money fields to numbers for the API payload
    const updatedFormData = {
      ...formData,
      Users_user_id: parsedUserInfo.user_id,
      will_amount: Number(formData.will_amount),
      networth: Number(formData.networth),
    };

    console.log("✅ Submitting Data:", updatedFormData);
    try {
      await api.post("/store_details", updatedFormData);
      navigate("/home"); // Redirect on success
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Remove leading zeros on focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^0+[0-9]+$/.test(value)) {
      const newValue = value.replace(/^0+/, "");
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
    }
  };

  // Set the field back to "0" if it is empty on blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value.trim() === "") {
      setFormData((prev) => ({
        ...prev,
        [name]: "0",
      }));
    }
  };

  // onKeyDown to allow only digits
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Home",
      "End",
    ];
    if (allowedKeys.includes(e.key)) {
      return;
    }
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // onPaste to allow only numeric input
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData("text");
    if (!/^\d+$/.test(pastedData)) {
      e.preventDefault();
    }
  };

  return (
    <Container fluid className="mt-4">
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
                      <div>
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
                      <div>
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

              {/* Family Information */}
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
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            required
                          />
                          {errors.sons && (
                            <div className="text-danger">{errors.sons}</div>
                          )}
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
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            required
                          />
                          {errors.daughters && (
                            <div className="text-danger">{errors.daughters}</div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  )}
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
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          required
                        />
                        {errors.brothers && (
                          <div className="text-danger">{errors.brothers}</div>
                        )}
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
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                          required
                        />
                        {errors.sisters && (
                          <div className="text-danger">{errors.sisters}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card>
                <CardBody>
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
                            type="text"
                            name="networth"
                            value={formData.networth}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            inputMode="numeric"
                            pattern="[0-9]*"
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
                              "Enter the amount specified in your will."
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
                            type="text"
                            name="will_amount"
                            value={formData.will_amount}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            inputMode="numeric"
                            pattern="[0-9]*"
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