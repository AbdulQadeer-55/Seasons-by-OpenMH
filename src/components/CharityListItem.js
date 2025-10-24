// This is a simple "card" component to show one charity
export default function CharityListItem({ charity }) {
  const name = charity.names[0].value;
  const activities = charity.activities || "No description available.";
  
  return (
    <div className="border border-gray-700 p-4 rounded-lg transition-transform hover:scale-[1.02] hover:border-blue-500">
      <h4 className="text-lg font-bold text-blue-400">{name}</h4>
      <p className="text-sm text-gray-300 my-2">
        {activities.substring(0, 150)}...
      </p>
      <div className="flex flex-wrap gap-2 mt-3">
        {charity.contact.phone && (
          <span className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded">
            📞 {charity.contact.phone}
          </span>
        )}
        {charity.contact.email && (
          <span className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded">
            📧 {charity.contact.email}
          </span>
        )}
        {charity.website && (
          <a 
            href={charity.website} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            🌐 Website
          </a>
        )}
      </div>
    </div>
  );
}