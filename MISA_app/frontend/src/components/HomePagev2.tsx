import React, { useEffect, useState } from "react";
// import axios from "axios";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";
import useFacts from "../hooks/useFacts";
import FactsLoader from "./FactsLoader";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

// import { userInfo } from "os";

// import { Button, Form } from "react-bootstrap";
//import FormFacts from "./FormFacts";

// Loading Button Component
const LoadingButton = ({ 
  systemName, 
  currentlyLoading, 
  onClick 
}: { 
  systemName: string; 
  currentlyLoading: string | null; 
  onClick: (systemName: string) => void;
}) => {
  const isLoading = currentlyLoading === systemName;
  
  return (
    <Button 
      onClick={() => onClick(systemName)}
      variant="primary"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          <span role="status">Loading...</span>
        </>
      ) : (
        "Generate Results"
      )}
    </Button>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  // const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    user_id: number;
    // facts_id: number;
    uuid: string;
  } | null>(null);
  // const [systemName, setSystemName] = useState<string | null>(null);
  const facts_id = localStorage.getItem("facts_id");
  const [loadingSystem, setLoadingSystem] = useState<string | null>(null);
  // const [fact, setFact] = useState<{
  //   user_id: number;
  //   facts_id: number;
  //   // uuid: string;
  // } | null>(null);

  

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    // const storedFactId = localStorage.getItem("facts_id");

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

    // if (storedFactId) {
    //   setFact({
    //     user_id: user?.user_id ?? 0,
    //     facts_id: parseInt(storedFactId),
    //   });
    //   console.log("✅ Facts ID loaded from localStorage:", storedFactId);
    // } else {
    //   console.warn("⚠️ Facts ID not found in localStorage. Fetching from API...");
    //   fetchFacts(); // Call function to fetch from API
    // }
  }, [navigate]);

  // ✅ Function to fetch facts from API
  // const fetchFacts = async () => {
  //   if (!user?.user_id) {
  //     console.error("❌ Cannot fetch facts: User ID is missing.");
  //     return;
  //   }

  //   try {
  //     console.log(`🚀 Fetching facts for user_id: ${user.user_id}`);
  //     const response = await api.get(`/get_facts/${user.user_id}`);
  //     if (response.data.success) {
  //       const factsData = response.data.user_facts;
  //       console.log("✅ Facts data loaded:", factsData);
  //       setFact({
  //         user_id: user.user_id,
  //         facts_id: factsData.facts_id,
  //       });
  //       localStorage.setItem("facts_id", String(factsData.facts_id)); // ✅ Store in localStorage
  //     } else {
  //       console.warn("⚠️ Facts not found. Redirecting to welcome page...");
  //       navigate("/welcome");
  //     }
  //   } catch (error) {
  //     console.error("❌ Error fetching facts:", error);
  //   }
  // };

  useFacts(user?.user_id ?? null);

  // if (loading) return <div>Loading...</div>;
  const handleGenerateResults = async (systemName: string) => {
    // Prevent duplicate clicks
    if (loadingSystem === systemName) return;
    
    // Set loading state
    setLoadingSystem(systemName);
    // setSystemName(systemName); // Set the current system name
    
    try {
      console.log(`Requesting system details for: ${systemName}`);
      const systemResponse = await api.get(`/get_system`, {
        params: { system_name: systemName },
      });
      console.log(`System response:`, systemResponse.data);
      
      if (systemResponse.data.success && user) {
        const systemData = systemResponse.data.system_data;
        
        console.log(`Sending inheritance calculation request:`, {
          user_id: user.user_id,
          system_name: systemName,
          InheritanceSystem_id: systemData.idInheritanceSystem,
          Facts_id: facts_id,
        });
        
        const response = await api.post("/share_inheritance", {
          user_id: user.user_id,
          system_name: systemName,
          InheritanceSystem_id: systemData.idInheritanceSystem,
          Facts_id: facts_id,
        });
        
        console.log(`Inheritance calculation response:`, response.data);
        
        if (response.data.success) {
          navigate("/result", { state: { result: response.data } });
        }
      }
    } catch (error) {
      console.error(`Error sharing inheritance for ${systemName}:`, error);
      alert("An error occurred while calculating inheritance. Please try again.");
    } finally {
      // Clear loading state
      setLoadingSystem(null);
      // Don't clear systemName here so it can be used if needed
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
              Select an inheritance system that aligns with your legal or
              religious preference. Our system supports Religious Inheritance
              Laws and National Succession Laws to provide accurate wealth
              distribution based on your selection.
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
                <LoadingButton 
                  systemName="Islamic Inheritance"
                  currentlyLoading={loadingSystem}
                  onClick={handleGenerateResults}
                />
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="shadow-lg border-0">
              <Card.Body>
                <Card.Title>Hindu Inheritance</Card.Title>
                <Card.Text>
                  This system calculates inheritance based on Hindu legal
                  traditions.
                </Card.Text>
                <LoadingButton 
                  systemName="Hindu Inheritance"
                  currentlyLoading={loadingSystem}
                  onClick={handleGenerateResults}
                />
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
                  This system follows the Indian Succession Act for inheritance
                  distribution.
                </Card.Text>
                <LoadingButton 
                  systemName="India Inheritance"
                  currentlyLoading={loadingSystem}
                  onClick={handleGenerateResults}
                />
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-lg border-0">
              <Card.Body>
                <Card.Title>China Inheritance</Card.Title>
                <Card.Text>
                  This system follows inheritance rules as per China's legal
                  framework.
                </Card.Text>
                <LoadingButton 
                  systemName="China Inheritance"
                  currentlyLoading={loadingSystem}
                  onClick={handleGenerateResults}
                />
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-lg border-0">
              <Card.Body>
                <Card.Title>Russia Inheritance</Card.Title>
                <Card.Text>
                  This system follows Russian inheritance laws for property
                  distribution.
                </Card.Text>
                <LoadingButton 
                  systemName="Russia Inheritance"
                  currentlyLoading={loadingSystem}
                  onClick={handleGenerateResults}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
    // <>
    //   <FactsLoader />
    //   <div className="row">
    //     <div className="col-sm-6 mb-3 mb-sm-0">
    //       <div className="card">
    //         <div className="card-body">
    //           <h5 className="card-title">Islamic Inheritance System</h5>
    //           <p className="card-text">
    //             This system calculates inheritance using Islamic rules followed
    //             by the Muslim population.
    //           </p>
    //           <button
    //             onClick={() => handleGenerateResults("Islamic Inheritance")}
    //             className="btn btn-primary"
    //           >
    //             Generate results
    //           </button>
    //         </div>
    //       </div>
    //     </div>

    //     <div className="col-sm-6">
    //       <div className="card">
    //         <div className="card-body">
    //           <h5 className="card-title">Hindu Inheritance System</h5>
    //           <p className="card-text">
    //             This system calculates inheritance using Hindu rules, widely
    //             followed in India.
    //           </p>
    //           <button
    //             onClick={() => handleGenerateResults("Hindu Inheritance")
    //             }
    //             className="btn btn-primary"
    //           >
    //             Generate results
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    //   <div className="col-sm-6">
    //       <div className="card">
    //         <div className="card-body">
    //           <h5 className="card-title">India Inheritance System</h5>
    //           <p className="card-text">
    //             This system calculates inheritance using India legal framework this is applied
    //             for religions other than Hindu and Muslim and also for those who do not follow any religion.
    //           </p>
    //           <button
    //             onClick={() => handleGenerateResults("India Inheritance")
    //             }
    //             className="btn btn-primary"
    //           >
    //             Generate results
    //           </button>
    //         </div>
    //       </div>
    //     </div>

    //     <div className="col-sm-6">
    //       <div className="card">
    //         <div className="card-body">
    //           <h5 className="card-title">China Inheritance System</h5>
    //           <p className="card-text">
    //             This system calculates inheritance using China's legal framework this is applied
    //             in the country.
    //           </p>
    //           <button
    //             onClick={() => handleGenerateResults("China Inheritance")
    //             }
    //             className="btn btn-primary"
    //           >
    //             Generate results
    //           </button>
    //         </div>
    //       </div>
    //     </div>

    //     <div className="col-sm-6">
    //       <div className="card">
    //         <div className="card-body">
    //           <h5 className="card-title">Russia Inheritance System</h5>
    //           <p className="card-text">
    //             This system calculates inheritance using Russia's legal framework this is applied
    //             in the country.
    //           </p>
    //           <button
    //             onClick={() => handleGenerateResults("Russia Inheritance")
    //             }
    //             className="btn btn-primary"
    //           >
    //             Generate results
    //           </button>
    //         </div>
    //       </div>
    //     </div>

    // </>
  );
};

export default HomePage;
