import moment from "moment";

const Fuel_state = {
  from_date:moment(moment().date(1)).format("DD-MM-YYYY"),
  to_date:moment(moment.now()).format("DD-MM-YYYY"),
  vehile:""
  }

  export  {Fuel_state}