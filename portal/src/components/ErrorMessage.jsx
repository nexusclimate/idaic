import clsx from 'clsx';

export function ErrorMessage({ message, className }) {
  if (!message) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50"
      role="alert"
    >
      <div
        className={clsx(
          'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5 animate-slide-in',
          className
        )}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="shrink-0">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" />
              </svg>
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SuccessMessage({ message, className }) {
  if (!message) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50"
      role="alert"
    >
      <div
        className={clsx(
          'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5 animate-slide-in',
          className
        )}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="shrink-0">
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4-4" />
              </svg>
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
