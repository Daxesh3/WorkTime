import React from "react";
import { useParams } from "react-router-dom";
import StampTypesNavigation from "../../components/stampTypes/StampTypesNavigation";
import GlobalStampManager from "../../components/stampTypes/GlobalStampManager";
import CompanyStampManager from "../../components/stampTypes/CompanyStampManager";

const StampTypes: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();

  return (
    <div className="container mx-auto px-4 py-6">
      <StampTypesNavigation companyId={companyId} />
      <div className="space-y-6">
        {companyId ? (
          <CompanyStampManager companyId={companyId} />
        ) : (
          <GlobalStampManager />
        )}
      </div>
    </div>
  );
};

export default StampTypes;
