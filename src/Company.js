import React from "react";
import "./Company.css";
import Address from "./Address";
import StarIcon from "./StarIcon";

const Company = ({ company, onToggleStarred }) => {
  return (
    <div className="Company" onClick={() => onToggleStarred(company)}>

      {company.image ?
      <img src={company.image} alt={`Logo for ${company.name}`} className="Company-logo"/>
      : <span className="Company-logo"> </span>}

      <span>{company.name}</span>

      <Address address={company.address} />

      <StarIcon fill={company.starred ? 'yellow' : 'none'} />
    </div>
  )
};

export default Company
