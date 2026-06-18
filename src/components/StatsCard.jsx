import React from 'react';
import { Link } from 'react-router-dom';

const StatsCard = ({ title, value, valueColor, linkTo }) => {
  const content = (
    <div className="bg-white rounded-md p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center h-[120px] transition-transform hover:-translate-y-1">
      <h3 className="text-gray-700 font-semibold text-[13px] mb-3 text-center tracking-wide">{title}</h3>
      <div className={`text-3xl font-bold ${valueColor}`}>
        {value}
      </div>
    </div>
  );

  return linkTo ? <Link to={linkTo} className="block">{content}</Link> : content;
};

export default StatsCard;
