import React, { useEffect, useState } from "react";
// import axios from "axios";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";
import useFacts from "../hooks/useFacts";
import FactsLoader from "./FactsLoader";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ user_id: number; uuid: string } | null>(null);
  const [systemName, setSystemName] = useState<{ idInheritanceSystem: number; system_name: string } | null>(null);
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
    }
  }, [navigate]);

  useFacts(user?.user_id ?? null);

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
          console.log(`Inheritance shared successfully for ${systemName}:`, response.data);
        } else {
          console.error(`Failed to share inheritance for ${systemName}:`, response);
        }
      })
      .catch((error) => {
        console.error(`Error sharing inheritance for ${systemName}:`, error);
      });
  }, [systemName, user]);

  const handleGenerateResults = async (selectedSystem: string) => {
  if (!user) {
        console.error("User data not available.");
        return;
      }
      setLoadingSystem(selectedSystem)
  
      try {
        const sysResponse = await api.get(`/get_system`, {
          params: { system_name: selectedSystem },
        });
  
        if (!sysResponse.data.success) {
          console.error("System details not found:", sysResponse.data);
          return;
        }
  
        const systemData = sysResponse.data.system; // ✅ Extract system data
        console.log("Fetched system details:", systemData);
  
        // ✅ Set systemName with parsed values
        setSystemName({
          idInheritanceSystem: systemData.idInheritanceSystem,
          system_name: systemData.system_name,
        });
  
          InheritanceSystem_id: systemData.idInheritanceSystem,
        // 🛑 Add a delay to ensure `systemName` state updates before sending request
      setTimeout(async () => {
        console.log(`📡 Preparing to send API request with parameters:`);
        console.log(`   - User ID: ${user.user_id}`);
        console.log(`   - System Name: ${systemData.system_name}`);
        console.log(`   - Inheritance System ID: ${systemData.idInheritanceSystem}`);
        console.log(`   - Facts ID: ${facts_id}`);
        
        // ✅ Call `share_inheritance` with the fetched system data
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
  
          // ✅ Navigate to Results Page and pass the results
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
        }, 1500); // Introduce a 1.5-second delay
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
      <Container className="mt-5">
        <Card className="shadow-lg p-4 border-0 text-center">
          <Card.Body>
            <h2 className="mb-3 text-primary fw-bold">
              💼 Choose Your Inheritance System
            </h2>
            <p className="lead text-muted">
              Select an inheritance system that aligns with your legal or religious preference. Our system supports
              Religious Inheritance Laws and National Succession Laws to provide accurate wealth distribution based on your selection.
            </p>
          </Card.Body>
        </Card>
      </Container>
      <Container className="mt-4">
        {/* 🕌 Religious Inheritance Systems */}
        <h2 className="mb-3 text-center">🕌 Religious Inheritance Systems</h2>
        <Row className="mb-4">
          <Col md={6}>
            <Card className="shadow-lg border-0">
              <Card.Body>
                <Card.Title>Islamic Inheritance</Card.Title>
                <Card.Text>
                  This system calculates inheritance based on Islamic laws.
                </Card.Text>
                <Button
                  onClick={() => handleGenerateResults("Islamic Inheritance")}
                  variant="primary"
                  disabled={loadingSystem === "Islamic Inheritance"}
                >
                  {loadingSystem === "Islamic Inheritance" ? (
                    <>
                      <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                      <span role="status"> Loading...</span>
                    </>
                  ) : (
                    "Generate Results"
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="shadow-lg border-0">
              <Card.Body>
                <Card.Title>Hindu Inheritance</Card.Title>
                <Card.Text>
                  This system calculates inheritance based on Hindu legal traditions.
                </Card.Text>
                <Button
                  onClick={() => handleGenerateResults("Hindu Inheritance")}
                  variant="primary"
                  disabled={loadingSystem === "Hindu Inheritance"}
                >
                  {loadingSystem === "Hindu Inheritance" ? (
                    <>
                      <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
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

        {/* 🏛 National Inheritance Systems */}
        <h2 className="mb-3 text-center">🏛 National Inheritance Systems</h2>
        <Row>
          <Col md={4}>
            <Card className="shadow-lg border-0">
              <Card.Body>
                <Card.Title>India Inheritance</Card.Title>
                <Card.Text>
                  This system follows the Indian Succession Act for inheritance distribution.
                </Card.Text>
                <Button
                  onClick={() => handleGenerateResults("India Inheritance")}
                  variant="primary"
                  disabled={loadingSystem === "India Inheritance"}
                >
                  {loadingSystem === "India Inheritance" ? (
                    <>
                      <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
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
                <Card.Title>China Inheritance</Card.Title>
                <Card.Text>
                  This system follows inheritance rules as per China’s legal framework.
                </Card.Text>
                <Button
                  onClick={() => handleGenerateResults("China Inheritance")}
                  variant="primary"
                  disabled={loadingSystem === "China Inheritance"}
                >
                  {loadingSystem === "China Inheritance" ? (
                    <>
                      <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
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
                <Card.Title>Russia Inheritance</Card.Title>
                <Card.Text>
                  This system follows Russian inheritance laws for property distribution.
                </Card.Text>
                <Button
                  onClick={() => handleGenerateResults("Russia Inheritance")}
                  variant="primary"
                  disabled={loadingSystem === "Russia Inheritance"}
                >
                  {loadingSystem === "Russia Inheritance" ? (
                    <>
                      <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
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