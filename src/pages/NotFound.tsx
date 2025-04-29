import { FC } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiClock } from 'react-icons/fi';

const NotFound: FC = () => {
    return (
        <div className='animate-fade-in-down animate-duration-300 flex flex-col items-center justify-center h-[calc(100vh-200px)]'>
            <FiClock className='text-primary-500 text-6xl mb-4' />
            <h1 className='text-4xl font-bold text-neutral-800 mb-2'>404</h1>
            <p className='text-xl text-neutral-600 mb-8'>Page not found</p>
            <Link to='/' className='btn btn-primary'>
                <FiHome className='mr-2' /> Go to Homepage
            </Link>
        </div>
    );
};

export default NotFound;
