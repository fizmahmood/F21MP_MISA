import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import { Button, Form } from "react-bootstrap";
import FormFacts from "./FormFacts";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ uuid: string; idUser: number } | null>(
    null
  );

  useEffect(() => {
    const userUUID = localStorage.getItem("userUUID");
    if (!userUUID) {
      navigate("/welcome"); // Redirect to welcome page if no UUID
      return;
    }

    // Fetch user data
    axios
      .get(`http://localhost:5001/get_user/${userUUID}`)
      .then((response) => {
        if (response.data.success) {
          const userData = response.data.user_data;
          console.log("User data loaded:", userData);

          // ✅ Fix incorrect key name
          setUser({
            uuid: userData.uuid,
            idUser: userData.idUser || 0, // Ensure correct key is used
          });
        } else {
          console.warn("User not found");
          navigate("/welcome");
        }
      })
      .catch((error) => {
        console.error("Error retrieving user:", error);
        navigate("/welcome");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
    <div className="container mt-4">
      <h2>Welcome Back</h2>
      <p>Your User ID: {user?.idUser}</p>
      <p>UUID: {user?.uuid}</p>
      {/* Add Home Page Content Here */}
    </div>
    <div>
    <FormFacts />
    </div>
    </>
    
  );
};

export default HomePage;
