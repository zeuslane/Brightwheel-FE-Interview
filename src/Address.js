import React from "react";

const Address = ({ address }) => {
  const { address1, city, postalCode, state } = address

  return (
    <p>{`${address1} ${city} ${postalCode} ${state}`}</p>
  )
};

export default Address
