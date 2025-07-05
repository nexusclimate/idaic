import * as Headless from '@headlessui/react'
import { Link as RouterLink } from 'react-router-dom'
import React, { forwardRef } from 'react'

// Re-export a Catalyst-style Link that works in Vite
export const Link = forwardRef(function Link(props, ref) {
  return (
    <Headless.DataInteractive>
      <RouterLink {...props} ref={ref} />
    </Headless.DataInteractive>
  )
})