export function Link({ to = "#", children, className, onClick, ...props }) {
  const handleClick = (event) => {
    if (onClick) onClick(event);
    if (event.defaultPrevented) return;

    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      props.target === "_blank"
    ) {
      return;
    }

    event.preventDefault();
    window.history.pushState({}, "", to);
    window.dispatchEvent(new Event("app:navigate"));
  };

  return (
    <a href={to} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}