import { useEffect, useState } from "react";
import useUserInfo from "../hooks/useUserInfo";

type InheritanceResult = {
  name: string;
  detailed_result: string;
};

type Heir = {
  heir: string;
  count: number;
  amount: number;
  percentage: number;
  explanation: string;
};

const InheritanceResults = () => {
  const userInfo = useUserInfo();
  const userId = userInfo?.user_id;
  const [results, setResults] = useState<InheritanceResult[]>([]);

  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:5001/get_all_results/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setResults(data.results);
        } else {
          console.error("Error fetching inheritance results");
        }
      })
      .catch((error) => console.error("Error:", error));
  }, [userId]);

  return (
    <div className="container">
      <h2>Inheritance Results</h2>
      {results.length === 0 ? (
        <p>No inheritance results found.</p>
      ) : (
        results.map((result, index) => {
          const detailedResult = JSON.parse(result.detailed_result) as {
            heirs: Heir[];
            total_distributed: number;
            remaining_residue: number;
          };

          return (
            <div key={index} className="card">
              <h3>{result.name}</h3>
              <table>
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
              </table>
              <p>
                <strong>Total Distributed:</strong> $
                {detailedResult.total_distributed.toFixed(2)}
              </p>
              <p>
                <strong>Remaining Residue:</strong> $
                {detailedResult.remaining_residue.toFixed(2)}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default InheritanceResults;