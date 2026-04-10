const  Onduty_Master_state={
    name: "",
    active: "",
    options:[],
   
  
  };


   const Onduty_master_Meta = [
    { state: "name", id: "Onduty_Master_state", label: "Reason Name", style: { full: true } },
    { state: "active", id: "Onduty_Master_state", label: "Active", style: { full: true },type:"select",option_data:"options"},
  ]

  export {Onduty_Master_state,Onduty_master_Meta}