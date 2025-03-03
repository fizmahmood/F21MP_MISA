import React, { useEffect, useState } from "react";
import { api } from "../api/api";
// import axios from "axios";

const FactsLoader: React.FC = () => {
  const [factsId, setFactsId] = useState<string | null>(localStorage.getItem("facts_id"));

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    const userin = userInfo ? JSON.parse(userInfo) : null;
    const user_id = userin?.user_id;

    console.log("📝 Checking FactsLoader...");
    console.log("User ID:", user_id);
    console.log("Stored Facts ID:", factsId);

    if (!user_id) {
      console.error("❌ User ID not found!");
      return;
    }

    if (!factsId) {
      console.warn("⚠️ Facts ID missing! Fetching from API...");
      api.get(`/get_facts/${user_id}`)
        .then((response) => {
          if (response.data.success) {
            console.log("✅ Facts received:", response.data.user_facts);
            const fetchedFactsId = String(response.data.user_facts.facts_id);
            setFactsId(fetchedFactsId);
            localStorage.setItem("facts_id", fetchedFactsId);
          } else {
            console.warn("⚠️ No facts found for this user.");
          }
        })
        .catch((error) => {
          console.error("❌ Error fetching facts:", error);
        });
    } else {
      console.log("✅ Facts ID found in localStorage:", factsId);
    }
  }, [factsId]);

  return null; // This component does not render anything
};

export default FactsLoader;