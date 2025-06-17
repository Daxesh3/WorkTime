import React from "react";
import { FiSettings, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface StampTypesNavigationProps {
  companyId?: string;
}

const StampTypesNavigation: React.FC<StampTypesNavigationProps> = ({
  companyId,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (companyId) {
      navigate(`/companies/${companyId}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <button onClick={handleBack} className="btn btn-secondary btn-sm">
          <FiArrowLeft className="mr-2" />
          Back
        </button>
        <div className="flex items-center">
          <FiSettings className="mr-2 text-neutral-600" />
          <h1 className="text-xl font-semibold">
            {companyId
              ? "Company Stamp Configuration"
              : "Global Stamp Configuration"}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default StampTypesNavigation;
