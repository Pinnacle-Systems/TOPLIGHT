const Leave_state = {
    docid: "",
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
    save:true
  };
  
  const leave_Meta = [
    { state: "finyear", id: "Leave_state", label: "Fin Year", style: { full: false }, type: "select", option_data: "fin_options" },
    { state: "docdate", id: "Leave_state", label: "Document Date", style: { full: false}, type: "date" },
    { state: "idcard", id: "Leave_state", label: "ID Card", style: { full: false }, props: { editable: false } },
    { state: "empname", id: "Leave_state", label: "Employee Name", style: { full: false }, props: { editable: false } },
    { state: "category", id: "Leave_state", label: "Category Type", style: { full: true }, type: "select", option_data: "category_options", required: true },
    { state: "fromDate", id: "Leave_state", label: "From Date", style: { full: false}, type: "date", required: true },
    { state: "fltype", id: "Leave_state", label: "Fltype", style: { full: false }, type: "select", option_data: "fltype_options" },
    { state: "toDate", id: "Leave_state", label: "To Date", style: { full: false }, type: "date", required: true },
    { state: "tltype", id: "Leave_state", label: "Tltype", style: { full: false }, type: "select", option_data: "tltype_options" },
    { state: "ltype", id: "Leave_state", label: "Leave Type", style: { full: false }, type: "select", option_data: "ltype_options", required: true },
    { state: "totalDays", id: "Leave_state", label: "Total Days", style: { full: false }, props: { editable: false } },
    { state: "reason", id: "Leave_state", label: "Reason", style: { full: true,height:130 }, required: true },
  ];
  export {Leave_state,leave_Meta}