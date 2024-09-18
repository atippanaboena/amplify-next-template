type ParsedAddress = {
    address1: string;
    address2: string;
    city: string;
    state: string;
    country: string;
    zip: string;
};

export const extractAddress = (addressComponents: google.maps.GeocoderAddressComponent[]): ParsedAddress => {
    let address1 = "";
    let address2 = "";
    let city = "";
    let country = "";
    let state = "";
    let zip = "";

    addressComponents.forEach((component) => {
        const types = component.types;

        if (types.includes("street_number")) {
            address1 = component.long_name;
        }

        if (types.includes("route")) {
            address1 += ` ${component.long_name}`;
        }

        if (types.includes("subpremise")) {
            address2 = component.long_name;
        }

        if (types.includes("locality")) {
            city = component.long_name;
        }

        if (types.includes("administrative_area_level_1")) {
            state = component.short_name;
        }

        if (types.includes("country")) {
            country = component.long_name;
        }

        if (types.includes("postal_code")) {
            zip = component.long_name;
        }

        if (types.includes("postal_code_suffix")) {
            zip += `-${component.long_name}`;
        }
    });

    return {
        address1,
        address2,
        city,
        state,
        country,
        zip,
    };
}