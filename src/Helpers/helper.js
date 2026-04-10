import moment from "moment";

export const getRemovedItems = (array1, array2) => {
    const filtered = array1.filter(el => {
        return array2.indexOf(el) === -1;
    });
    return filtered;
};

export function substract(num1, num2) {
    let n1 = parseFloat(num1) * 1000;
    let n2 = parseFloat(num2) * 1000;
    let result = (n1 - n2) / 1000
    return result;
}

export function getNumberFromAlphaNumeric(txt) {
    const num = txt.replace(/[^0-9]/g, '');
    return num
}


export const currentDate = moment().format('DD/MM/YYYY');


export const tommorowDate = moment().add(1, 'days').format('DD/MM/YYYY');



