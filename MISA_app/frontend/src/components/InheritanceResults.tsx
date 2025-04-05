import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserInfo from "../hooks/useUserInfo";
import { api } from "../api/api";
import Table from "react-bootstrap/Table";
import { Card, Container, Button } from "react-bootstrap";

type InheritanceResult = {
  name: string;
  detailed_result: string;
  json_result: string;
};

type Heir = {
  heir: string;
  count: number;
  amount: number;
  percentage: number;
  explanation: string;
};

const InheritanceResults: React.FC = () => {
  const userInfo = useUserInfo();
  const userId = userInfo?.user_id;
  const [results, setResults] = useState<InheritanceResult[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (!storedUserInfo) {
      navigate("/welcome");
      return;
    }
    
    if (!userId) return;

    api
      .get(`/get_all_results/${userId}`)
      .then((response) => {
        if (response.data.success) {
          setResults(response.data.results);
        } else {
          console.error("Error fetching inheritance results");
        }
      })
      .catch((error) => console.error("Error:", error));
  }, [userId, navigate]);

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Inheritance Results History</h2>
      
      {results.length === 0 ? (
        <Card className="text-center p-5 shadow">
          <Card.Body>
            <h4>No inheritance results found</h4>
            <p className="text-muted">Try calculating inheritance using different systems.</p>
            <Button variant="primary" onClick={() => navigate("/home")}>
              Go to Inheritance Systems
            </Button>
          </Card.Body>
        </Card>
      ) : (
        results.map((result, index) => {
          const detailedResult = JSON.parse(result.detailed_result) as {
            heirs: Heir[];
            blocked_heirs: Record<string, string>;
          };

          return (
            <Card 
              key={index}
              className="mb-4 shadow"
            >
              <Card.Header className="bg-secondary text-white">
                <h3 className="mb-0">{result.name}</h3>
              </Card.Header>
              
              <Card.Body>
                <Button
                  variant={expandedIndex === index ? "secondary" : "primary"}
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="mb-3"
                >
                  {expandedIndex === index ? "Hide Details" : "View Detailed Results"}
                </Button>

                {expandedIndex === index && (
                  <div className="detailed-results">
                    {/* Eligible Heirs Table */}
                    <h4 className="mt-4">Eligible Heirs</h4>
                    <Table
                      striped
                      bordered
                      hover
                      responsive
                      className="table-dark"
                    >
                      <thead>
                        <tr>
                          <th>Heir</th>
                          <th>Count</th>
                          <th>Amount</th>
                          <th>Percentage</th>
                          <th>Explanation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedResult.heirs.map((heir: Heir, idx: number) => (
                          <tr key={idx}>
                            <td>{heir.heir}</td>
                            <td>{heir.count}</td>
                            <td>${heir.amount.toFixed(2)}</td>
                            <td>{heir.percentage.toFixed(2)}%</td>
                            <td>{heir.explanation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>

                    {/* Blocked Heirs */}
                    {Object.keys(detailedResult.blocked_heirs).length > 0 && (
                      <div className="blocked-heirs mt-4">
                        <h4>Blocked Heirs</h4>
                        <ul className="list-group">
                          {Object.entries(detailedResult.blocked_heirs).map(
                            ([heir, reason], idx) => (
                              <li key={idx} className="list-group-item bg-dark text-white">
                                <strong>{heir.replace("_", " ")}:</strong>{" "}
                                {reason}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          );
        })
      )}
      
      <div className="text-center mt-4 mb-5">
        <Button variant="secondary" onClick={() => navigate("/home")}>
          Back to Home
        </Button>
      </div>
    </Container>
  );
};

export default InheritanceResults;
