export default function CharityListItem({ charity }) {
  const name = charity.names[0].value;

  return (
    // Use palette colors, add hover effect
    <div className="border-b border-[color:var(--border-primary)] py-4 transition-colors duration-150 hover:bg-white/5">
      <h4 className="text-lg font-semibold text-[color:var(--accent-primary)] mb-1">{name}</h4>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
        {charity.website && (
          <a
            href={charity.website}
            target="_blank"
            rel="noopener noreferrer"
            // Use accent color for link
            className="text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--accent-hover)] hover:underline"
          >
            Website
          </a>
        )}
        {charity.contact.phone && (
          <span className="text-sm text-[color:var(--text-secondary)]">
            {charity.contact.phone}
          </span>
        )}
        {charity.contact.email && (
          <span className="text-sm text-[color:var(--text-secondary)]">
            {charity.contact.email}
          </span>
        )}
      </div>
    </div>
  );
}