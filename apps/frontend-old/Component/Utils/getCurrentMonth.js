const options = {
    year: 'numeric',    // Day of the month (e.g., 3)
    month: 'long'      // Full month name (e.g., September)
  };

 
 
   const currentDate = new Date();
   const LastDate = new Date();
 currentDate?.setDate(1)
  LastDate.setMonth(currentDate.getMonth()-1); // Subtract 1 month
  
  // Format the date using toLocaleDateString
 export  const CurrentMonthandYear = currentDate.toLocaleDateString('en-GB', options);

 export  const LastMonthandYear = LastDate.toLocaleDateString('en-GB', options);