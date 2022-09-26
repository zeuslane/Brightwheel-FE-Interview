import React from "react";
import Company from "./Company";

const CompanyList = ({companies, onToggleStarred}) => {
  return companies.map(company => <Company key={company.id} company={company} onToggleStarred={onToggleStarred}/>
  )
};

export default CompanyList;
