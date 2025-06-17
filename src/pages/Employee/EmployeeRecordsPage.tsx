import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { FiClock, FiPlus } from "react-icons/fi";
import useStampConfig from "../../hooks/useStampConfig";
import Card from "../../components/ui/Card";
import TitleText from "../../components/ui/header";
import EmployeeStampCreator from "../../components/stampLogging/EmployeeStampCreator";

const EmployeeRecordsPage: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { getStampsForCompany } = useStampConfig();
  const [showStampCreator, setShowStampCreator] = useState(false);

  if (!companyId) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-600">Company ID is required.</p>
      </div>
    );
  }

  const records = getStampsForCompany(companyId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <TitleText
          title="Employee Stamp Records"
          subtitle="View all time stamp records for this company"
        />
        <button
          onClick={() => setShowStampCreator(true)}
          className="btn btn-primary"
        >
          <FiPlus className="mr-2" />
          New Stamp
        </button>
      </div>

      <EmployeeStampCreator
        companyId={companyId}
        isOpen={showStampCreator}
        onClose={() => setShowStampCreator(false)}
      />

      {records.length > 0 ? (
        <Card className="w-full">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">
                    Employee Name
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">
                    Stamp Type
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-2 text-sm text-neutral-900">
                      {record.employeeName}
                    </td>
                    <td className="px-4 py-2 text-sm text-neutral-900">
                      {record.stampType}
                    </td>
                    <td className="px-4 py-2 text-sm text-neutral-900">
                      {new Date(record.stampTime).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="w-full">
          <div className="text-center py-8">
            <p className="text-neutral-600">No stamp records found.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EmployeeRecordsPage;
