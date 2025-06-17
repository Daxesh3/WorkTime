import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import useStampConfig from "../../hooks/useStampConfig";
import Card from "../ui/Card";

interface CompanyStampManagerProps {
  companyId: string;
}

const CompanyStampManager: React.FC<CompanyStampManagerProps> = ({
  companyId,
}) => {
  const { getCompanyConfig, setCompanyConfig, getGlobalConfig } =
    useStampConfig();
  const [newStampName, setNewStampName] = useState("");
  const [editingStamp, setEditingStamp] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const companyConfig = getCompanyConfig(companyId);
  const configType = companyConfig?.configType || "global";
  const stamps =
    configType === "global" ? getGlobalConfig() : companyConfig?.stamps || [];

  const handleConfigTypeChange = (type: "global" | "custom") => {
    if (type === "global") {
      setCompanyConfig(companyId, { configType: "global" });
    } else {
      setCompanyConfig(companyId, {
        configType: "custom",
        stamps: getGlobalConfig(),
      });
    }
  };

  const handleAddStamp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStampName.trim() || configType === "global") return;

    const newStamp = {
      id: `stamp-${Date.now()}`,
      name: newStampName.trim(),
    };

    setCompanyConfig(companyId, {
      configType: "custom",
      stamps: [...stamps, newStamp],
    });
    setNewStampName("");
  };

  const handleEditStamp = (id: string, newName: string) => {
    if (configType === "global") return;

    const updatedStamps = stamps.map((stamp) =>
      stamp.id === id ? { ...stamp, name: newName } : stamp
    );
    setCompanyConfig(companyId, {
      configType: "custom",
      stamps: updatedStamps,
    });
    setEditingStamp(null);
  };

  const handleDeleteStamp = (id: string) => {
    if (configType === "global") return;

    const updatedStamps = stamps.filter((stamp) => stamp.id !== id);
    setCompanyConfig(companyId, {
      configType: "custom",
      stamps: updatedStamps,
    });
  };

  return (
    <Card title="Company Stamp Configuration" className="w-full">
      <div className="space-y-6">
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={configType === "global"}
              onChange={() => handleConfigTypeChange("global")}
              className="form-radio"
            />
            Use Global Configuration
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={configType === "custom"}
              onChange={() => handleConfigTypeChange("custom")}
              className="form-radio"
            />
            Use Custom Configuration
          </label>
        </div>

        {configType === "custom" && (
          <>
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
                        setEditingStamp({
                          ...editingStamp,
                          name: e.target.value,
                        })
                      }
                      onBlur={() =>
                        handleEditStamp(stamp.id, editingStamp.name)
                      }
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
          </>
        )}
      </div>
    </Card>
  );
};

export default CompanyStampManager;
