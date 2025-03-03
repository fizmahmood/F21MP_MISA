import { useState, useEffect } from "react";
import { api } from "../api/api";

interface Facts {
  father: number;
  mother: number;
  brothers: number;
  sisters: number;
  husband: number;
  wife: number;
  sons: number;
  daughters: number;
  grandsons: number;
  granddaughters: number;
  paternal_grandfather: number;
  paternal_grandmother: number;
  maternal_grandfather: number;
  maternal_grandmother: number;
  will_amount: number;
  networth: number;
  Users_user_id: number;
  facts_id: number;
}

const useFacts = (userId: number | null) => {
  const [facts, setFacts] = useState<Facts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      console.warn("⚠️ No userId provided. Skipping fetch.");
      return;
    }
    
    console.log(`🚀 Fetching facts for userId: ${userId}`);

    const fetchFacts = async () => {
      try {
        const response = await api.get(`/get_facts/${userId}`);
        console.log("📨 API Response:", response.data);

        if (response.data.success) {
          console.log("✅ Facts received:", response.data.user_facts);
          setFacts(response.data.user_facts);
        } else {
          console.warn("⚠️ No facts found for this user.");
          setError("No facts found");
        }
      } catch (err) {
        console.error("❌ Error retrieving facts:", err);
        setError("Error retrieving facts");
      } finally {
        setLoading(false);
      }
    };

    fetchFacts();
  }, [userId]);

  useEffect(() => {
    if (facts) {
      console.log("💾 Storing facts_id in localStorage:", facts.facts_id);
      localStorage.setItem("facts_id", String(facts.facts_id));
    }
  }, [facts]);

  return { facts, loading, error };
};

export default useFacts;

// import { useState, useEffect } from "react";
// import { api } from "../api/api";

// interface Facts {
//   father: number;
//   mother: number;
//   brothers: number;
//   sisters: number;
//   husband: number;
//   wife: number;
//   sons: number;
//   daughters: number;
//   grandsons: number;
//   granddaughters: number;
//   paternal_grandfather: number;
//   paternal_grandmother: number;
//   maternal_grandfather: number;
//   maternal_grandmother: number;
//   will_amount: number;
//   networth: number;
//   Users_user_id: number;
//   facts_id: number;
// }

// const useFacts = (userId: number | null) => {
//   const [facts, setFacts] = useState<Facts | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!userId) return;
    
//     const fetchFacts = async () => {
//       try {
//         const response = await api.get(`/get_facts/${userId}`);
//         if (response.data.success) {
//           setFacts(response.data.user_facts); // ✅ State updates asynchronously
//         } else {
//           setError("No facts found");
//         }
//       } catch (err) {
//         setError("Error retrieving facts");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFacts();
//   }, [userId]);

//   // ✅ Log facts when they change
//   useEffect(() => {
//     if (facts) {
//       console.log("Updated Facts:", facts);
//       localStorage.setItem("facts_id", String(facts.facts_id)); // ✅ Save only after state update
//     }
//   }, [facts]);

//   return { facts, loading, error };
// };

// export default useFacts;