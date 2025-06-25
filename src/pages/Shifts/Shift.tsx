import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";

import { ShiftManagementProps, ShiftTiming } from "./Shift.types";
import TableComponent from "../../components/table/table";
import TableHeader, { ITableCell } from "../../components/table/tableHeader";
import TableBody from "../../components/table/tableBody";
import EmptyTable from "../../components/table/emptyTable";
import ShiftRow from "./shiftRow";
import AddEditShift from "./AddEditShift";

const ShiftManagement: React.FC<ShiftManagementProps> = ({
  companyName,
  shifts,
  onShiftCreate,
  onShiftDelete,
  onShiftUpdate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftTiming | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (shift?: ShiftTiming) => {
    setEditingShift(shift || defaultShift);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingShift(null);
    setIsModalOpen(false);
  };

  const handleSaveShift = async () => {
    if (!editingShift) return;

    setLoading(true);
    try {
      if ("id" in editingShift) {
        await onShiftUpdate(editingShift);
      } else {
        await onShiftCreate(editingShift);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving shift:", error);
      // Add error handling/notification here
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      setLoading(true);
      try {
        await onShiftDelete(shiftId);
      } catch (error) {
        console.error("Error deleting shift:", error);
        // Add error handling/notification here
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="space-y-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-800">
              Shift Management
            </h1>
            <p className="text-neutral-500 mt-1">{companyName}</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary"
            disabled={loading}
          >
            <FaPlus /> Add New Shift
          </button>
        </div>

        <TableComponent className="mt-4">
          <TableHeader tableCellList={Table_Cells} />
          <TableBody>
            {(!shifts || shifts.length <= 0) && (
              <EmptyTable text="No shifts found" colSpan={Table_Cells.length} />
            )}
            {shifts &&
              shifts.length > 0 &&
              shifts.map((shift, index) => {
                return (
                  <ShiftRow
                    key={shift.id}
                    shift={shift}
                    length={shifts.length}
                    index={index + 1}
                    onEdit={() => handleOpenModal(shift)}
                    onDelete={() => handleDeleteShift(shift.id!)}
                  />
                );
              })}
          </TableBody>
        </TableComponent>
      </div>
      {isModalOpen && (
        <AddEditShift
          isOpen={isModalOpen}
          editingShift={editingShift}
          onClose={handleCloseModal}
          onSave={handleSaveShift}
          setEditingShift={setEditingShift}
        />
      )}
    </>
  );
};

const defaultShift: ShiftTiming = {
  name: "regular",
  start: "09:00",
  end: "17:00",
  lunchBreak: {
    defaultStart: "12:00",
    duration: 60,
    flexWindowStart: "11:30",
    flexWindowEnd: "13:30",
  },
  shiftBonus: {
    isShiftBonus: false,
    bonusAmount: 0,
  },
  earlyArrival: {
    maxMinutes: 30,
    countTowardsTotal: true,
  },
  lateStay: {
    maxMinutes: 30,
    countTowardsTotal: true,
    overtimeMultiplier: 1.5,
  },
  overtime: {
    freeOvertimeDuration: "00:30",
    nextOvertimeDuration: "02:00",
    nextOvertimeMultiplier: 1.5,
    beyondOvertimeMultiplier: 2.0,
  },
};

const Table_Cells: ITableCell[] = [
  { title: "No", key: "", style: { width: "80px" } },
  { title: "Shift Type", key: "shift_type" },
  { title: "Working Hours", key: "working_hours" },
  { title: "Lunch Break", key: "lunch_break" },
  { title: "Policies ", key: "policies" },
  {
    title: "Action",
    key: "action",
    style: { width: "120px" },
    align: "center",
  },
];

export default ShiftManagement;
