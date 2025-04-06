import React, { useEffect, useState } from "react";
// import axios from "axios";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";
import useFacts from "../hooks/useFacts";
import FactsLoader from "./FactsLoader";
import { Container, Row, Col, Card, Button, CardHeader } from "react-bootstrap";

const calculateTotalFamilyMembers = (facts: any) => {
  return (
    facts.father +
    facts.mother +
    facts.brothers +
    facts.sisters +
    facts.husband +
    facts.wife +
    facts.sons +
    facts.daughters +
    facts.grandsons +
    facts.granddaughters +
    facts.paternal_grandfather +
    facts.paternal_grandmother +
    facts.maternal_grandfather +
    facts.maternal_grandmother
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ user_id: number; uuid: string } | null>(
    null
  );
  const [systemName, setSystemName] = useState<{
    idInheritanceSystem: number;
    system_name: string;
  } | null>(null);
  const facts_id = localStorage.getItem("facts_id");

  // New state variable to track which system is currently loading
  const [loadingSystem, setLoadingSystem] = useState<string | null>(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        if (parsedUserInfo.user_id) {
          setUser({
            user_id: parsedUserInfo.user_id,
            uuid: parsedUserInfo.uuid,
          });
          console.log("✅ User loaded from localStorage:", parsedUserInfo);
        } else {
          console.error("❌ User ID not found in localStorage");
        }
      } catch (error) {
        console.error("❌ Error parsing userInfo from localStorage:", error);
      }
    } else {
      console.warn("⚠️ No userInfo found in localStorage.");
      navigate("/welcome");
    }
  }, [navigate]);

  const { facts } = useFacts(user?.user_id ?? null);

  useEffect(() => {
    if (!systemName || !user) return;

    // Call share_inheritance API
    api
      .post("/share_inheritance", {
        user_id: user.user_id,
        system_name: systemName,
        InheritanceSystem_id: 1, // Ensure this value exists in your database
        Facts_id: facts_id,
      })
      .then((response) => {
        if (response.data.success) {
          console.log(
            `Inheritance shared successfully for ${systemName}:`,
            response.data
          );
        } else {
          console.error(
            `Failed to share inheritance for ${systemName}:`,
            response
          );
        }
      })
      .catch((error) => {
        console.error(`Error sharing inheritance for ${systemName}:`, error);
      });
  }, [systemName, user]);

  // const handleGenerateResults = async (selectedSystem: string) => {
  //   if (!user) {
  //     console.error("User data not available.");
  //     return;
  //   }
  //   setLoadingSystem(selectedSystem);

  //   try {
  //     const sysResponse = await api.get(`/get_system`, {
  //       params: { system_name: selectedSystem },
  //     });

  //     if (!sysResponse.data.success) {
  //       console.error("System details not found:", sysResponse.data);
  //       setLoadingSystem(null);
  //       return;
  //     }

  //     const systemData = sysResponse.data.system_data; // ✅ Extract system data
  //     console.log("Fetched system details:", systemData);

  //     // ✅ Set systemName with parsed values
  //     setSystemName({
  //       idInheritanceSystem: systemData.idInheritanceSystem,
  //       system_name: systemData.system_name,
  //     });

  //     InheritanceSystem_id: systemData.idInheritanceSystem,
  //       // 🛑 Add a delay to ensure `systemName` state updates before sending request
  //       setTimeout(async () => {
  //         console.log(`📡 Preparing to send API request with parameters:`);
  //         console.log(`   - User ID: ${user.user_id}`);
  //         console.log(`   - System Name: ${systemData.system_name}`);
  //         console.log(
  //           `   - Inheritance System ID: ${systemData.idInheritanceSystem}`
  //         );
  //         console.log(`   - Facts ID: ${facts_id}`);

  //         // ✅ Call `share_inheritance` with the fetched system data
  //         const response = await api.post("/share_inheritance", {
  //           user_id: user.user_id,
  //           system_name: systemData.system_name,
  //           Facts_id: facts_id, // Ensure correct Facts_id is used
  //           InheritanceSystem_id: systemData.idInheritanceSystem,
  //         });

  //         if (response.data.success) {
  //           console.log(
  //             `Inheritance shared successfully for ${selectedSystem}:`,
  //             response.data
  //           );

  //           // ✅ Navigate to Results Page and pass the results
  //           navigate("/result", {
  //             state: {
  //               system_name: selectedSystem,
  //               result: response.data.json_result,
  //               details: response.data.results_for_db,
  //               context_info: response.data.context_info,
  //             },
  //           });
  //         } else {
  //           console.error(
  //             `Failed to share inheritance for ${selectedSystem}:`,
  //             response
  //           );
  //         }
  //       }, 1500); // Introduce a 1.5-second delay
  //   } catch (error) {
  //     console.error(
  //       `Error fetching system details or sharing inheritance:`,
  //       error
  //     );
  //   }
  // };
  const sendLogToServer = async (logMessage: string) => {
    try {
      const response = await api.post("/log", { logData: logMessage });
      if (response.data.success) {
        console.log("Log sent successfully");
      } else {
        console.error("Failed to send log:", response.data.message);
      }
    } catch (error) {
      console.error("Error sending log:", error);
    }
  };

  const handleGenerateResults = async (selectedSystem: string) => {
    if (!user) {
      console.error("User data not available.");
      return;
    }
    setLoadingSystem(selectedSystem);
    
    // Record the start time when the button is clicked
    const startTime = performance.now();
  
    try {
      const sysResponse = await api.get(`/get_system`, {
        params: { system_name: selectedSystem },
      });
  
      if (!sysResponse.data.success) {
        console.error("System details not found:", sysResponse.data);
        setLoadingSystem(null);
        return;
      }
  
      const systemData = sysResponse.data.system_data; // Extract system data
      console.log("Fetched system details:", systemData);
  
      // Set systemName with parsed values
      setSystemName({
        idInheritanceSystem: systemData.idInheritanceSystem,
        system_name: systemData.system_name,
      });
  
      // Introduce a delay (if needed) before sending the next API request
      setTimeout(async () => {
        console.log(`📡 Preparing to send API request with parameters:`);
        console.log(`   - User ID: ${user.user_id}`);
        console.log(`   - System Name: ${systemData.system_name}`);
        console.log(
          `   - Inheritance System ID: ${systemData.idInheritanceSystem}`
        );
        console.log(`   - Facts ID: ${facts_id}`);
  
        // Call share_inheritance with the fetched system data
        const response = await api.post("/share_inheritance", {
          user_id: user.user_id,
          system_name: systemData.system_name,
          Facts_id: facts_id, // Ensure correct Facts_id is used
          InheritanceSystem_id: systemData.idInheritanceSystem,
        });
  
        if (response.data.success) {
          console.log(
            `Inheritance shared successfully for ${selectedSystem}:`,
            response.data
          );
  
          // Record the end time just before navigating
          const endTime = performance.now();
          const duration = endTime - startTime;
          console.log(
            `Time taken from button click to navigation: ${duration} ms`
          );
  
          // Send the performance log to the server
          const logMessage = `Time taken execute ${selectedSystem} script: ${duration.toFixed(2)} ms`;
          sendLogToServer(logMessage);
  
          // Navigate to the Results Page with the data
          navigate("/result", {
            state: {
              system_name: selectedSystem,
              result: response.data.json_result,
              details: response.data.results_for_db,
              context_info: response.data.context_info,
            },
          });
        } else {
          console.error(
            `Failed to share inheritance for ${selectedSystem}:`,
            response
          );
        }
      }, 1500); // 1.5-second delay
    } catch (error) {
      console.error(
        `Error fetching system details or sharing inheritance:`,
        error
      );
    }
  };

  return (
    <>
      <FactsLoader />
      <Container fluid className="bg-dark text-white py-5 mb-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <h1 className="display-4 fw-bold mb-3">Inheritance Calculator</h1>
              <p className="lead mb-4">
                Explore different inheritance systems and calculate wealth
                distribution based on cultural, religious, and national laws.
              </p>
            </Col>
            {/* <Col lg={5} className="d-none d-lg-block"> */}
            <Col lg={5}>
              <Card className="shadow-sm mb-4">
                <Card.Body>
                  <Row>
                    <Col md={8}>
                      <Card className="shadow-sm border-0">
                        <CardHeader>Your Current Information</CardHeader>
                        <Card.Body>
                          <p className="mb-0">
                            {facts ? (
                              <>
                                Net Worth: ${facts.networth.toLocaleString()} |
                                <br />
                                Family Members:{" "}
                                {calculateTotalFamilyMembers(facts)}
                              </>
                            ) : (
                              "Loading your information..."
                            )}
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4} className="text-end">
                      <Button
                        variant="outline-secondary"
                        onClick={() => navigate("/info")}
                      >
                        Update Information
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </Container>
      <Container className="mt-4">
        {/* 🏛 National Inheritance Systems */}
        <h2 className="mb-3 text-center">🏛 National Inheritance Systems</h2>
        <Row>
          <Col md={4}>
            <Card className="shadow-lg border-0">
              <Card.Body>
                <Card.Title>Chinese Inheritance System</Card.Title>
                <Card.Text>
                  This system follows inheritance rules as per China's legal
                  framework.
                </Card.Text>
                <Button
                  onClick={() => handleGenerateResults("China Inheritance")}
                  variant="primary"
                  disabled={
                    loadingSystem !== null &&
                    loadingSystem !== "China Inheritance"
                  }
                >
                  {loadingSystem === "China Inheritance" ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      ></span>
                      <span role="status"> Loading...</span>
                    </>
                  ) : (
                    "Generate Results"
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-lg border-0">
              <Card.Body>
                <Card.Title>Indian Inheritance System</Card.Title>
                <Card.Text>
                  This system follows the Indian Succession Act for inheritance
                  distribution.
                </Card.Text>
                <Button
                  onClick={() => handleGenerateResults("India Inheritance")}
                  variant="primary"
                  disabled={
                    loadingSystem !== null &&
                    loadingSystem !== "India Inheritance"
                  }
                >
                  {loadingSystem === "India Inheritance" ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      ></span>
                      <span role="status"> Loading...</span>
                    </>
                  ) : (
                    "Generate Results"
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-lg border-0">
              <Card.Body>
                <Card.Title>Russian Inheritance System</Card.Title>
                <Card.Text>
                  This system follows Russian inheritance laws for inheritance
                  distribution.
                </Card.Text>
                <Button
                  onClick={() => handleGenerateResults("Russia Inheritance")}
                  variant="primary"
                  disabled={
                    loadingSystem !== null &&
                    loadingSystem !== "Russia Inheritance"
                  }
                >
                  {loadingSystem === "Russia Inheritance" ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      ></span>
                      <span role="status"> Loading...</span>
                    </>
                  ) : (
                    "Generate Results"
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {/* 🕌 Religious Inheritance Systems */}
        <h2 className="mb-3 text-center">
          🕌 Cultural & Religious Inheritance Systems
        </h2>
        <Row className="mb-4">
          <Col md={4}>
            <Card className="shadow-lg border-0">
              <Card.Body>
                <Card.Title>Hindu Inheritance System</Card.Title>
                <Card.Text>
                  This system calculates inheritance based on Hindu legal
                  traditions.
                </Card.Text>
                <Button
                  onClick={() => handleGenerateResults("Hindu Inheritance")}
                  variant="primary"
                  disabled={
                    loadingSystem !== null &&
                    loadingSystem !== "Hindu Inheritance"
                  }
                >
                  {loadingSystem === "Hindu Inheritance" ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      ></span>
                      <span role="status"> Loading...</span>
                    </>
                  ) : (
                    "Generate Results"
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-lg border-0">
              <Card.Body>
                <Card.Title>Islamic Inheritance System</Card.Title>
                <Card.Text>
                  This system calculates inheritance based on Islamic laws.
                </Card.Text>
                <Button
                  onClick={() => handleGenerateResults("Islamic Inheritance")}
                  variant="primary"
                  disabled={
                    loadingSystem !== null &&
                    loadingSystem !== "Islamic Inheritance"
                  }
                >
                  {loadingSystem === "Islamic Inheritance" ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      ></span>
                      <span role="status"> Loading...</span>
                    </>
                  ) : (
                    "Generate Results"
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-lg border-0">
              <Card.Body>
                <Card.Title>Yoruba Inheritance System</Card.Title>
                <Card.Text>
                  This system calculates inheritance based on the Nigerian yoruba cultural traditions.
                </Card.Text>
                <Button
                  onClick={() => handleGenerateResults("Yoruba Inheritance")}
                  variant="primary"
                  disabled={
                    loadingSystem !== null &&
                    loadingSystem !== "Yoruba Inheritance"
                  }
                >
                  {loadingSystem === "Yoruba Inheritance" ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        aria-hidden="true"
                      ></span>
                      <span role="status"> Loading...</span>
                    </>
                  ) : (
                    "Generate Results"
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default HomePage;
