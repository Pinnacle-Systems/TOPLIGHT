import { prisma_Connector } from "../../index.js";



export async function getPermissionRequest(req, res) {
  
    const hod=req?.query?.hod
    const hr=req?.query?.hr
    const emp=req?.query?.emp


   
    
 const COMPCODE=String(req?.headers?.compcode).toUpperCase()
 if(hod){
    try {
        const result = await prisma_Connector?.permissionEntry?.findMany({where:{approvalStatus:"pending",create:1,OR:[{hr:hr},{hod}]},include:{userdata:{select:{
            email:true,username:true,Idcard:true
        }}},})

      const result_Leave=await prisma_Connector?.leaveEntry?.findMany({where:{approvalStatus:"pending",create:1,OR:[{hr:hr},{hod}]},include:{userdata:{select:{
            email:true,username:true,Idcard:true
        }}},})

        const advance_request=await prisma_Connector?.advanceRequest?.findMany({where:{approvalStatus:"pending",create:1,OR:[{hr:hr},{hod}]},include:{userdata:{select:{
            email:true,username:true,Idcard:true
        }}},})


        const   onduty_request=await prisma_Connector?.onduty?.findMany({where:{approvalStatus:"pending",create:1,OR:[{hr:hr},{hod}]},include:{userdata:{select:{
            email:true,username:true,Idcard:true
        }}},})

      
        

      
        
        return res.json({ statusCode: 0, data: [...result,...result_Leave,...advance_request,...onduty_request] })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
    }
}else if(emp){
    return res.json({ statusCode: 0, data: []})
}
}


export async function getDocId(req, res) {
    console.log(req);
    
        try {
            const result=await  prisma_Connector.permissionDocID.findFirst({})
            res.json({status:1,data:result}) 
        }
        catch (err) {
           console.log(err);
           
        }
        
    }



    export async function requestPermission(req, res) {
       const  data=req?.body?.data
       console.log(req.body);
       
            try {
                const result=await  prisma_Connector.permissionEntry.create({data:data})
                res.json({status:1,data:result}) 
            }
            catch (err) {
               console.log(err);
               
            }
            
        }





