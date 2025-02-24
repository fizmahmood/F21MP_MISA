import React, { useState, useEffect } from "react";
import axios from "axios";

interface UserFacts {
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
}

const EditableForm: React.FC = () => {
  const [userFacts, setUserFacts] = useState<UserFacts | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<UserFacts | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Retrieve user ID from localStorage
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        if (parsedUserInfo.user_id) {
          setUserId(parsedUserInfo.user_id);
        } else {
          console.error("User ID not found in localStorage");
        }
      } catch (error) {
        console.error("Error parsing userInfo from localStorage:", error);
      }
    }
  }, []);

  // Fetch user facts when userId is set
  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:5001/get_facts/${userId}`)
        .then((response) => {
          if (response.data.success) {
            setUserFacts(response.data.user_facts);
            setFormData(response.data.user_facts);
          } else {
            console.warn("No data found");
          }
        })
        .catch((error) => {
          console.error("Error fetching user facts:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [userId]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({
        ...formData,
        [e.target.name]: Number(e.target.value), // Ensure values are numbers
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !userId) return;

    axios
      .put(`http://localhost:5001/update_facts/${userId}`, formData)
      .then((response) => {
        if (response.data.success) {
          setUserFacts(formData); // Update displayed data
          setIsEditing(false);
          alert("Data updated successfully!");
        } else {
          alert("Failed to update data.");
        }
      })
      .catch((error) => {
        console.error("Error updating user facts:", error);
      });
  };

  if (isLoading) return <p>Loading...</p>;
  if (!userId) return <p>Error: User ID not found in localStorage.</p>;
  if (!userFacts) return <p>No data found for this user.</p>;

  return (
    <div>
      <h2>User Facts</h2>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          {Object.keys(userFacts).map((key) =>
            key !== "Users_user_id" ? (
              <div key={key}>
                <label>{key.replace(/_/g, " ")}: </label>
                <input
                  type="number"
                  name={key}
                  value={formData ? formData[key as keyof UserFacts] : ""}
                  onChange={handleChange}
                />
              </div>
            ) : null
          )}
          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <div>
          {Object.entries(userFacts).map(([key, value]) =>
            key !== "Users_user_id" ? (
              <p key={key}>
                <strong>{key.replace(/_/g, " ")}:</strong> {value}
              </p>
            ) : null
          )}
          <button onClick={() => setIsEditing(true)}>Edit</button>
        </div>
      )}
    </div>
  );
};

export default EditableForm;