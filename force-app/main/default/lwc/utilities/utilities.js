import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const firstFieldValidation = 'first error: FIELD_CUSTOM_VALIDATION_EXCEPTION, ';
const stringTooLong = 'first error: STRING_TOO_LONG, ';
const validations = [firstFieldValidation,stringTooLong];
const retryMsg = 'Something went wrong. Please try again.';
const retryAdmin = 'Something went wrong. Please contact your system administrator.';


const reduceErrors = errors => {
    if (!Array.isArray(errors)) {
        errors = [errors];
    }

    return (
        errors
            // Remove null/undefined items
            .filter((error) => !!error)
            // Extract an error message
            .map((error) => {
                // UI API read errors
                if (Array.isArray(error.body)) {
                    return error.body.map((e) => e.message);
                }
                // Page level errors
                else if (
                    error?.body?.pageErrors &&
                    error.body.pageErrors.length > 0
                ) {
                    return error.body.pageErrors.map((e) => e.message);
                }
                // Field level errors
                else if (
                    error?.body?.fieldErrors &&
                    Object.keys(error.body.fieldErrors).length > 0
                ) {
                    const fieldErrors = [];
                    Object.values(error.body.fieldErrors).forEach(
                        (errorArray) => {
                            fieldErrors.push(
                                ...errorArray.map((e) => e.message)
                            );
                        }
                    );
                    return fieldErrors;
                }
                // UI API DML page level errors
                else if (
                    error?.body?.output?.errors &&
                    error.body.output.errors.length > 0
                ) {
                    return error.body.output.errors.map((e) => e.message);
                }
                // UI API DML field level errors
                else if (
                    error?.body?.output?.fieldErrors &&
                    Object.keys(error.body.output.fieldErrors).length > 0
                ) {
                    const fieldErrors = [];
                    Object.values(error.body.output.fieldErrors).forEach(
                        (errorArray) => {
                            fieldErrors.push(
                                ...errorArray.map((e) => e.message)
                            );
                        }
                    );
                    return fieldErrors;
                }
                // UI API DML, Apex and network errors
                else if (error.body && typeof error.body.message === 'string') {
                    return error.body.message;
                }
                // JS errors
                else if (typeof error.message === 'string') {
                    return error.message;
                }
                // Unknown error shape so try HTTP status text
                return error.statusText;
            })
            // Flatten
            .reduce((prev, curr) => prev.concat(curr), [])
            // Remove empty strings
            .filter((message) => !!message)
    );
}

const showErrorMsg = (cmp, msg) => {
    cmp.dispatchEvent( new ShowToastEvent({
        variant:"error",
        message:msg
    }));
}

const showToastMsg = (cmp, config) => {
    cmp.dispatchEvent( new ShowToastEvent(config));
}

const handleError = (cmp, error) => {
    console.log(JSON.stringify(error));
    let erors = reduceErrors(error);
    erors.forEach(err => {
        let validationToReplace = validations.filter(v => err.includes(v));
        let finalMsg = validationToReplace.length ? err.split(validationToReplace[0])[1].split(':')[0].trim() : 
                        (err.includes("first error:") ? err.replace("first error:",'') : err);
        showErrorMsg(cmp, finalMsg);
    });
}

const toShortFormatDT = dt => {

    let hours = dt.getHours();
    let minutes = dt.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;

    return `${toShortFormat(dt)} ${strTime}`;  
}

const toShortFormat = dt => {
   let monthNames =["Jan","Feb","Mar","Apr",
                   "May","Jun","Jul","Aug",
                   "Sep", "Oct","Nov","Dec"];
   let day = dt.getDate();
   let monthIndex = dt.getMonth();
   let monthName = monthNames[monthIndex];
   let year = dt.getFullYear();

   let hours = dt.getHours();
   let minutes = dt.getMinutes();
   hours = hours % 12;
   hours = hours ? hours : 12; // the hour '0' should be '12'
   minutes = minutes < 10 ? '0'+minutes : minutes;

   return `${day}-${monthName}-${year}`;  
}

const flattenJSON = (obj = {}, res = {}, extraKey = '') => {
    for(let key in obj){
       if(typeof obj[key] !== 'object'){
          res[extraKey + key] = obj[key];
       }else{
          flattenJSON(obj[key], res, `${extraKey}${key}.`);
       };
    };
    return res;
}

const emailRegEx = /^(([^<>()\[\]\\/.,;:\s@"]+(\.[^<>()\[\]\\/.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const validateEmail = (email) => {
   return emailRegEx.test(email);
}

export { showErrorMsg, showToastMsg, handleError, toShortFormat,flattenJSON, toShortFormatDT, validateEmail};