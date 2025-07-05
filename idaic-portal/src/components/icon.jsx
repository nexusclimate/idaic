// src/components/icon.jsx
import React from 'react';
import clsx from 'clsx';

/**
 * Usage:
 *   import { HomeIcon } from '@heroicons/react/24/solid'
 *   <Icon as={HomeIcon} className="text-indigo-600" />
 */
export function Icon({ as: IconComp, className, ...props }) {
  return (
    <IconComp
      aria-hidden="true"
      className={clsx('size-5 shrink-0 fill-current', className)}
      {...props}
    />
  );
}

export default Icon;