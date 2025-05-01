import { FC } from 'react';
import useCompanyStore from '../../store/companyStore';

interface ShiftTypeSelectorProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    disabled?: boolean;
    label?: string;
}

const CompanySelector: FC<ShiftTypeSelectorProps> = ({ value, onChange, className = '', disabled = false, label = 'Company' }) => {
    const { companies } = useCompanyStore();

    return (
        <div className='flex flex-col space-y-1'>
            {label && <label className='text-sm font-medium text-neutral-700'>{label}</label>}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`time-input h-full bg-white border border-neutral-300 rounded-lg shadow-sm text-neutral-700 disabled:bg-neutral-100 disabled:cursor-not-allowed ${className}`}
            >
                {companies.map((company) => (
                    <option key={company.id} value={company.name}>
                        {company.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CompanySelector;
