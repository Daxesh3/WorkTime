import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import useStampConfig from "../../hooks/useStampConfig";
import Card from "../ui/Card";

const GlobalStampManager: React.FC = () => {
  const { getGlobalConfig, updateGlobalConfig } = useStampConfig();
  const [newStampName, setNewStampName] = useState("");
  const [editingStamp, setEditingStamp] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const stamps = getGlobalConfig();

  const handleAddStamp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStampName.trim()) return;

    const newStamp = {
      id: `stamp-${Date.now()}`,
      name: newStampName.trim(),
    };

    updateGlobalConfig([...stamps, newStamp]);
    setNewStampName("");
  };

  const handleEditStamp = (id: string, newName: string) => {
    const updatedStamps = stamps.map((stamp) =>
      stamp.id === id ? { ...stamp, name: newName } : stamp
    );
    updateGlobalConfig(updatedStamps);
    setEditingStamp(null);
  };

  const handleDeleteStamp = (id: string) => {
    const updatedStamps = stamps.filter((stamp) => stamp.id !== id);
    updateGlobalConfig(updatedStamps);
  };

  return (
    <Card title="Global Stamp Types" className="w-full">
      <div className="space-y-6">
        <form onSubmit={handleAddStamp} className="flex gap-2">
          <input
            type="text"
            value={newStampName}
            onChange={(e) => setNewStampName(e.target.value)}
            placeholder="Enter new stamp type"
            className="input flex-1"
            required
          />
          <button type="submit" className="btn btn-primary">
            <FiPlus className="mr-2" />
            Add Stamp
          </button>
        </form>

        <div className="space-y-2">
          {stamps.map((stamp) => (
            <div
              key={stamp.id}
              className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
            >
              {editingStamp?.id === stamp.id ? (
                <input
                  type="text"
                  value={editingStamp.name}
                  onChange={(e) =>
                    setEditingStamp({ ...editingStamp, name: e.target.value })
                  }
                  onBlur={() => handleEditStamp(stamp.id, editingStamp.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleEditStamp(stamp.id, editingStamp.name);
                    }
                  }}
                  className="input flex-1"
                  autoFocus
                />
              ) : (
                <span className="font-medium">{stamp.name}</span>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingStamp(stamp)}
                  className="btn btn-secondary btn-sm"
                >
                  <FiEdit2 />
                </button>
                <button
                  onClick={() => handleDeleteStamp(stamp.id)}
                  className="btn btn-danger btn-sm"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default GlobalStampManager;
