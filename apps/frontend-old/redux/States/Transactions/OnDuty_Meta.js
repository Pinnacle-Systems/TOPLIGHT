const Onduty_state = {
    docdate: "",
    idcard: "",
    fromDate: "",
    toDate: "",
    totalDays: "",
    reason: "",
    leaveType: "",
    empname:"",
    category:"",
    fltype:"",
    tltype:"",
    finyear:"",
    leaveType_options: [],
    category_options:[],
    tltype_options:[],
    fltype_options:[],
    ltype_options:[],
    fin_options:[],
    others:"",
    vechileno:"",
    category_vechileno:"",
    start_km:"",
    end_km:"",
    end_km:"0",
    Evechilekm:"0",



  };
  
  const onduty_Meta = [
   { state: "category", id: "Onduty_state", label: "Category Type", style: { full: true }, type: "select", option_data: "category_options" ,select:{labelKey:"name",valueKey:"id"},addOnVal_State:"category",addOnVal_Key:"id"},
   { state: "docdate", id: "Onduty_state", label: "Document Date", style: { full: true,editable: false},props: { editable: false }, type: "date" },
   { state: "idcard", id: "Onduty_state", label: "ID Card", style: { full: true }, props: { editable: false } },
   { state: "empname", id: "Onduty_state", label: "Employee Name", style: { full: true }, props: { editable: false } },
   { state: "others", id: "Onduty_state", label: "Others", style: { full: true,height:130 } ,props:{multiline:true,editable: true}},
   { state: "address", id: "Onduty_state", label: "Address", style: { full: true,height:130 } ,props:{multiline:true,editable: false}},
  //  { state: "vechileno", id: "Onduty_state", label: "Vechile No", style: { full: true }, props: { editable: false },type: "select", option_data: "category_vechileno" ,select:{labelKey:"vechilename",valueKey:"vechileno"},addOnVal_State:"vechileno",addOnVal_Key:"vechileno"},
  //  { state: "start_km", id: "Onduty_state", label: "Traveled Km", style: { full: true,height:60 } ,props:{editable: true}},
  ];
  
  export {Onduty_state,onduty_Meta}