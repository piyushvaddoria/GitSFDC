const sortData = (dataset, fieldName, sortDirection, tableFieldMapping) => {
    try{
        if(tableFieldMapping[fieldName])
            fieldName = tableFieldMapping[fieldName];
        let data = dataset;
        let reverse = sortDirection !== 'asc';
        return [...data.sort(sortBy(fieldName, reverse, function(a){ return ((a) ? a : '') }))];
    } catch(err){
        console.log('error sortData : '+JSON.stringify(err));

    }
    return dataset;
};

const caseConvert = (val) => { 
    if(typeof val == 'string'){
        return (val ? val.toLowerCase() : val);
    }
    return val;
}; 

const sortBy = (field, reverse, primer) => {
    try{
        let key = primer ? function(x) {return primer(caseConvert(x[field]))} : function(x) {return caseConvert(x[field])};
        reverse = !reverse ? 1 : -1;
        return function (a, b) {   
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        } 
    } catch(err){
        console.log('error sortBy : '+JSON.stringify(err));

    }
};

// function used to filter data based on search query
const search = (toSearch, dataset, fieldsToSearch, userLocale, dateFields) => {
    if(!toSearch){
        return dataset;
    }
    const keys = fieldsToSearch;
    let results = [];
    try{
        for(let i=0; i< dataset.length; i++) {
            let key;
            let obj = dataset[i];
            for(key in obj) {
                if(keys.includes(key)){
                    if(dateFields.includes(key) && obj[key] && dateSearch(userLocale, obj[key], toSearch) ){
                        results.push(obj);
                        break;
                    }
                    else if(!dateFields.includes(key) && obj[key] && obj[key].toString().toLowerCase().indexOf(toSearch) != -1){
                        results.push(obj);
                        break;
                    }
                } 
            }
        }   
    } catch(err){
        console.log('error search : '+JSON.stringify(err));
    }
    return results;

};

// function used to search based on user locale setting from salesforce
const dateSearch = (userLocale, dToCheck, searchStr) => {
    let tempDate = new Date(dToCheck);
    let options = { year: 'numeric', month: 'short', day: '2-digit' };
    let tempDateStr = tempDate.toLocaleDateString((userLocale).replace('_','-'), options).toLowerCase();

    if(tempDateStr.indexOf(searchStr) != -1 )
        return true;
    return false;
};

export { sortData, search };