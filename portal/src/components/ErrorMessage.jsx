import clsx from 'clsx';

export function ErrorMessage({ message, className }) {
  if (!message) return null;

  return (
    <div
      className={clsx(
        'rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/5 dark:text-red-400',
        className
      )}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5 shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
            clipRule="evenodd"
          />
        </svg>
        <p>{message}</p>
      </div>
    </div>
  );
}

export function SuccessMessage({ message, className }) {
  if (!message) return null;

  return (
    <div
      className={clsx(
        'rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600 dark:bg-green-500/5 dark:text-green-400',
        className
      )}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5 shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clipRule="evenodd"
          />
        </svg>
        <p>{message}</p>
      </div>
    </div>
  );
}
