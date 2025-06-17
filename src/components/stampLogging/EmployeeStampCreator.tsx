import React, { useState } from "react";
import { FiClock } from "react-icons/fi";
import useStampConfig from "../../hooks/useStampConfig";
import Modal from "../ui/Modal";

interface EmployeeStampCreatorProps {
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeStampCreator: React.FC<EmployeeStampCreatorProps> = ({
  companyId,
  isOpen,
  onClose,
}) => {
  const { getEffectiveStamps, addStampRecord } = useStampConfig();
  const [employeeName, setEmployeeName] = useState("");
  const [selectedStampType, setSelectedStampType] = useState("");
  const [stampTime, setStampTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const availableStamps = getEffectiveStamps(companyId);

  const handleStamp = () => {
    if (!selectedStampType || !employeeName.trim()) return;

    addStampRecord(companyId, {
      employeeName: employeeName.trim(),
      stampType: selectedStampType,
      stampTime: new Date(stampTime).toISOString(),
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
      // Reset form
      setEmployeeName("");
      setSelectedStampType("");
      setStampTime(new Date().toISOString().slice(0, 16));
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Time Stamp">
      <div className="space-y-6">
        <div>
          <label className="input-label">Employee Name</label>
          <input
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="Enter employee name"
            className="input w-full"
            required
          />
        </div>

        <div>
          <label className="input-label">Stamp Type</label>
          <select
            value={selectedStampType}
            onChange={(e) => setSelectedStampType(e.target.value)}
            className="input w-full"
            required
          >
            <option value="">Select a stamp type</option>
            {availableStamps.map((stamp) => (
              <option key={stamp.id} value={stamp.name}>
                {stamp.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="input-label">Stamp Time</label>
          <input
            type="datetime-local"
            value={stampTime}
            onChange={(e) => setStampTime(e.target.value)}
            className="input w-full"
            required
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleStamp}
            className="btn btn-primary"
            disabled={!selectedStampType || !employeeName.trim()}
          >
            <FiClock className="mr-2" />
            Create Stamp
          </button>
        </div>

        {showSuccess && (
          <div className="text-success-600 text-center animate-fade-in">
            Stamped successfully!
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EmployeeStampCreator;
