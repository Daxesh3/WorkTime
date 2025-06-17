import { useState, useEffect } from 'react';

interface Stamp {
    id: string;
    name: string;
}

interface CompanyConfig {
    configType: 'global' | 'custom';
    stamps?: Stamp[];
}

interface StampRecord {
    id: string;
    companyId: string;
    employeeName: string;
    stampType: string;
    stampTime: string;
    shift: string;
}

const DEFAULT_GLOBAL_STAMPS: Stamp[] = [
    { id: 'stamp-1', name: 'In' },
    { id: 'stamp-2', name: 'Out' },
    { id: 'stamp-3', name: 'To lunch' },
    { id: 'stamp-4', name: 'From lunch' },
    { id: 'stamp-5', name: 'Job change' },
    { id: 'stamp-6', name: 'Over time in' },
    { id: 'stamp-7', name: 'Over time out' },
];

const useStampConfig = () => {
    const [globalConfig, setGlobalConfig] = useState<Stamp[]>([]);
    const [companyConfigs, setCompanyConfigs] = useState<Record<string, CompanyConfig>>({});
    const [stampRecords, setStampRecords] = useState<Record<string, StampRecord[]>>({});

    // Initialize configurations from localStorage
    useEffect(() => {
        const storedGlobalConfig = localStorage.getItem('GlobalTimeConfig');
        const storedCompanyConfigs = localStorage.getItem('CompanyConfigs');
        const storedStampRecords = localStorage.getItem('StampRecords');

        if (!storedGlobalConfig) {
            localStorage.setItem('GlobalTimeConfig', JSON.stringify(DEFAULT_GLOBAL_STAMPS));
            setGlobalConfig(DEFAULT_GLOBAL_STAMPS);
        } else {
            setGlobalConfig(JSON.parse(storedGlobalConfig));
        }

        if (storedCompanyConfigs) {
            setCompanyConfigs(JSON.parse(storedCompanyConfigs));
        }

        if (storedStampRecords) {
            setStampRecords(JSON.parse(storedStampRecords));
        }
    }, []);

    const getGlobalConfig = (): Stamp[] => {
        return globalConfig;
    };

    const updateGlobalConfig = (newConfig: Stamp[]) => {
        localStorage.setItem('GlobalTimeConfig', JSON.stringify(newConfig));
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
        localStorage.setItem('CompanyConfigs', JSON.stringify(newCompanyConfigs));
        setCompanyConfigs(newCompanyConfigs);
    };

    const getEffectiveStamps = (companyId: string): Stamp[] => {
        const companyConfig = getCompanyConfig(companyId);

        if (!companyConfig || companyConfig.configType === 'global') {
            return getGlobalConfig();
        }

        return companyConfig.stamps || [];
    };

    const addStampRecord = (companyId: string, recordData: { employeeName: string; stampType: string; stampTime?: string; shift?: string }) => {
        const newRecord: StampRecord = {
            id: `rec-${Date.now()}`,
            companyId,
            employeeName: recordData.employeeName,
            stampType: recordData.stampType,
            stampTime: recordData.stampTime || new Date().toISOString(),
            shift: recordData.shift || 'regular',
        };

        const companyRecords = stampRecords[companyId] || [];
        const newRecords = {
            ...stampRecords,
            [companyId]: [...companyRecords, newRecord],
        };

        localStorage.setItem('StampRecords', JSON.stringify(newRecords));
        setStampRecords(newRecords);
    };

    const getStampsForCompany = (companyId: string): StampRecord[] => {
        return stampRecords[companyId] || [];
    };

    return {
        getGlobalConfig,
        updateGlobalConfig,
        getCompanyConfig,
        setCompanyConfig,
        getEffectiveStamps,
        addStampRecord,
        getStampsForCompany,
    };
};

export default useStampConfig;
