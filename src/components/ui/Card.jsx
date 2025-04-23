import React from 'react'
import { motion } from 'framer-motion'

const Card = ({ children, title, subtitle, icon, className = '', actionButton }) => {
  return (
    <motion.div 
      className={`card ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {(title || icon || actionButton) && (
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <div className="flex items-center">
            {icon && <div className="mr-3 text-primary-600">{icon}</div>}
            <div>
              {title && <h3 className="text-lg font-medium text-neutral-800">{title}</h3>}
              {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
            </div>
          </div>
          {actionButton && <div>{actionButton}</div>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </motion.div>
  )
}

export default Card