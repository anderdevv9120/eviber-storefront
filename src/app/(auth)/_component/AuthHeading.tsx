interface AuthHeadingProps {
  title: string;
  description?: string;
}

const AuthHeading = ({ title, description }: AuthHeadingProps) => {
  return (
    <div className="mb-7">
      <h1 className="text-2xl md:text-3xl font-extrabold text-dark">{title}</h1>
      {description && <p className="mt-2 text-dark-500">{description}</p>}
    </div>
  );
};

export default AuthHeading;
