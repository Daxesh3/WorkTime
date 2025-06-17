import { useState, useEffect } from "react";

interface Stamp {
  id: string;
  name: string;
}

interface CompanyConfig {
  configType: "global" | "custom";
  stamps?: Stamp[];
}

const DEFAULT_GLOBAL_STAMPS: Stamp[] = [
  { id: "stamp-1", name: "In" },
  { id: "stamp-2", name: "Out" },
  { id: "stamp-3", name: "To lunch" },
  { id: "stamp-4", name: "From lunch" },
  { id: "stamp-5", name: "Job change" },
  { id: "stamp-6", name: "Over time in" },
  { id: "stamp-7", name: "Over time out" },
];

const useStampConfig = () => {
  const [globalConfig, setGlobalConfig] = useState<Stamp[]>([]);
  const [companyConfigs, setCompanyConfigs] = useState<
    Record<string, CompanyConfig>
  >({});

  // Initialize configurations from localStorage
  useEffect(() => {
    const storedGlobalConfig = localStorage.getItem("GlobalTimeConfig");
    const storedCompanyConfigs = localStorage.getItem("CompanyConfigs");

    if (!storedGlobalConfig) {
      localStorage.setItem(
        "GlobalTimeConfig",
        JSON.stringify(DEFAULT_GLOBAL_STAMPS)
      );
      setGlobalConfig(DEFAULT_GLOBAL_STAMPS);
    } else {
      setGlobalConfig(JSON.parse(storedGlobalConfig));
    }

    if (storedCompanyConfigs) {
      setCompanyConfigs(JSON.parse(storedCompanyConfigs));
    }
  }, []);

  const getGlobalConfig = (): Stamp[] => {
    return globalConfig;
  };

  const updateGlobalConfig = (newConfig: Stamp[]) => {
    localStorage.setItem("GlobalTimeConfig", JSON.stringify(newConfig));
    setGlobalConfig(newConfig);
  };

  const getCompanyConfig = (companyId: string): CompanyConfig | undefined => {
    return companyConfigs[companyId];
  };

  const setCompanyConfig = (companyId: string, config: CompanyConfig) => {
    const newCompanyConfigs = {
      ...companyConfigs,
      [companyId]: config,
    };
    localStorage.setItem("CompanyConfigs", JSON.stringify(newCompanyConfigs));
    setCompanyConfigs(newCompanyConfigs);
  };

  const getEffectiveStamps = (companyId: string): Stamp[] => {
    const companyConfig = getCompanyConfig(companyId);

    if (!companyConfig || companyConfig.configType === "global") {
      return getGlobalConfig();
    }

    return companyConfig.stamps || [];
  };

  return {
    getGlobalConfig,
    updateGlobalConfig,
    getCompanyConfig,
    setCompanyConfig,
    getEffectiveStamps,
  };
};

export default useStampConfig;
