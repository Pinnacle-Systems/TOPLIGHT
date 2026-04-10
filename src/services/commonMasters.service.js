import { prisma_Connector } from "../../index.js";
import { getConnection } from "../constants/db.connection.js";
import bcrypt from "bcrypt"


export async function get(req, res) {
    const connection = await getConnection(res)
    try {
        const result = await connection.execute(`
        select * from (select finyr  from GTFINANCIALYEAR order by finyr desc) finyr     
        where rownum <= 3
     `)
        let resp = result.rows.map(po => ({
            finYear: po[0]
        }))

        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}

export async function getBuyer(req, res) {
    const connection = await getConnection(res)
    try {
        const result = await connection.execute(`
        SELECT C.COMPCODE,COUNT(*) TOT FROM HREMPLOYMAST A 
JOIN HREMPLOYDETAILS B ON A.HREMPLOYMASTID = B.HREMPLOYMASTID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID = A.COMPCODE
WHERE B.IDACTIVE = 'YES'
GROUP BY C.COMPCODE
     `)
        let resp = result.rows.map(po => ({
            buyerName: po[0]
        }))

        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}


export async function getMonthData(req, res) {
    const connection = await getConnection(res)
    try {
        const { filterYear, filterBuyer } = req.query;
        const result = await connection.execute(`
            SELECT A.PAYPERIOD FROM MONTHLYPAYFRQ A
              WHERE A.finyr = '${filterYear}' 
GROUP BY A.PAYPERIOD
      ORDER BY TO_DATE(A.PAYPERIOD, 'Month YYYY')        
     `)
        console.log(result, 'res');
        let resp = result.rows.map(po => ({
            month: po[0]
        }))

        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}

export async function getCompCodeData(req, res) {
    const connection = await getConnection(res)
    try {
        const { } = req.query;
        const sql =
            `
       SELECT C.COMPCODE,COUNT(*) TOT FROM HREMPLOYMAST A 
JOIN HREMPLOYDETAILS B ON A.HREMPLOYMASTID = B.HREMPLOYMASTID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID = A.COMPCODE
WHERE B.IDACTIVE = 'YES'
GROUP BY C.COMPCODE`
        console.log(sql, '84');
        const result = await connection.execute(sql)
        let resp = result.rows.map(po => ({
            com: po[0]
        }))

        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}



export async function chat(req, res) {
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const chat_data=req?.body
    

   var chat_=await prisma_Connector?.chat?.create({
        data:{...chat_data,COMPCODE}
    })

    if(chat_?.id){
        res?.json({status:1,data:chat_})
    }else{
         res?.json({status:0,data:{}})
    }

    




}




export async function get_chat(req, res) {
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const DEPARTMENT=req?.query?.DEPARTMENT
    

   var chat_=await prisma_Connector?.chat?.findMany({
    where:{
        COMPCODE,groupId:DEPARTMENT
    },
    include:{userdata:true}
   })

    if(chat_){
        res?.json({status:1,data:chat_})
    }else{
         res?.json({status:0,data:{}})
    }

    




}

  
export async function delete_Common_Data(req, res) {
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const onlywhere=req?.body?.onlywhere
    const where=req?.body?.where
    const table=req?.body?.table
        try {
            const result=await  prisma_Connector?.[table]?.delete({where:onlywhere ?{...where} : {COMPCODE,...where}})
            res.json({status:1,data:result}) 
        }
        catch (err) {
          res.json({status:0,data:{}}) 
           console.log(err);
           
        }
}


export async function Update_Common_Data_prisma(req, res) {
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const where=req?.body?.where
    const onlywhere=req?.body?.onlywhere
    const table=req?.body?.table
    const data=req?.body?.data
    const Comp_data=req?.body?.data?.Compcodes
    const user_updation=req?.body?.data?.user_updation
    

      if(data?.password){

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data?.password, saltRounds);
        data.password=hashedPassword

        }


        if(Comp_data &&  user_updation){
 
         const delete_succesued= await  prisma_Connector?.companyCode?.deleteMany({where:{Idcard:data?.Idcard,GCOMP:COMPCODE}})
           if(delete_succesued?.count>0 || delete_succesued?.count==0){
              try {
             const {GCOMP,user_updation,Compcodes,...reset}=data
              const result=await  prisma_Connector?.[table]?.update({data:{...reset,Companies:{create:Comp_data}},where:onlywhere ? {...where} : {COMPCODE,...where}})
              res.json({status:1,data:result}) 
               
            }


            catch (err) {
          res.json({status:0,data:{}}) 
           console.log(err);
           
            }

        }



        }else{

       

        try {
            const result=await  prisma_Connector?.[table]?.update({data,where:onlywhere ? {...where} : {COMPCODE,...where}})

            res.json({status:1,data:result}) 
        }


        catch (err) {
          res.json({status:0,data:{}}) 
           console.log(err);
           
        }

         }
}

