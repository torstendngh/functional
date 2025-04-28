interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return (
    <section
      className={`bg-white rounded-xl shadow-lg border-1 border-neutral-300 ${className}`}
    >
      {children}
    </section>
  );
}

export default Card;
