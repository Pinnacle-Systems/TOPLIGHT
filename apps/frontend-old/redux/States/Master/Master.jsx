const Master_state={
    name:"",
    address:""
}

const Master_Meta=[{
    state:"name",id:"Master_state",label:"Company Name",style:{full:true}
},{
    state:"address",id:"Master_state",label:"Company Address",style:{full:true}
},
{
    state:"Mobile",id:"Master_state",label:"Mobile",style:{full:true}
},
{
    state:"gst",id:"Master_state",label:"gst",style:{full:true}
}]




const Permission_state = {
    docid: "",
    docdate: "",
    idcard: "",
    fTime: "",
    tTime: "",
    thrs: "",
    reason: "",
    category:"",
    category_options:[],
    
    
  };

  
const Permission_Master_state = {
    name: "",
    active: "",
    ptype:"",
    options:[],
    ptype_Option:[{
      label:"Permission",value:"permission"
    },
  {
      label:"Advance",value:"advance"
    },
  {
      label:"Leave",value:"leave"
    }]
   
  
  };


  const Permission_master_Meta = [
    { state: "name", id: "Permission_Master_state", label: "Reason Name", style: { full: true } },
     { state: "ptype", id: "Permission_Master_state", label: "Page Type", style: { full: true },type:"select",option_data:"ptype_Option"},
    { state: "active", id: "Permission_Master_state", label: "Active", style: { full: true },type:"select",option_data:"options"},
  ];
  
  const Permission_Meta = [
    { state: "docid", id: "Permission_state", label: "Document ID", style: { full: true },props:{editable:false } },
    { state: "docdate", id: "Permission_state", label: "Document Date", style: { full: true },type:"date" },
    { state: "idcard", id: "Permission_state", label: "ID Card", style: { full: true },props:{editable:false }},
    { state: "fTime", id: "Permission_state", label: "From Time", style: { full: true },type:"time" },
    { state: "tTime", id: "Permission_state", label: "To Time", style: { full: true },type:"time" },
    { state: "thrs", id: "Permission_state", label: "Total Hours", style: { full: true } },
    { state: "category", id: "Permission_state", label: "Category", style: { full: true },type:"select",option_data:"category_options"},
    { state: "reason", id: "Permission_state", label: "Reason", style: { full: true } },
  ];




const Page_Master_state = {
    name: "",
    active: "",
    options:[],
   
  
  };


  const Page_master_Meta = [
    { state: "name", id: "Page_Master_state", label: "Role Name", style: { full: true } },
    { state: "active", id: "Page_Master_state", label: "Active", style: { full: true },type:"select",option_data:"options"},
  ];


export {Master_state,Master_Meta,Permission_state, Permission_Meta,Permission_Master_state,Permission_master_Meta,Page_Master_state,Page_master_Meta}