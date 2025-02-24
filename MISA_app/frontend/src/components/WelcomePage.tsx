import React from "react";
import { useNavigate } from "react-router-dom";
import FormFacts from "./FormFacts";
import UserDataLoader from "./UserDataLoader";

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();


  const handleContinue = () => {
    navigate("/home"); // Redirect to the main application
  };

  return (
    <div className="container text-center mt-5">
    <UserDataLoader/>
      <h2>Welcome to MISA</h2>
      <p>
        Explore inheritance laws and customs. <br />
        As a new user, you will need to provide some details about your family members.<br />
        Kindly fill the form and start exploring inheritance laws and customs.
      </p>
        <FormFacts />
      <button className="btn btn-primary" onClick={handleContinue}>
        Continue
      </button>
    </div>
  );
};

export default WelcomePage;