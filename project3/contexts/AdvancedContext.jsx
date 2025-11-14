import React, { createContext, useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

const AdvancedContext = createContext({
  enabled: false,
  setEnabled: () => {},
});

export function AdvancedProvider({ children }) {
  const [enabled, setEnabled] = useState(false);

  const value = useMemo(
    () => ({ enabled, setEnabled }),
    [enabled]
  );

  return (
    <AdvancedContext.Provider value={value}>
      {children}
    </AdvancedContext.Provider>
  );
}

AdvancedProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAdvanced() {
  return useContext(AdvancedContext);
}