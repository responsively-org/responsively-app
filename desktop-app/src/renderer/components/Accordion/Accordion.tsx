export function Accordion({ children }: { children: JSX.Element }) {
  return (
    <div id="accordion-open" data-accordion="open">
      {children}
    </div>
  );
}
