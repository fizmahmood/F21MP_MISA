import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ResultsOnlyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if result is present
  const result = location.state?.result ?? "No results available.";

  return (
    <div className="container mt-4">
      <h2>Inheritance Results</h2>
      <pre>
        {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
      </pre>

      <button onClick={() => navigate("/")} className="btn btn-secondary mt-3">
        Back to Home
      </button>
    </div>
  );
};

export default ResultsOnlyPage;
