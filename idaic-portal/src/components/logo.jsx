import React from 'react'

export function Logo({ className = "" }) {
  return (
    <img
      src="https://raw.githubusercontent.com/nexusclimate/idaic/main/idaic_black.png"
      alt="IDAIC Logo"
      className={`h-28 ${className}`}
      style={{ objectFit: 'contain', maxWidth: '100%' }}
    />
  )
}

export default Logo