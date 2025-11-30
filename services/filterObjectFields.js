const FilterObjectFields = (inputObject, allowedFields) => {

    return Object.keys(inputObject)
        .filter(key => allowedFields.includes(key))
        .reduce((filteredObj, key) => {
            filteredObj[key] = inputObject[key];
            return filteredObj;
        }, {});
}

export default FilterObjectFields;
