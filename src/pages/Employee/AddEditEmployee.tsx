import React, { useMemo, useState } from "react";
import {
  FiCheck,
  FiCoffee,
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import { format } from "date-fns";
import { FaPlus } from "react-icons/fa";

import { Break, EmployeeRecord } from "../../shared/types";
import Modal from "../../components/ui/Modal";
import TimePicker from "../../components/ui/TimePicker";
import useCompanyStore from "../../store/companyStore";
import useWorkTimeStore from "../../store/workTimeStore";
import Card from "../../components/ui/Card";
import ShiftTypeSelector from "../../components/ui/ShiftTypeSelector";
import CompanySelector from "../../components/ui/CompanySelector";
import { ShiftTiming } from "../Shifts/Shift.types";

interface AddEditEmployeeProps {
  editingId: string | null;
  isOpen: boolean;
  isAddingRecord: boolean;
  onClose: () => void;
  editingDateId: string | null;
}

// Helper function outside the component
const calculateLunchEnd = (startTime: string, durationMinutes: number) => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  return `${endDate.getHours().toString().padStart(2, "0")}:${endDate
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const AddEditEmployee: React.FC<AddEditEmployeeProps> = ({
  isOpen,
  editingId,
  isAddingRecord,
  onClose,
  editingDateId,
}) => {
  const { companies } = useCompanyStore();
  const {
    parameters,
    employeeRecords,
    addEmployeeRecord,
    updateEmployeeRecord,
  } = useWorkTimeStore();

  const initialRecord: EmployeeRecord = useMemo(
    () => ({
      id: "",
      name: "",
      shift: companies[0]?.shifts[0] || ({} as ShiftTiming),
      company: companies[0]?.name || "",
      date: editingDateId
        ? format(new Date(editingDateId), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      clockIn: parameters.workingHours.start,
      clockOut: parameters.workingHours.end,
      lunchStart: parameters.lunchBreak.defaultStart,
      lunchEnd: calculateLunchEnd(
        parameters.lunchBreak.defaultStart,
        parameters.lunchBreak.duration
      ),
      breaks: [],
    }),
    [parameters, editingDateId]
  );

  const editedRecord = useMemo(() => {
    if (!editingId || !editingDateId) return null;
    const employee = employeeRecords.filter((r) => r.id === editingId);
    if (employee.length === 0) return null;
    initialRecord.name = employee[0].name;
    return employee.find((r) => r.dateId === editingDateId);
  }, [employeeRecords, editingId, editingDateId]);

  const [newRecord, setNewRecord] = useState<EmployeeRecord>(
    isAddingRecord ? initialRecord : (editedRecord || initialRecord)!
  );

  const handleFieldChange = (field: keyof EmployeeRecord, value: any) => {
    setNewRecord((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };

  const handleCompanyOrShiftChange = (
    field: "company" | "shift",
    value: string
  ) => {
    const updatedRecord = { ...newRecord, [field]: value };

    // Get the selected company
    const companyData = companies.find((c) => c.name === updatedRecord.company);

    if (companyData) {
      // Get the selected shift or default to the first shift
      const selectedShift =
        companyData.shifts.find(
          (s) => s.name === (updatedRecord.shift as any)
        ) || companyData.shifts[0];

      // Update the record with the selected shift's timings
      updatedRecord.shift = selectedShift;
      updatedRecord.clockIn = selectedShift.start;
      updatedRecord.clockOut = selectedShift.end;
      updatedRecord.lunchStart = selectedShift.lunchBreak.defaultStart;
      updatedRecord.lunchEnd = calculateLunchEnd(
        selectedShift.lunchBreak.defaultStart,
        selectedShift.lunchBreak.duration
      );
    }

    setNewRecord(updatedRecord);
  };

  const modifyBreaks = (breaks: Break[], index: number, newBreak?: Break) => {
    const updated = [...breaks];
    if (newBreak) {
      updated[index] = newBreak;
    } else {
      updated.splice(index, 1);
    }
    return updated;
  };

  const handleBreakChange = (
    index: number,
    field: keyof Break,
    value: string
  ) => {
    setNewRecord((prev) => ({
      ...prev,
      breaks: modifyBreaks(prev.breaks, index, {
        ...prev.breaks[index],
        [field]: value,
      }),
    }));
  };

  const handleAddBreak = () => {
    const start = "10:00";
    const end = calculateLunchEnd(start, 15);
    const newBreak = { start, end } as Break;
    setNewRecord((prev) => ({ ...prev, breaks: [...prev.breaks, newBreak] }));
  };

  const handleRemoveBreak = (index: number) => {
    setNewRecord((prev) => ({
      ...prev,
      breaks: prev.breaks.filter((_, i) => i !== index),
    }));
  };

  const handleAddRecord = () => {
    if (!editedRecord || isAddingRecord) {
      addEmployeeRecord(newRecord);
    } else if (editedRecord.dateId) {
      updateEmployeeRecord(editedRecord.id, editedRecord.dateId, newRecord);
    }
    onClose();
  };

  return (
    <Modal
      size="4xl"
      isOpen={isOpen}
      onClose={onClose}
      title={isAddingRecord ? "Add Record" : "Edit Record"}
      icon={isAddingRecord ? <FaPlus /> : <FiEdit2 />}
      footer={
        <div className="flex space-x-2">
          <button className="btn btn-secondary" onClick={onClose}>
            <FiX /> Cancel
          </button>
          <button className="btn btn-primary" onClick={handleAddRecord}>
            <FiCheck /> {isAddingRecord ? "Add" : "Save"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <Card title="Basic Information" icon={<FiUser size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* {isAddingRecord && ( */}
            <div>
              <label className="input-label">Employee Name</label>
              <input
                disabled={!isAddingRecord}
                type="text"
                value={newRecord.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                className="time-input w-full"
                placeholder="Enter employee name"
              />
            </div>
            {/* )} */}
            <div>
              <label className="input-label">Date</label>
              <input
                type="date"
                value={newRecord.date}
                onChange={(e) => handleFieldChange("date", e.target.value)}
                className="time-input w-full"
              />
            </div>
            <CompanySelector
              value={newRecord.company}
              onChange={(value) => handleCompanyOrShiftChange("company", value)}
            />
            <ShiftTypeSelector
              company={newRecord.company}
              value={newRecord.shift.name}
              onChange={(value) => handleCompanyOrShiftChange("shift", value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <TimePicker
                className="w-full"
                label="Clock In"
                value={newRecord.clockIn}
                onChange={(value) => handleFieldChange("clockIn", value)}
              />
              <TimePicker
                className="w-full"
                label="Clock Out"
                value={newRecord.clockOut}
                onChange={(value) => handleFieldChange("clockOut", value)}
              />
            </div>
          </div>
        </Card>
        <Card title="Break Duration" icon={<FiCoffee />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <TimePicker
                className="w-full"
                label="Lunch Start"
                value={newRecord.lunchStart}
                onChange={(value) => handleFieldChange("lunchStart", value)}
              />
              <TimePicker
                className="w-full"
                label="Lunch End"
                value={newRecord.lunchEnd}
                onChange={(value) => handleFieldChange("lunchEnd", value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="input-label">Additional Breaks</label>
                <button
                  type="button"
                  className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                  onClick={handleAddBreak}
                >
                  <FiPlus className="mr-1" /> Add Break
                </button>
              </div>

              <div className="space-y-1">
                {(newRecord.breaks || []).map((b, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 p-2 border border-neutral-200 rounded-lg bg-neutral-50"
                  >
                    <TimePicker
                      value={b.start}
                      onChange={(val) => handleBreakChange(idx, "start", val)}
                      className="w-24 text-sm"
                    />
                    <span className="text-neutral-400">to</span>
                    <TimePicker
                      value={b.end}
                      onChange={(val) => handleBreakChange(idx, "end", val)}
                      className="w-24 text-sm"
                    />
                    <button
                      type="button"
                      className="text-error-500 hover:text-error-700 ml-auto"
                      onClick={() => handleRemoveBreak(idx)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
                {(newRecord.breaks || []).length === 0 && (
                  <div className="text-sm text-neutral-500 italic p-2">
                    No additional breaks added
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
};

export default AddEditEmployee;
