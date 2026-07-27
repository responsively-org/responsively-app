import {useId, useState} from 'react';

type AccordionItemProps = {
  title: string;
  children: React.JSX.Element;
};

export const AccordionItem = ({title, children}: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const id = useId();
  const headingId = `${id}-heading`;
  const bodyId = `${id}-body`;

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <h2>
        <button
          type="button"
          id={headingId}
          className="flex w-full items-center justify-between gap-3 border border-line-soft p-5 font-medium text-muted hover:bg-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls={bodyId}
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
        id={bodyId}
        role="region"
        className={`${isOpen ? 'block' : 'hidden'}`}
        aria-labelledby={headingId}
      >
        <div className="border border-b-0 border-line-soft bg-card p-5">{children}</div>
      </div>
    </div>
  );
};
