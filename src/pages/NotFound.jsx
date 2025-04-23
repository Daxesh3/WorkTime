import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiClock } from 'react-icons/fi'

const NotFound = () => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center h-[calc(100vh-200px)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <FiClock className="text-primary-500 text-6xl mb-4" />
      <h1 className="text-4xl font-bold text-neutral-800 mb-2">404</h1>
      <p className="text-xl text-neutral-600 mb-8">Page not found</p>
      <Link to="/" className="btn btn-primary">
        <FiHome className="mr-2" /> Go to Homepage
      </Link>
    </motion.div>
  )
}

export default NotFound