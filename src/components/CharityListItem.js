// This is the new, simpler "list item" design

export default function CharityListItem({ charity }) {
  const name = charity.names[0].value;
  
  return (
    // A simple border on the bottom, not a full card
    <div className="border-b border-gray-700 py-4">
      <h4 className="text-lg font-semibold text-blue-400">{name}</h4>
      
      {/* Simplified contact info */}
      <div className="flex flex-wrap gap-3 mt-2">
        {charity.website && (
          <a 
            href={charity.website} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-gray-300 hover:text-white"
          >
            Website
          </a>
        )}
        {charity.contact.phone && (
          <span className="text-sm text-gray-300">
            {charity.contact.phone}
          </span>
        )}
        {charity.contact.email && (
          <span className="text-sm text-gray-300">
            {charity.contact.email}
          </span>
        )}
      </div>
    </div>
  );
}