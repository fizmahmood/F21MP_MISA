import { useEffect, useState } from "react";
import useUserInfo from "../hooks/useUserInfo";
import Tree from "react-d3-tree";

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

const InheritanceResults = () => {
  const userInfo = useUserInfo();
  const userId = userInfo?.user_id;
  const [results, setResults] = useState<InheritanceResult[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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

  // ✅ Function to Generate Decision Tree Data
  const generateDecisionTree = (heirs: Heir[], blockedHeirs: Record<string, string>) => {
    const treeData: any = {
      name: "Inheritance Decision",
      children: [
        {
          name: "Eligible Heirs",
          children: heirs.map((heir) => ({
            name: heir.heir,
            attributes: {
              Amount: `$${heir.amount.toFixed(2)}`,
              Percentage: `${heir.percentage.toFixed(2)}%`,
            },
          })),
        },
        {
          name: "Blocked Heirs",
          children: Object.entries(blockedHeirs).map(([heir, reason]) => ({
            name: heir.replace("_", " "),
            attributes: { Reason: reason },
          })),
        },
      ],
    };
    return [treeData];
  };

  return (
    <div className="container">
      <h2>Inheritance Results</h2>
      {results.length === 0 ? (
        <p>No inheritance results found.</p>
      ) : (
        results.map((result, index) => {
          const detailedResult = JSON.parse(result.detailed_result) as {
            heirs: Heir[];
            blocked_heirs: Record<string, string>;
          };

          const decisionTreeData = generateDecisionTree(
            detailedResult.heirs,
            detailedResult.blocked_heirs
          );

          return (
            <div key={index} className="card">
              <h3>{result.name}</h3>
              
              {/* ✅ Toggle Button for Detailed Results */}
              <button onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}>
                {expandedIndex === index ? "Hide Details" : "View Detailed Results & Decision Tree"}
              </button>

              {/* ✅ Display Decision Tree When Expanded */}
              {expandedIndex === index && (
                <div className="detailed-results">
                  <h4>Decision Tree</h4>
                  <div style={{ width: "100%", height: "400px" }}>
                    <Tree data={decisionTreeData} orientation="vertical" />
                  </div>

                  {/* ✅ Table of Eligible Heirs */}
                  <h4>Eligible Heirs</h4>
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

                  {/* ✅ Blocked Heirs */}
                  {Object.keys(detailedResult.blocked_heirs).length > 0 && (
                    <div className="blocked-heirs">
                      <h4>Blocked Heirs</h4>
                      <ul>
                        {Object.entries(detailedResult.blocked_heirs).map(
                          ([heir, reason], idx) => (
                            <li key={idx}>
                              <strong>{heir.replace("_", " ")}:</strong> {reason}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default InheritanceResults;


// import { useEffect, useState } from "react";
// import useUserInfo from "../hooks/useUserInfo";
// import { Bar, Pie } from "react-chartjs-2";
// import { Chart, registerables } from "chart.js";
// import Tree from "react-d3-tree";

// // Register Chart.js components
// Chart.register(...registerables);

// type InheritanceResult = {
//   name: string;
//   detailed_result: string;
//   json_result: string;
// };

// type Heir = {
//   heir: string;
//   count: number;
//   amount: number;
//   percentage: number;
//   explanation: string;
// };

// const InheritanceResults = () => {
//   const userInfo = useUserInfo();
//   const userId = userInfo?.user_id;
//   const [results, setResults] = useState<InheritanceResult[]>([]);
//   const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

//   useEffect(() => {
//     if (!userId) return;
//     fetch(`http://localhost:5001/get_all_results/${userId}`)
//       .then((response) => response.json())
//       .then((data) => {
//         if (data.success) {
//           setResults(data.results);
//         } else {
//           console.error("Error fetching inheritance results");
//         }
//       })
//       .catch((error) => console.error("Error:", error));
//   }, [userId]);

//   const generateDecisionTree = (heirs: Heir[], blockedHeirs: Record<string, string>) => {
//     const treeData: any = {
//       name: "Inheritance Decision",
//       children: [
//         {
//           name: "Eligible Heirs",
//           children: heirs.map((heir) => ({
//             name: heir.heir,
//             attributes: {
//               Amount: `$${heir.amount.toFixed(2)}`,
//               Percentage: `${heir.percentage.toFixed(2)}%`,
//             },
//           })),
//         },
//         {
//           name: "Blocked Heirs",
//           children: Object.entries(blockedHeirs).map(([heir, reason]) => ({
//             name: heir.replace("_", " "),
//             attributes: { Reason: reason },
//           })),
//         },
//       ],
//     };
//     return treeData;
//     };
//   return (
//     <div className="container">
//       <h2>Inheritance Results</h2>
//       {results.length === 0 ? (
//         <p>No inheritance results found.</p>
//       ) : (
//         results.map((result, index) => {
//           const detailedResult = JSON.parse(result.detailed_result) as {
//             heirs: Heir[];
//             total_distributed: number;
//             remaining_residue: number;
//             blocked_heirs: Record<string, string>;
//           };

//           // Chart Data Preparation
//           const chartLabels = detailedResult.heirs.map((heir) => heir.heir);
//           const chartData = detailedResult.heirs.map((heir) => heir.amount);

//           const barChartData = {
//             labels: chartLabels,
//             datasets: [
//               {
//                 label: "Inheritance Amount ($)",
//                 data: chartData,
//                 backgroundColor: ["#3498db", "#e74c3c", "#2ecc71", "#f39c12"],
//               },
//             ],
//           };

//           const pieChartData = {
//             labels: chartLabels,
//             datasets: [
//               {
//                 data: chartData,
//                 backgroundColor: ["#3498db", "#e74c3c", "#2ecc71", "#f39c12"],
//               },
//             ],
//           };

//           return (
//             <div key={index} className="card">
//               <h3>{result.name}</h3>

//               {/* ✅ Display json_result in a readable format */}
//               <pre className="json-result">
//                 {JSON.stringify(JSON.parse(result.json_result), null, 2)}
//               </pre>

//               {/* ✅ Toggle Button for Detailed Results */}
//               <button
//                 onClick={() =>
//                   setExpandedIndex(expandedIndex === index ? null : index)
//                 }
//               >
//                 {expandedIndex === index
//                   ? "Hide Details"
//                   : "View Detailed Results"}
//               </button>

//               {/* ✅ Display Detailed Results & Charts When Expanded */}
//               {expandedIndex === index && (
//                 <div className="detailed-results">
//                   <table>
//                     <thead>
//                       <tr>
//                         <th>Heir</th>
//                         <th>Count</th>
//                         <th>Amount</th>
//                         <th>Percentage</th>
//                         <th>Explanation</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {detailedResult.heirs.map((heir: Heir, idx: number) => (
//                         <tr key={idx}>
//                           <td>{heir.heir}</td>
//                           <td>{heir.count}</td>
//                           <td>${heir.amount.toFixed(2)}</td>
//                           <td>{heir.percentage.toFixed(2)}%</td>
//                           <td>{heir.explanation}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>

//                   {/* ✅ Blocked Heirs */}
//                   {Object.keys(detailedResult.blocked_heirs).length > 0 && (
//                     <div className="blocked-heirs">
//                       <h4>Blocked Heirs</h4>
//                       <ul>
//                         {Object.entries(detailedResult.blocked_heirs).map(
//                           ([heir, reason], idx) => (
//                             <li key={idx}>
//                               <strong>{heir.replace("_", " ")}:</strong>{" "}
//                               {reason}
//                             </li>
//                           )
//                         )}
//                       </ul>
//                     </div>
//                   )}

//                   <p>
//                     <strong>Total Distributed:</strong> $
//                     {detailedResult.total_distributed.toFixed(2)}
//                   </p>
//                   <p>
//                     <strong>Remaining Residue:</strong> $
//                     {detailedResult.remaining_residue.toFixed(2)}
//                   </p>
//                   {/* ✅ Charts */}
//                   <div className="charts">
//                     <h4>Inheritance Distribution (Bar Chart)</h4>
//                     <Bar data={barChartData} />

//                     <h4>Inheritance Percentage (Pie Chart)</h4>
//                     <Pie data={pieChartData} />
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })
//       )}
//     </div>
//   );
// };

// export default InheritanceResults;

// // import { useEffect, useState } from "react";
// // import useUserInfo from "../hooks/useUserInfo";

// // type InheritanceResult = {
// //   name: string;
// //   detailed_result: string;
// //   json_result: string;
// // };

// // type Heir = {
// //   heir: string;
// //   count: number;
// //   amount: number;
// //   percentage: number;
// //   explanation: string;
// // };

// // const InheritanceResults = () => {
// //   const userInfo = useUserInfo();
// //   const userId = userInfo?.user_id;
// //   const [results, setResults] = useState<InheritanceResult[]>([]);

// //   useEffect(() => {
// //     if (!userId) return;
// //     fetch(`http://localhost:5001/get_all_results/${userId}`)
// //       .then((response) => response.json())
// //       .then((data) => {
// //         if (data.success) {
// //           setResults(data.results);
// //         } else {
// //           console.error("Error fetching inheritance results");
// //         }
// //       })
// //       .catch((error) => console.error("Error:", error));
// //   }, [userId]);

// //   return (
// //     <div className="container">
// //       <h2>Inheritance Results</h2>
// //       {results.length === 0 ? (
// //         <p>No inheritance results found.</p>
// //       ) : (
// //         results.map((result, index) => {
// //           const detailedResult = JSON.parse(result.json_result) as {
// //             heirs: Heir[];
// //             total_distributed: number;
// //             remaining_residue: number;
// //             blocked_heirs: Record<string, string>;
// //           };

// //           return (
// //             <div key={index} className="card">
// //               <h3>{result.name}</h3>
// //               <table>
// //                 <thead>
// //                   <tr>
// //                     <th>Heir</th>
// //                     <th>Count</th>
// //                     <th>Amount</th>
// //                     <th>Percentage</th>
// //                     <th>Explanation</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {detailedResult.heirs.map((heir: Heir, idx: number) => (
// //                     <tr key={idx}>
// //                       <td>{heir.heir}</td>
// //                       <td>{heir.count}</td>
// //                       <td>${heir.amount.toFixed(2)}</td>
// //                       <td>{heir.percentage.toFixed(2)}%</td>
// //                       <td>{heir.explanation}</td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //               {/* ✅ Display Blocked Heirs */}
// //               {Object.keys(detailedResult.blocked_heirs).length > 0 && (
// //                 <div className="blocked-heirs">
// //                   <h4>Blocked Heirs</h4>
// //                   <ul>
// //                     {Object.entries(detailedResult.blocked_heirs).map(
// //                       ([heir, reason], idx) => (
// //                         <li key={idx}>
// //                           <strong>{heir.replace("_", " ")}:</strong> {reason}
// //                         </li>
// //                       )
// //                     )}
// //                   </ul>
// //                 </div>
// //               )}
// //               <p>
// //                 <strong>Total Distributed:</strong> $
// //                 {detailedResult.total_distributed.toFixed(2)}
// //               </p>
// //               <p>
// //                 <strong>Remaining Residue:</strong> $
// //                 {detailedResult.remaining_residue.toFixed(2)}
// //               </p>
// //             </div>
// //           );
// //         })
// //       )}
// //     </div>
// //   );
// // };

// // export default InheritanceResults;
