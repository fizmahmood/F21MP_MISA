import React from "react";

interface InputProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputGroup: React.FC<InputProps> = ({ label, name, value, onChange }) => {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input type="number" className="form-control" name={name} value={value} onChange={onChange} required />
    </div>
  );
};

export default InputGroup;