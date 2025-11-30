const FilterEmptyFields = (data) => {
    return Object.fromEntries(Object.entries(data).filter(([key, value]) => {
        if (key === 'tradeLimits' || key === 'generalNotifications') {
            return false;
        } else if (key === 'secondStepUserVerifyDocs') {
            if (!data?.secondStepUserVerifyEnabled) {
                return false;
            }
            if (!value || value.length === 0) {
                return false;
            }
            const filteredDocs = value.filter(doc => doc.name && doc.defaultImage && doc.description);
            if (filteredDocs.length === 0) {
                return false;
            }
            return true;
        } else if (key === 'userNotifications') {
            return value && Array.isArray(value) && value.length > 0 && value[0]?.trim() !== '';
        } else if (typeof value === 'string') {
            return value?.trim() !== '';
        } else if (typeof value === 'number') {
            return !isNaN(value);
        } else if (typeof value === 'boolean') {
            return true;
        } else if (Array.isArray(value)) {
            return value.length > 0;
        } else {
            return value !== null && value !== undefined;
        }
    }));
}

export default FilterEmptyFields;
