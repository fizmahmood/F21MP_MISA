import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import useFacts from "../hooks/useFacts";
import {
  Container,
  Card,
  Button,
  Form,
  Spinner,
  Row,
  Col,
  Modal,
} from "react-bootstrap";
import { toast } from "react-toastify";

interface UserFacts {
  father: number;
  mother: number;
  brothers: number;
  sisters: number;
  husband: number;
  wife: number;
  sons: number;
  daughters: number;
  grandsons: number;
  granddaughters: number;
  paternal_grandfather: number;
  paternal_grandmother: number;
  maternal_grandfather: number;
  maternal_grandmother: number;
  will_amount: number;
  networth: number;
  Users_user_id: number;
  facts_id: number;
}

const EditableForm: React.FC = () => {
  const [userFacts, setUserFacts] = useState<UserFacts | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<UserFacts | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  // Set dark mode to true by default
  const [darkMode] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string, string>>({}); // Validation errors
  const navigate = useNavigate();
  const [showClearModal, setShowClearModal] = useState<boolean>(false);

  // Fields that can only be 0 or 1
  const binaryFields = [
    "father",
    "mother",
    "paternal_grandfather",
    "paternal_grandmother",
    "husband",
    "wife",
  ];

  // Fields with a limit of 0 - 99
  const maxFields = [
    "brothers",
    "sisters",
    "sons",
    "daughters",
    "grandsons",
    "granddaughters",
  ];

  // Retrieve user ID from localStorage
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        if (parsedUserInfo.user_id) {
          setUserId(parsedUserInfo.user_id);
        } else {
          console.error("❌ User ID not found in localStorage");
        }
      } catch (error) {
        console.error("❌ Error parsing userInfo from localStorage:", error);
      }
    } else {
      navigate("/welcome");
    }
  }, []);

  // Fetch user facts when userId is set
  const { facts, loading } = useFacts(userId ?? null);

  useEffect(() => {
    if (facts) {
      console.log("✅ Setting user facts:", facts);
      setFormData(facts);
      setUserFacts(facts);
    }
  }, [facts]);

  // Format number with thousand separator
  const formatNumber = (num: number) => num.toLocaleString();

  // Handle input validation
  const validateInput = (name: string, value: number) => {
    let errorMessage = "";

    if (binaryFields.includes(name) && ![0, 1].includes(value)) {
      errorMessage = "Must be 0 or 1";
    } else if (maxFields.includes(name) && value > 99) {
      errorMessage = "Cannot exceed 99";
    } else if (value < 0) {
      errorMessage = "Cannot be negative";
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: errorMessage,
    }));

    return errorMessage === ""; // Return true if no error
  };

  // Cross-field validation for spouse fields:
  // If both husband and wife are greater than 0, set an error for both.
  useEffect(() => {
    if (formData && formData.husband > 0 && formData.wife > 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        husband: "Only one spouse can be selected",
        wife: "Only one spouse can be selected",
      }));
    } else {
      // Clear spouse-related errors if the condition is not met
      setErrors((prevErrors) => {
        const { husband, wife, ...rest } = prevErrors;
        return rest;
      });
    }
  }, [formData?.husband, formData?.wife]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    const numericValue = Number(value);

    // Validate input before updating state
    if (validateInput(name, numericValue)) {
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    }
  };

  // Check if form has errors before submitting
  const hasErrors = () => Object.values(errors).some((error) => error !== "");

  // Helper function to check if any changes have been made in editing form
  const hasChanges = () => {
    if (!formData || !userFacts) return false;
    return Object.keys(userFacts).some((key) => {
      return (
        formData[key as keyof UserFacts] !== userFacts[key as keyof UserFacts]
      );
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !userId || hasErrors()) return;

    api
      .put(`/update_facts/${userId}`, formData)
      .then((response) => {
        if (response.data.success) {
          setUserFacts(formData);
          setIsEditing(false);
          // alert("✅ Data updated successfully!");
          toast.success("✅ Data updated successfully!");
          navigate("/home");
        } else {
          // alert("❌ Failed to update data.");
          toast.error("❌ Failed to update data.");
        }
      })
      .catch((error) => {
        console.error("❌ Error updating user facts:", error);
      });
  };

  // Add this function to group your fields
  const getFieldGroups = () => {
    return [
      {
        title: "Immediate Family",
        fields: ["husband", "wife", "sons", "daughters"],
      },
      {
        title: "Parents",
        fields: ["father", "mother"],
      },
      {
        title: "Siblings",
        fields: ["brothers", "sisters"],
      },
      {
        title: "Grandparents",
        fields: [
          "paternal_grandfather",
          "paternal_grandmother",
          "maternal_grandfather",
          "maternal_grandmother",
        ],
      },
      {
        title: "Grandchildren",
        fields: ["grandsons", "granddaughters"],
      },
      {
        title: "Financial Information",
        fields: ["will_amount", "networth"],
      },
    ];
  };

  // Clear user data modal
  // Handle clearing user data upon confirmation
  const handleClearUserData = () => {
    // For example, remove user data from localStorage and update state
    // localStorage.removeItem("userInfo");
    localStorage.clear();
    // You might also clear other localStorage keys as needed
    setUserFacts(null);
    toast.success("User data cleared!");
    setShowClearModal(false);
    navigate("/welcome");
  };


  if (loading)
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );

  if (!userId)
    return (
      <p className="text-danger text-center">
        ❌ Error: User ID not found in localStorage.
      </p>
    );
  if (!userFacts)
    return (
      <p className="text-warning text-center">
        ⚠️ No data found for this user.
      </p>
    );

  return (
    <div className={darkMode ? "dark-mode" : "light-mode"}>
      <Container className="mt-5">
        <Card className="shadow-lg">
          <Card.Header>
            <h2>User Information</h2>
          </Card.Header>
          <Card.Body>
            <p>
              Family information can be updated here, you can add more family
              members such as grandparents and grandchildren here.
            </p>
          </Card.Body>
        </Card>
      </Container>
      <Container className="mt-5">
        <Card
          className={`shadow ${
            darkMode ? "bg-dark text-light" : "bg-light text-dark"
          }`}
        >
          <Card.Header className="d-flex justify-content-between align-items-center"></Card.Header>

          <Card.Body>
            {isEditing ? (
              <Form onSubmit={handleSubmit}>
                {getFieldGroups().map((group) => (
                  <div key={group.title} className="mb-4">
                    <h5 className="border-bottom pb-2 mb-3">{group.title}</h5>
                    <Row>
                      {group.fields.map((field) => (
                        <Col md={6} key={field}>
                          <Form.Group className="mb-3">
                            <Form.Label>{field.replace(/_/g, " ")}:</Form.Label>
                            <Form.Control
                              type="number"
                              name={field}
                              value={
                                formData
                                  ? formData[field as keyof UserFacts]
                                  : ""
                              }
                              onChange={handleChange}
                              className={`${errors[field] ? "is-invalid" : ""}`}
                            />
                            {errors[field] && (
                              <div className="text-danger">{errors[field]}</div>
                            )}
                          </Form.Group>
                        </Col>
                      ))}
                    </Row>
                  </div>
                ))}
                <div className="d-flex justify-content-end">
                  <Button
                    variant="success"
                    type="submit"
                    className="me-2"
                    disabled={hasErrors() || !hasChanges()}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            ) : (
              <div>
                {getFieldGroups().map((group) => (
                  <div key={group.title} className="mb-4">
                    <h5 className="border-bottom pb-2 mb-3">{group.title}</h5>
                    <Row>
                      {group.fields.map((field) => (
                        <Col md={6} key={field}>
                          <p>
                            <strong>{field.replace(/_/g, " ")}:</strong>{" "}
                            {formatNumber(
                              userFacts[field as keyof UserFacts] as number
                            )}
                          </p>
                        </Col>
                      ))}
                    </Row>
                  </div>
                ))}
                <div className="d-flex justify-content-end">
                  <Button variant="primary" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => setShowClearModal(true)} className="ms-2">
                    Clear User Data
                  </Button>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
       {/* Modal for confirming clear user data */}
       <Modal
        show={showClearModal}
        onHide={() => setShowClearModal(false)}
        centered
        contentClassName="bg-dark text-white"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Clear Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to clear your user data?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            No
          </Button>
          <Button variant="danger" onClick={handleClearUserData}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EditableForm;
