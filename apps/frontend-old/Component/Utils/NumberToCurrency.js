export function NumbertoCurrency(number){
   return  Number(number || 0).toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        style: 'currency',
        currency: 'INR'
    }) 
}