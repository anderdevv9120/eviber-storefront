import { ComponentType } from "react";

type PolicyItemData = {
  Icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  isLastItem?: boolean;
};

type ProductPolicyProps = {
  policies: PolicyItemData[];
};

const ProductPolicy = ({ policies }: ProductPolicyProps) => {
  return (
    <div className="flex flex-wrap justify-around">
      {policies.map((policy, index) => (
        <PolicyItem
          key={index}
          Icon={policy.Icon}
          title={policy.title}
          description={policy.description}
        />
      ))}
    </div>
  );
};

const PolicyItem = ({ Icon, title, description }: PolicyItemData) => (
  <div
    className="flex items-center mb-6 p-3 rounded-lg transition-all duration-300 
               hover:bg-gray-50 hover:shadow-md hover:-translate-y-1 group cursor-pointer"
  >
    <Icon
      className="w-9 h-9 mx-1.5 sm:w-16 sm:h-16 text-primary-500 
                 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary-700"
    />
    <div>
      <p className="mb-1 text-base sm:text-base font-semibold transition-colors duration-300 group-hover:text-primary-700">
        {title}
      </p>
      <span className="text-xs text-dark-500 sm:text-sm transition-colors duration-300 group-hover:text-dark-700">
        {description}
      </span>
    </div>
  </div>
);

export default ProductPolicy;
