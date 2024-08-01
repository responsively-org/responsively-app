import { useState } from 'react';

type AccordionItemProps = {
  title: string;
  children: JSX.Element;
};

export const AccordionItem = ({ title, children }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <h2>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 border   border-gray-200 p-5 font-medium text-gray-500 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:focus:ring-gray-800"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls={`accordion-body-${title}`}
        >
          <span className="flex items-center">{title}</span>
          <svg
            className={`h-3 w-3 ${isOpen ? 'rotate-180' : ''} shrink-0`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5 5 1 1 5"
            />
          </svg>
        </button>
      </h2>
      <div
        id={`accordion-body-${title}`}
        className={`${isOpen ? 'block' : 'hidden'}`}
        aria-labelledby={`accordion-heading-${title}`}
      >
        <div className="border border-b-0 border-gray-200 p-5 dark:border-gray-700 dark:bg-gray-900">
          {children}
        </div>
      </div>
    </div>
  );
};
