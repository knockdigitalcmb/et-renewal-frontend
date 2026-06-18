import React from 'react';

const RenewalBadge = ({ date }) => {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f8ec] text-[#2ecc71] tracking-wide">
      {date}
    </span>
  );
};

export default RenewalBadge;
