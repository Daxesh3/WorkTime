import React, { useMemo, useState } from "react";
import { FaClock } from "react-icons/fa";
import useStampConfig from "../../hooks/useStampConfig";
import Modal from "../ui/Modal";
import ShiftTypeSelector, { ShiftType } from "../ui/ShiftTypeSelector";
import useCompanyStore from "../../store/companyStore";

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
  const [selectedShift, setSelectedShift] = useState<ShiftType>("morning");

  const [stampTime, setStampTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const { companies } = useCompanyStore();

  const companyDetails = useMemo(
    () => companies.find((company) => company.id === companyId),
    [companies, companyId]
  );
  console.log("🚀 ~ companyDetails:", companyDetails);

  const availableStamps = getEffectiveStamps(companyId);

  const handleStamp = () => {
    if (!selectedStampType || !employeeName.trim()) return;

    addStampRecord(companyId, {
      employeeName: employeeName.trim(),
      stampType: selectedStampType,
      stampTime: new Date(stampTime).toISOString(),
      shift: selectedShift,
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Time Stamp"
    >
      <div className="flex flex-col gap-3">
        <div>
          <label className="input-label">Employee Name</label>
          <input
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="Enter employee name"
            className="time-input w-full"
            required
          />
        </div>

        {/* <div>
                    <label className='input-label'>Stamp Type</label>
                    <select
                        value={selectedStampType}
                        onChange={(e) => setSelectedStampType(e.target.value)}
                        className='time-input bg-white w-full'
                        required
                    >
                        <option value=''>Select a stamp type</option>
                        {availableStamps.map((stamp) => (
                            <option
                                key={stamp.id}
                                value={stamp.name}
                            >
                                {stamp.name}
                            </option>
                        ))}
                    </select>
                </div> */}
        <div>
          <label className="input-label">Stamp Type</label>
          <div className="flex flex-wrap gap-2">
            {availableStamps.map((stamp) => (
              <label
                key={stamp.id}
                className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer ${
                  selectedStampType === stamp.name
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="stampType"
                  value={stamp.name}
                  checked={selectedStampType === stamp.name}
                  onChange={(e) => setSelectedStampType(e.target.value)}
                  className="hidden"
                />
                <span className="text-sm font-medium">{stamp.name}</span>
              </label>
            ))}
          </div>
        </div>

        <ShiftTypeSelector
          company={companyDetails?.name}
          value={selectedShift}
          onChange={(value) => setSelectedShift(value)}
        />

        <div>
          <label className="input-label">Stamp Time</label>
          <input
            type="datetime-local"
            value={stampTime}
            onChange={(e) => setStampTime(e.target.value)}
            className="time-input w-full"
            required
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleStamp}
            className="btn btn-primary"
            disabled={!selectedStampType || !employeeName.trim()}
          >
            <FaClock />
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
