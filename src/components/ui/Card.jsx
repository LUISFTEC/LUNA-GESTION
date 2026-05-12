export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md p-2 ${className}`}>
      {children}
    </div>
  );
};