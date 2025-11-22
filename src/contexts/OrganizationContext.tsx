import React, { createContext, useContext, ReactNode } from 'react';
import { Organization } from '../types';

interface OrganizationContextType {
  organization: Organization;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// For now, this is hardcoded for Tampa Bay HEAT
// Later, this will be dynamic based on subdomain/domain
const TAMPA_BAY_HEAT_ORG: Organization = {
  id: 'tampabayheat',
  name: 'Tampa Bay HEAT',
  slug: 'tampabayheat',
  logo: '/images/logo.png',
  primaryColor: '#dc2626',
  domain: 'tampabayheat.org',
};

export const OrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // In single-tenant mode, always return Tampa Bay HEAT
  // Later, this will look up org based on subdomain
  const organization = TAMPA_BAY_HEAT_ORG;

  return (
    <OrganizationContext.Provider value={{ organization }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
};

