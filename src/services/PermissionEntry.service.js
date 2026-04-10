import { prisma_Connector } from "../../index.js";
import { getConnection } from "../constants/db.connection.js";
import { convert12to24 } from "../Utiles/24hConverter.js";
import formatDateToOracle from "../Utiles/OracleDateFormat.js";
import { generateUniqueId_Number } from "../Utiles/UniqueNumber.js";


export async function get__per(req, res) {
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const hod=req.query?.hod
    const id=req.query?.id

        try {
            const result=await  prisma_Connector.permissionEntry.findMany({where:hod ? {compCode:COMPCODE,hod:hod} : {compCode:COMPCODE,userId:id},include:{createdBy_user:{select:{Employee:true,username:true,Idcard:true}},modifiedBy_user:{select:{Employee:true,username:true,Idcard:true}}}});
            res.json({status:1,data:result}) 
        }
        catch (err) {
           console.log(err);
        }
}




export async function get__per_category(req, res) {
  const COMPCODE=String(req?.headers?.compcode).toUpperCase()
  const Qtype=req?.query?.type

  
      try {
          const result=await  prisma_Connector.permissionMaster.findMany({where: {AND:[ {COMPCODE:COMPCODE},{ptype:Qtype}]}})
          console.log(result);
          
          var filter_data=result?.map((data)=>{return {label:data.name,value:data.id}})
           res.json({status:1,data:filter_data}) 
      }
      catch (err) {
         console.log(err);
      }
}


export async function addPermission_master(req, res) {
  const  data=req?.body?.data
  const COMPCODE=String(req?.headers?.compcode).toUpperCase()
          try {
           const result=await  prisma_Connector.permissionMaster.create({data:{...data,COMPCODE}})  
          // var auvit_data={PERMISSIONID:String(result?.permissionId),THRS:result?.thrs,APPROVALSTATUS:String(result?.approvalStatus),DOCID:String(result?.docid),REASON:result?.reason,TTIME:result?.tTime,FTIME:result?.fTime,COMPCODE:String(result?.compCode),CREATED_BY:String(result?.createdBy),CREATED_ON:formatDateToOracle(result?.createdOn),MODIFIED_BY:result?.createdBy,MODIFIED_ON:formatDateToOracle(result?.modifiedOn),IDCARD:Number(result?.userId),DOCDATE:result?.docDate,IS_CANCELLED:'false'}
           if(result?.id){
            return  res.json({status:1,data:result})  
           }else{
            return  res.json({status:0,data:{}})  
           }
      
          }catch(err){
             console.log(err);
             
       }


      }




export async function get_user_Permission(req, res) {
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const IdCard=req.query?.IdCard
    
        try {
            const result=await  prisma_Connector.permissionEntry.findFirst({where:{userId:IdCard,compCode:COMPCODE}})
            res.json({status:1,data:result}) 
        }
        catch (err) {
           console.log(err);
           
        }
}


export async function getDocId(req, res) {
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    
        try {
            const result=await  prisma_Connector.permissionEntry.findFirst({
                orderBy: {
                  id: 'desc',
                },
                select: {
                  id: true,
                },where:{compCode:COMPCODE}
              });
            
            
            res.json({status:1,data:{count:Number(result?.id || 0)+1}}) 
        }
        catch (err) {
           console.log(err);
           
        }
        
    }



    export async function requestPermission(req, res) {
       const  data=req?.body?.data

       const connection = await getConnection(res)

             try {
        const tempDocid = `TEMP-${Date.now()}-${Math.random()}`;
        const initialResult = await prisma_Connector.permissionEntry.create({
            data: { ...data, docid: tempDocid, permissionId: String(generateUniqueId_Number()) }
        });
        const paddedId = initialResult.id.toString().padStart(6, '0');
        const finalDocid = `PER-${paddedId}`;
        const result = await prisma_Connector.permissionEntry.update({
            where: { id: initialResult.id },
            data: { docid: finalDocid }
        });
        
        const Ttime_24=convert12to24(result?.tTime)
         const FTime_24=convert12to24(result?.fTime)      

        var auvit_data={PERMISSIONID:result?.permissionId,USERID:result?.username,THRS:result?.thrs,APPROVALSTATUS:String(result?.approvalStatus),DOCID:String(result?.docid),REASON:result?.reason,TTIME:Ttime_24,FTIME:FTime_24,COMPCODE:String(result?.compCode),CREATED_BY:String(result?.createdBy),CREATED_ON:formatDateToOracle(result?.createdOn),MODIFIED_BY:result?.createdBy,MODIFIED_ON:formatDateToOracle(result?.modifiedOn),IDCARD:Number(result?.userId),DOCDATE:result?.docDate,IS_CANCELLED:'false'}
       if(result?.id){
            const sql =    `
                   INSERT INTO permission (
  PERMISSIONID, THRS, APPROVALSTATUS, DOCID, REASON,
  TTIME, FTIME, COMPCODE, CREATED_BY, CREATED_ON,
  MODIFIED_BY, MODIFIED_ON, IDCARD,DOCDATE,IS_CANCELLED,USERID
)
VALUES (
  :PERMISSIONID, :THRS, :APPROVALSTATUS, :DOCID, :REASON,
  :TTIME,
  :FTIME,
  :COMPCODE, :CREATED_BY,
  TO_DATE(:CREATED_ON, 'YYYY-MM-DD HH24:MI:SS'),
  :MODIFIED_BY,
  TO_DATE(:MODIFIED_ON, 'YYYY-MM-DD HH24:MI:SS'),
  :IDCARD,:DOCDATE,:IS_CANCELLED,:USERID
)
 `     
             const result_auvit = await connection.execute(sql,auvit_data) 
              if(result_auvit?.rowsAffected >0){

                await prisma_Connector?.permissionEntry?.update({where:{docid:result?.docid},data:{create:1}}).then(()=>{
                  return  res.json({status:1,data:{...result,count:result?.id}})
                }).catch(()=>{
                return  res.json({status:0,data:{}})
                  })
                    
                }else{
                  await prisma_Connector?.permissionEntry?.delete({where:{id:result?.id}})
                res.json({status:0,message:"Failed to Request !"})   
                }
             //   }else{
                //    prisma_Connector?.permissionEntry?.delete({where:{userId:result?.userId}}) 
                //    res.json({status:0,data:{}}) 
                }   
               
            }
            catch (err) {
               res.json({status:500,error:err})
               console.log(err);
               
             } finally {
                await connection?.commit()
                await connection.close()
            }
            }

  
export async function get_all_Permission_reason(req, res) {
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()

        try {
            const result=await  prisma_Connector.permissionMaster.findMany({where:{COMPCODE}})
            res.json({status:1,data:result}) 
        }
        catch (err) {
          res.json({status:0,data:{}}) 
           console.log(err);
           
        }
}
            
        


          


        
//     export async function requestPermission_Approval(req, res) {
//       const COMPCODE=String(req?.headers?.compcode).toUpperCase()
//         const  docid=req?.body?.docid
//         const  p_app=req?.body?.approval
//         const approvedBy=req?.body?.approvedBy
//         const rejectBy=req?.body?.rejectBy
//         const connection = await getConnection(res)
//              try {
                
//                  const result=await  prisma_Connector.permissionEntry.update({where:{docid},data:{approvalStatus:p_app,approvedBy,rejectBy}})
              
//                  if(result?.id){
//                 // const up_result=await  prisma_Connector.permissionDocID.updateMany({data:{count:Number(count)+1}})
//                //  if(up_result?.count){

//              const sql = ` update permission set  APPROVALSTATUS=:approvalStatus,APPROVED_BY=:approvedBy,REJECTED_BY=:rejectBy where DOCID=:docid  `     
//             const result_auvit = await connection.execute(sql,{approvalStatus:p_app,approvedBy,rejectBy,docid}) 
            
//             if(result_auvit?.rowsAffected >0){
                   
//                      if(p_app=="approved"){
//                          let sql = `INSERT INTO PSSATT AA
//     (HRMATTIMPORTID,HREMPLOYMASTID,IDCARD,ATTDATE,ATTTIME,INOUT,CHK,DTYPE,USERNAME,COMPCODE,PMNO,UNQID) 
// (

// SELECT * FROM (
// SELECT  B.PERMISSIONID HRMATTIMPORTID,D.HREMPLOYMASTID,B.IDCARD,B.DOCDATE ATTDATE,B.FTIME ATTTIME,0 INOUT,
// B.IDCARD||TO_CHAR(B.DOCDATE,'DD/MM/YYYY')||B.FTIME CHK,'PMIS - MOB' DTYPE,
// B.USERID USERNAME,C.COMPCODE,
// (SELECT MIN(MACNO) FROM (
// SELECT B.MACNO,MAX(B.MDATE) MDATE,MAX(B.HRMACIPENTRYDETROW) SNO FROM HRMACIPENTRY A
// JOIN HRMACIPENTRYDET B ON A.HRMACIPENTRYID = B.HRMACIPENTRYID
// JOIN GTCOMPMAST C ON C.GTCOMPMASTID = A.COMPCODE 
// WHERE C.COMPCODE = :COMPCODE AND B.MTYPE IN ('IN','IN/OUT') AND B.DEFAULTYN = 'YES' 
// GROUP BY B.MACNO 
// )
// WHERE MDATE <= B.DOCDATE) PMNO,
// CASE 
// WHEN LENGTH(B.IDCARD) = 1 THEN '00000000'||B.IDCARD 
// WHEN LENGTH(B.IDCARD) = 2 THEN '0000000'||B.IDCARD 
// WHEN LENGTH(B.IDCARD) = 3 THEN '000000'||B.IDCARD 
// WHEN LENGTH(B.IDCARD) = 4 THEN '00000'||B.IDCARD 
// WHEN LENGTH(B.IDCARD) = 5 THEN '0000'||B.IDCARD 
// WHEN LENGTH(B.IDCARD) = 6 THEN '000'||B.IDCARD 
// WHEN LENGTH(B.IDCARD) = 7 THEN '00'||B.IDCARD 
// WHEN LENGTH(B.IDCARD) = 8 THEN '0'||B.IDCARD ELSE B.IDCARD END
// ||' '||TO_CHAR(DOCDATE,'DD-MM-YYYY')||' '||B.FTIME  UNQID  
// FROM PERMISSION B,GTCOMPMAST C,HREMPLOYDETAILS D
// WHERE B.COMPCODE = C.COMPCODE AND D.IDCARD = B.IDCARD
// AND C.COMPCODE = :COMPCODE AND B.DOCID = :DOCID
// UNION
// SELECT  B.PERMISSIONID HRMATTIMPORTID,D.HREMPLOYMASTID,B.IDCARD,B.DOCDATE ATTDATE,B.TTIME ATTTIME,0 INOUT,
// B.IDCARD||TO_CHAR(B.DOCDATE,'DD/MM/YYYY')||B.TTIME CHK,'PMIS - MOB' DTYPE,B.USERID USERNAME,C.COMPCODE,
// (SELECT MIN(MACNO) FROM (
// SELECT B.MACNO,MAX(B.MDATE) MDATE,MAX(B.HRMACIPENTRYDETROW) SNO FROM HRMACIPENTRY A
// JOIN HRMACIPENTRYDET B ON A.HRMACIPENTRYID = B.HRMACIPENTRYID
// JOIN GTCOMPMAST C ON C.GTCOMPMASTID = A.COMPCODE 
// WHERE C.COMPCODE = :COMPCODE 
// AND B.MTYPE IN ('OUT','IN/OUT') AND B.DEFAULTYN = 'YES' 
// GROUP BY B.MACNO )
// WHERE MDATE <= B.DOCDATE) PMNO,
// CASE 
// WHEN LENGTH(B.IDCARD) = 1 THEN '00000000'||B.IDCARD 
// WHEN LENGTH(B.IDCARD) = 2 THEN '0000000'||B.IDCARD 
// WHEN LENGTH(B.IDCARD) = 3 THEN '000000'||B.IDCARD 
// WHEN LENGTH(B.IDCARD) = 4 THEN '00000'||B.IDCARD 
// WHEN LENGTH(B.IDCARD) = 5 THEN '0000'||B.IDCARD 
// WHEN LENGTH(B.IDCARD) = 6 THEN '000'||B.IDCARD 
// WHEN LENGTH(B.IDCARD) = 7 THEN '00'||B.IDCARD 
// WHEN LENGTH(B.IDCARD) = 8 THEN '0'||B.IDCARD ELSE B.IDCARD END
// ||' '||TO_CHAR(DOCDATE,'DD-MM-YYYY')||' '||B.TTIME  UNQID  
// FROM PERMISSION B,GTCOMPMAST C,HREMPLOYDETAILS D
// WHERE B.COMPCODE = C.COMPCODE AND D.IDCARD = B.IDCARD
// AND C.COMPCODE = :COMPCODE AND B.DOCID = :DOCID
// ) 
// )`     
//  await connection.execute(sql,{COMPCODE:COMPCODE,DOCID:docid}) 
                            
//            }

//              await prisma_Connector?.permissionEntry?.update({where:{docid:result?.docid}, data:{update:1}}).then(()=>{
//                 return  res.json({status:1,data:{...result}}) 
               
//                }).catch(()=>{
//                 return  res.json({status:0,data:{}})
//                })
              
//             }else{

//              await  prisma_Connector?.permissionEntry?.delete({where:{docid:docid}})
            
//                 res.json({status:0,message:"Failed to Request !"})   
//             }
                     
//               //   }else{
//                  //    prisma_Connector?.permissionEntry?.delete({where:{userId:result?.userId}}) 
//                  //    res.json({status:0,data:{}}) 
//                  }
 
                
                 
                
//              }
//              catch (err) {
//                 console.log(err);
                
//              }finally{
//                 connection?.commit()
//                 connection?.close()
//              }
             
//          }

export async function requestPermission_Approval(req, res) {
    const COMPCODE = String(req?.headers?.compcode).toUpperCase()
    const docid = req?.body?.docid
    const p_app = req?.body?.approval
    const approvedBy = req?.body?.approvedBy
    const rejectBy = req?.body?.rejectBy
    const connection = await getConnection(res)

    // ✅ Normalize Oracle TIMESTAMP or any date format → 'DD-MON-YYYY' e.g. '10-APR-2026'
    function toOracleDate(str) {
        if (!str) return null

        // Oracle TIMESTAMP: '10-APR-26 02.54.16.000000000 PM'
        if (/^\d{2}-[A-Z]{3}-\d{2}/i.test(str)) {
            const datePart = str.split(' ')[0]              // '10-APR-26'
            const [day, mon, yr] = datePart.split('-')
            const fullYear = Number(yr) >= 50 ? `19${yr}` : `20${yr}`  // 26 → 2026
            return `${day}-${mon}-${fullYear}`              // '10-APR-2026'
        }

        // YYYY-MM-DD
        if (/^\d{4}-\d{1,2}-\d{1,2}/.test(str)) {
            const [year, month, day] = str.split(/[-T ]/)
            return `${String(day).padStart(2,'0')}-${String(month).padStart(2,'0')}-${year}`
        }

        // DD-MM-YYYY or DD/MM/YYYY or D-M-YYYY
        if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(str)) {
            const parts = str.split(/[\/\-]/)
            return `${String(parts[0]).padStart(2,'0')}-${String(parts[1]).padStart(2,'0')}-${parts[2]}`
        }

        return str
    }

    try {
        const result = await prisma_Connector.permissionEntry.update({
            where: { docid },
            data: { approvalStatus: p_app, approvedBy, rejectBy }
        })

        if (result?.id) {

            const sql = `UPDATE PERMISSION SET APPROVALSTATUS=:approvalStatus, APPROVED_BY=:approvedBy, REJECTED_BY=:rejectBy WHERE DOCID=:docid`
            const result_auvit = await connection.execute(sql, { approvalStatus: p_app, approvedBy, rejectBy, docid })

            if (result_auvit?.rowsAffected > 0) {

                if (p_app == "approved") {

                    // ✅ Fetch raw DOCDATE and normalize in JS
                    const fmtCheck = await connection.execute(
                        `SELECT DOCDATE FROM PERMISSION WHERE DOCID=:docid AND ROWNUM=1`,
                        { docid }
                    )

                    const rawDate = fmtCheck?.rows?.[0]?.[0] ?? ''
                    const normalizedDate = toOracleDate(String(rawDate))

                    console.log('RAW DOCDATE     :', rawDate)
                    console.log('NORMALIZED DATE :', normalizedDate)  // should be '10-APR-2026'

                    const attSql = `
                        INSERT INTO PSSATT
                            (HRMATTIMPORTID, HREMPLOYMASTID, IDCARD, ATTDATE, ATTTIME, INOUT, CHK, DTYPE, USERNAME, COMPCODE, PMNO, UNQID)
                        SELECT * FROM (
                            -- IN punch (FTIME)
                            SELECT
                                B.PERMISSIONID                                                         AS HRMATTIMPORTID,
                                D.HREMPLOYMASTID,
                                B.IDCARD                                                               AS IDCARD,
                                TO_DATE(:DOCDATE, 'DD-MON-YYYY')                                       AS ATTDATE,
                                B.FTIME                                                                AS ATTTIME,
                                0                                                                      AS INOUT,
                                SUBSTR(B.IDCARD, 1, 10)
                                    || SUBSTR(:DOCDATE, 1, 10)
                                    || SUBSTR(B.FTIME, 1, 8)                                           AS CHK,
                                'PMIS - MOB'                                                           AS DTYPE,
                                B.USERID                                                               AS USERNAME,
                                C.COMPCODE,
                                (
                                    SELECT MIN(DET.MACNO)
                                    FROM HRMACIPENTRY    ENT
                                    JOIN HRMACIPENTRYDET DET ON DET.HRMACIPENTRYID = ENT.HRMACIPENTRYID
                                    JOIN GTCOMPMAST      CM  ON CM.GTCOMPMASTID    = ENT.COMPCODE
                                    WHERE CM.COMPCODE      = :COMPCODE
                                      AND DET.MTYPE        IN ('IN', 'IN/OUT')
                                      AND DET.DEFAULTYN    = 'YES'
                                      AND TRUNC(DET.MDATE) <= TO_DATE(:DOCDATE, 'DD-MON-YYYY')
                                )                                                                      AS PMNO,
                                LPAD(B.IDCARD, 9, '0')
                                    || ' ' || :DOCDATE
                                    || ' ' || SUBSTR(B.FTIME, 1, 8)                                    AS UNQID
                            FROM PERMISSION      B
                            JOIN GTCOMPMAST      C ON C.COMPCODE = B.COMPCODE
                            JOIN HREMPLOYDETAILS D ON D.IDCARD   = B.IDCARD
                            WHERE C.COMPCODE = :COMPCODE
                              AND B.DOCID    = :DOCID

                            UNION ALL

                            -- OUT punch (TTIME)
                            SELECT
                                B.PERMISSIONID                                                         AS HRMATTIMPORTID,
                                D.HREMPLOYMASTID,
                                B.IDCARD                                                               AS IDCARD,
                                TO_DATE(:DOCDATE, 'DD-MON-YYYY')                                       AS ATTDATE,
                                B.TTIME                                                                AS ATTTIME,
                                0                                                                      AS INOUT,
                                SUBSTR(B.IDCARD, 1, 10)
                                    || SUBSTR(:DOCDATE, 1, 10)
                                    || SUBSTR(B.TTIME, 1, 8)                                           AS CHK,
                                'PMIS - MOB'                                                           AS DTYPE,
                                B.USERID                                                               AS USERNAME,
                                C.COMPCODE,
                                (
                                    SELECT MIN(DET.MACNO)
                                    FROM HRMACIPENTRY    ENT
                                    JOIN HRMACIPENTRYDET DET ON DET.HRMACIPENTRYID = ENT.HRMACIPENTRYID
                                    JOIN GTCOMPMAST      CM  ON CM.GTCOMPMASTID    = ENT.COMPCODE
                                    WHERE CM.COMPCODE      = :COMPCODE
                                      AND DET.MTYPE        IN ('OUT', 'IN/OUT')
                                      AND DET.DEFAULTYN    = 'YES'
                                      AND TRUNC(DET.MDATE) <= TO_DATE(:DOCDATE, 'DD-MON-YYYY')
                                )                                                                      AS PMNO,
                                LPAD(B.IDCARD, 9, '0')
                                    || ' ' || :DOCDATE
                                    || ' ' || SUBSTR(B.TTIME, 1, 8)                                    AS UNQID
                            FROM PERMISSION      B
                            JOIN GTCOMPMAST      C ON C.COMPCODE = B.COMPCODE
                            JOIN HREMPLOYDETAILS D ON D.IDCARD   = B.IDCARD
                            WHERE C.COMPCODE = :COMPCODE
                              AND B.DOCID    = :DOCID
                        )`

                    await connection.execute(attSql, {
                        COMPCODE : COMPCODE,
                        DOCID    : docid,
                        DOCDATE  : normalizedDate    // ✅ '10-APR-2026'
                    })
                }

                await prisma_Connector?.permissionEntry?.update({
                    where: { docid: result?.docid },
                    data: { update: 1 }
                }).then(() => {
                    return res.json({ status: 1, data: { ...result } })
                }).catch(() => {
                    return res.json({ status: 0, data: {} })
                })

            } else {

                await prisma_Connector?.permissionEntry?.delete({ where: { docid: docid } })
                res.json({ status: 0, message: "Failed to Request !" })

            }
        }

    } catch (err) {
        console.log(err)
    } finally {
        connection?.commit()
        connection?.close()
    }
}


         




