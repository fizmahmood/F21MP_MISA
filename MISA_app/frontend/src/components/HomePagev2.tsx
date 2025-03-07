import React, { useEffect, useState } from "react";
// import axios from "axios";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";
import useFacts from "../hooks/useFacts";
import FactsLoader from "./FactsLoader";

// import { userInfo } from "os";

// import { Button, Form } from "react-bootstrap";
//import FormFacts from "./FormFacts";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  // const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    user_id: number;
    // facts_id: number;
    uuid: string;
  } | null>(null);
  const [systemName, setSystemName] = useState<{
    idInheritanceSystem: number;
    system_name: string;
  } | null>(null);
  const facts_id = localStorage.getItem("facts_id");
  // const [fact, setFact] = useState<{
  //   user_id: number;
  //   facts_id: number;
  //   // uuid: string;
  // } | null>(null);

  // useEffect(() => {
  //   const storedUserInfo = localStorage.getItem("userInfo");
  //   const storedFactId = localStorage.getItem("facts_id");
  //   const parsedUserInfo = JSON.parse(storedUserInfo);
  //   if (storedUserInfo) {
  //     try {
        
  //       // const parsedFactId = JSON.parse(storedFactId);
  //       if (parsedUserInfo.user_id ) {
  //         setUser({
  //           user_id: parsedUserInfo.user_id,
  //           // facts_id: parseInt(storedFactId),
  //           uuid: parsedUserInfo.uuid,
  //         });
  //       } else {
  //         console.error("User ID not found in localStorage");
  //       }
  //     } catch (error) {
  //       console.error("Error parsing userInfo from localStorage:", error);
  //     }
  //   }
  //   if (storedFactId){
  //       setFact({
  //       user_id: parsedUserInfo.user_id,
  //       facts_id: parseInt(storedFactId),
  //       });
  //   } else {
  //     console.error("Facts ID not found in localStorage");
  //     // Fetch facts id
  //     api.get(`/get_facts/${user?.user_id}`)
  //     .then((response) => {
  //       if (response.data.success) {
  //         const factsData = response.data.user_facts;
  //         console.log("Facts data loaded:", factsData);
  //         setFact({
  //           user_id: user?.user_id,
  //           facts_id: factsData.facts_id,
  //         });
  //         console.log(fact);
  //       } else {
  //         console.warn("Facts not found");
  //         navigate("/welcome");
  //       });
  //     }
  //   }
  // }

  //   // Fetch user data
  //   // api
  //   //   .get(`http://localhost:5001/get_user/${userUUID}`)
  //   //   .then((response) => {
  //   //     if (response.data.success) {
  //   //       const userData = response.data.user_data;
  //   //       console.log("User data loaded:", userData);

  //   //       // ✅ Fix incorrect key name
  //   //       setUser({
  //   //         uuid: userData.uuid,
  //   //         user_id: userData.idUser || 0, // Ensure correct key is used
  //   //       });
  //   //       console.log(user);
  //   //     } else {
  //   //       console.warn("User not found");
  //   //       navigate("/welcome");
  //   //     }
  //   //   })
  //   //   .catch((error) => {
  //   //     console.error("Error retrieving user:", error);
  //   //     navigate("/welcome");
  //   //   })
  //   //   .finally(() => setLoading(false));
  // }, [navigate]);

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
  useEffect(() => {
    if (!systemName || !user) return; // Ensure systemName & user are available

    // Call share_inheritance API
    api
      .post("http://localhost:5001/share_inheritance", {
        user_id: user.user_id,
        system_name: systemName,
        InheritanceSystem_id: 1, // Ensure this value exists in your database
        Facts_id: facts_id, // Modify if necessary
      })
      .then((response) => {
        if (response.data.success) {
          console.log(
            `Inheritance shared successfully for ${systemName}:`,
            response.data
          );
          // navigate("/result",{state: {result: response.data.json_result}});
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

  //   try {
  //     const sysResponse = await api.get(`/get_system/${selectedSystem}`);

  //     if (!sysResponse.data.success) {
  //       console.error("System details not found:", sysResponse.data);
  //       return;
  //     }

  //     const systemData = sysResponse.data.system; // ✅ Extract system data
  //     console.log("Fetched system details:", systemData);
  //     const response = await api.post("/share_inheritance", {
  //       user_id: user.user_id,
  //       system_name: selectedSystem,
  //       // InheritanceSystem_id: 1, // Ensure this value exists in your database
  //       Facts_id: user.facts_id, // Modify if necessary
  //     });

  //     if (response.data.success) {
  //       console.log(
  //         `Inheritance shared successfully for ${selectedSystem}:`,
  //         response.data
  //       );

  //       // ✅ Navigate to Results Page and pass the results
  //       navigate("/result", {
  //         state: {
  //           result: response.data.json_result,
  //           details: response.data.results_for_db,
  //         },
  //       });
  //     } else {
  //       console.error(
  //         `Failed to share inheritance for ${selectedSystem}:`,
  //         response
  //       );
  //     }
  //   } catch (error) {
  //     console.error(`Error sharing inheritance for ${selectedSystem}:`, error);
  //   }
  // };

  // if (loading) return <div>Loading...</div>;
  const handleGenerateResults = async (selectedSystem: string) => {
    if (!user) {
      console.error("User data not available.");
      return;
    }

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

      // ✅ Call `share_inheritance` with the fetched system data
      const response = await api.post("/share_inheritance", {
        user_id: user.user_id,
        system_name: systemName?.system_name,
        Facts_id: facts_id, // Ensure correct Facts_id is used
        InheritanceSystem_id: systemName?.idInheritanceSystem,
      });
      // Extract system_name correctly
      //     const response = await api.post("/share_inheritance", {
      //       user_id: user.user_id,
      //       system_name: systemData.system_name,  // ✅ Ensure only system_name is sent
      //       Facts_id: facts_id, 
      // });

      if (response.data.success) {
        console.log(
          `Inheritance shared successfully for ${selectedSystem}:`,
          response.data
        );

        // ✅ Navigate to Results Page and pass the results
        navigate("/result", {
          state: {
            result: response.data.json_result,
            details: response.data.results_for_db,
          },
        });
      } else {
        console.error(
          `Failed to share inheritance for ${selectedSystem}:`,
          response
        );
      }
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
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Navbar
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Pricing
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link disabled" aria-disabled="true">
                  Disabled
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="row">
        <div className="col-sm-6 mb-3 mb-sm-0">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Islamic Inheritance System</h5>
              <p className="card-text">
                This system calculates inheritance using Islamic rules followed
                by the Muslim population.
              </p>
              <button
                onClick={() => handleGenerateResults("Islamic Inheritance")}
                className="btn btn-primary"
              >
                Generate results
              </button>
            </div>
          </div>
        </div>

        <div className="col-sm-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Hindu Inheritance System</h5>
              <p className="card-text">
                This system calculates inheritance using Hindu rules, widely
                followed in India.
              </p>
              <button
                onClick={() => handleGenerateResults("Hindu Inheritance")
                }
                className="btn btn-primary"
              >
                Generate results
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="col-sm-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">India Inheritance System</h5>
              <p className="card-text">
                This system calculates inheritance using India legal framework this is applied 
                for religions other than Hindu and Muslim and also for those who do not follow any religion.
              </p>
              <button
                onClick={() => handleGenerateResults("India Inheritance")
                }
                className="btn btn-primary"
              >
                Generate results
              </button>
            </div>
          </div>
        </div>

        <div className="col-sm-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">China Inheritance System</h5>
              <p className="card-text">
                This system calculates inheritance using China's legal framework this is applied 
                in the country.
              </p>
              <button
                onClick={() => handleGenerateResults("China Inheritance")
                }
                className="btn btn-primary"
              >
                Generate results
              </button>
            </div>
          </div>
        </div>
      
    </>
  );
};

export default HomePage;
