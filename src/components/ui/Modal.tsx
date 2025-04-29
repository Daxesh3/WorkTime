import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '5xl' | '7xl'; // Modal size options
    footer?: React.ReactNode; // Optional footer content
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
    if (!isOpen) return null;

    // Map size to TailwindCSS width classes
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
        '5xl': 'max-w-5xl',
        '7xl': 'max-w-7xl',
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in'>
            <div className={`relative bg-white rounded-lg shadow-lg w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden animate-scale-in`}>
                {/* Modal Header */}
                <div className='flex justify-between items-center py-2 px-4 border-b'>
                    <h2 className='text-lg font-semibold text-neutral-800'>{title}</h2>
                    <button onClick={onClose} className='text-neutral-500 hover:text-neutral-700 focus:outline-none'>
                        <FaTimes />
                    </button>
                </div>

                {/* Modal Content */}
                <div className='p-4 overflow-y-auto max-h-[70vh]'>{children}</div>

                {/* Modal Footer (optional) */}
                {footer && <div className='flex justify-end items-center p-4 border-t'>{footer}</div>}
            </div>
        </div>
    );
};

export default Modal;
