export const Accordion = ({children}: {children: React.JSX.Element}) => {
  return (
    <div id="accordion-open" data-accordion="open">
      {children}
    </div>
  );
};
