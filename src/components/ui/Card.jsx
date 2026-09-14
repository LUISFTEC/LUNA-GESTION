export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md p-2 ${className}`} {...props}>
      {children}
    </div>
  );
};