export interface AddressComponents {
  streetNumber?: string;
  route?: string;
  locality?: string; // City
  administrativeAreaLevel1?: string; // State
  administrativeAreaLevel2?: string; // County
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

export function extractAddressComponents(place: any): AddressComponents {
  const components: AddressComponents = {
    formattedAddress: place.formatted_address || place.formattedAddress || place.displayName || ''
  };

  // Handle both legacy and new API formats
  const addressComponents = place.address_components || place.addressComponents;
  
  if (addressComponents) {
    addressComponents.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('street_number')) {
        components.streetNumber = component.long_name;
      }
      if (types.includes('route')) {
        components.route = component.long_name;
      }
      if (types.includes('locality')) {
        components.locality = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        components.administrativeAreaLevel1 = component.short_name;
      }
      if (types.includes('administrative_area_level_2')) {
        components.administrativeAreaLevel2 = component.long_name;
      }
      if (types.includes('country')) {
        components.country = component.long_name;
      }
      if (types.includes('postal_code')) {
        components.postalCode = component.long_name;
      }
    });
  }

  // Debug logging
  console.log('Extracted address components:', components);
  console.log('Original place object:', place);

  return components;
}

export function formatAddressFromComponents(components: AddressComponents): string {
  const parts: string[] = [];
  
  if (components.streetNumber && components.route) {
    parts.push(`${components.streetNumber} ${components.route}`);
  } else if (components.route) {
    parts.push(components.route);
  }
  
  if (components.locality) {
    parts.push(components.locality);
  }
  
  if (components.administrativeAreaLevel1) {
    parts.push(components.administrativeAreaLevel1);
  }
  
  if (components.country) {
    parts.push(components.country);
  }
  
  return parts.join(', ');
}
