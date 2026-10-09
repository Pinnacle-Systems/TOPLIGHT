import { prisma_Connector } from "../../index.js";
import fs from "fs"
import { v4 as uuidv4 } from 'uuid';

import { upload } from '../Utiles/Multer.js';
import path from "path";
import formatDateToOracle from "../Utiles/OracleDateFormat.js";
import { getConnection } from "../constants/db.connection.js";
import { generateKey } from "crypto";
import { generateUniqueId_Number } from "../Utiles/UniqueNumber.js";
import { decompressFile_data } from "../Utiles/decompress.js";
import { compressedFilePaths, jsonFilePaths } from "../Utiles/Paths.js";
import { __readStream } from "../Utiles/Streams.js";

import { promises as fsp } from 'fs';
import fetch from "node-fetch";

async function getAddressFromCoords(lat, lon) {
    if (!lat || !lon) return null;
    try {
        const url = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lon}.json?key=uCLvWhKdNKupgoRI1jEfdpo8Uca7OxMu&radius=50&language=en-US`;
        const res = await fetch(url);
        const data = await res.json();
        const best = data.addresses?.[0]?.address;
        const address = best?.freeformAddress ||
            `${best?.streetNumber || ''} ${best?.streetName || ''}, ${best?.municipality || 'Unknown'}`.trim();
        return address || `Near ${lat}, ${lon}`;
    } catch (e) {
        return `Near ${lat}, ${lon}`;
    }
}

export async function get__Onduty(req, res) {
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const hod=req.query?.hod
    const id=req.query?.id
        try {
            const result=await  prisma_Connector.onduty.findMany({where:hod ? {compCode:COMPCODE,hod:hod,create:1} : {compCode:COMPCODE,userId:id,create:1},include:{userdata:{select:{Employee:true,username:true,Idcard:true}},createdBy_user:{select:{Employee:true,username:true,Idcard:true}},modifiedBy_user:{select:{Employee:true,username:true,Idcard:true}}}});
             res.json({status:1,data:result}) 
        }
        catch (err) {
           console.log(err);
        }
}




export async function get__Onduty_edit(req, res) {
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    // const hod=req.query?.hod
    // const id=req.query?.id
        try {
            const result=await  prisma_Connector.onduty.findMany({where:{compCode:COMPCODE}});
             res.json({status:1,data:result}) 
        }
        catch (err) {
           console.log(err);
        }
}



export async function get__vechilekm(req, res) {
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
        const VEHICLENO=req.query?.VEHICLENO
    // const id=req.query?.id
        try {
            const result=await  prisma_Connector.vechilekm.findFirst({where:{COMPCODE,VEHICLENO}});
             res.json({status:1,data:result}) 
        }
        catch (err) {
           console.log(err);
        }
}



export async function Add__vechilekm(req, res) {
        const COMPCODE=String(req?.headers?.compcode).toUpperCase()
        const Idcard=String(req?.headers?.idcard)
        const VEHICLE=req?.body

       
        
    // const id=req.query?.id
        try {
            const result=await  prisma_Connector.vechilekm.upsert({where:{COMPCODE,VEHICLENO:VEHICLE?.VEHICLENO || ""+Idcard},create:VEHICLE?.VEHICLENO ? {...VEHICLE,COMPCODE,VEHICLENO:""+Idcard}:{...VEHICLE,COMPCODE},update:VEHICLE?.VEHICLENO ? {...VEHICLE,COMPCODE,VEHICLENO:""+Idcard}:{...VEHICLE,COMPCODE}});
            if(result?.id){
            
              
             res.json({status:1,data:VEHICLE?.VEHICLENO ? result : {...result,VEHICLENO:undefined}}) 
            }else{
              res.json({status:0,data:[]}) 
            }
        }
        catch (err) {
           console.log(err);
        }
}




export async function get__Vechile(req, res) {
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const  where=req?.query?.where ? JSON.parse(req?.query?.where) : undefined
console.log("where",where);

   
    const connection = await getConnection(res)
        try {

                const sql = `
             SELECT ROWNUM SNO,AA.*
       FROM(SELECT D.VEHICLENO "vechileno",  D.VEHICLENAME||' - '|| D.VEHICLENO  "vechilename" ,D.VEHINCHARGE USEDBY
FROM GTINSURANCE A
JOIN GTINSURANCEDET B ON A.GTINSURANCEID=B.GTINSURANCEID
JOIN GTINSDESCMAST C ON B.DESCOFINSASSET=C.GTINSDESCMASTID
LEFT JOIN HRVEHMAST D ON B.VEHICLENO=D.HRVEHMASTID
JOIN GTINSCOMPMAST E ON B.INSUREDBY=E.GTINSCOMPMASTID
JOIN GTCOMPMAST F ON A.COMPGROUP=F.COMPCODE
WHERE F.COMPCODE=:COMPCODE  AND B.VALIDTO-TO_DATE(SYSDATE) >= 0 )AA
`;


//${ where ? 'AND D.VEHINCHARGE=:USEDBY' : ""}
            const oracleResult = await connection.execute(sql, {COMPCODE});        
         const transformedResult = oracleResult?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            oracleResult.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
          
          return res.json({ statusCode: 0, data: transformedResult })
           
        }
        catch (err) {
          console.log(err);
           return res.json({ statusCode: 0, data: [] })
           
        }
}

export async function getPermissionRequest(req, res) {
  
    const hod=req?.query?.hod
    const emp=req?.query?.emp

   
    
 const COMPCODE=String(req?.headers?.compcode).toUpperCase()
 if(hod){
    try {
        const result = await prisma_Connector?.permissionEntry?.findMany({where:{compCode:COMPCODE,hod,approvalStatus:"pending",AND:{create:1}},include:{userdata:{select:{
            email:true,username:true,Idcard:true
        }}},})

      const result_Leave=await prisma_Connector?.leaveEntry?.findMany({where:{compCode:COMPCODE,hod,approvalStatus:"pending",AND:{create:1}},include:{userdata:{select:{
            email:true,username:true,Idcard:true
        }}},})

        const advance_request=await prisma_Connector?.advanceRequest?.findMany({where:{compCode:COMPCODE,hod,approvalStatus:"pending",AND:{create:1}},include:{userdata:{select:{
            email:true,username:true,Idcard:true
        }}},})

        console.log([...result,...result_Leave]);
        
        return res.json({ statusCode: 0, data: [...result,...result_Leave,...advance_request] })
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


async function get_last_Row_Onduty(COMPCODE){
     const result=await  prisma_Connector.onduty.findFirst({
             orderBy: {
                  id: 'desc',
                },
               select: {
                  id: true,
              },where:{compCode:COMPCODE}
            })

            return result
}

// ── INTERNAL HELPER FOR ATOMIC SEQUENCES ──────────────────────────────────
// Returns { count: number, docid: string }
async function getNextAtomicSequence(COMPCODE) {
    let counter;
    try {
        counter = await prisma_Connector.permissionDocID.update({
            where: { id: 1 },
            data: { count: { increment: 1 } }
        });
    } catch (err) {
        if (err.code === 'P2025') {
            counter = await prisma_Connector.permissionDocID.upsert({
                where: { id: 1 },
                create: { id: 1, count: 1000 },
                update: { count: { increment: 1 } }
            });
        } else {
            throw err;
        }
    }
    const nextId = counter.count;
    return {
        count: nextId,
        docid: `${COMPCODE}/OND-${String(nextId).padStart(6, '0')}`
    };
}

export async function getDocId(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase();
  const Idcard   = String(req?.headers?.idcard);

  try {
    // 1. Return existing active session docid if found
    const activeSession = await prisma_Connector.onduty.findFirst({
      where: {
        compCode:       COMPCODE,
        idcard:         Idcard,
        inout:          'IN',
        approvalStatus: { in: ['pending', 'approved'] },
      },
      orderBy: { id: 'desc' },
    });

    if (activeSession) {
      return res.json({
        status: 1,
        data: { count: activeSession.id, docid: activeSession.docid },
      });
    }

    // 2. ✅ PEEK only — read current counter, do NOT increment
    const counter = await prisma_Connector.permissionDocID.findUnique({
      where: { id: 1 },
    });

    const nextCount  = (counter?.count ?? 999) + 1;
    const previewDocid = `${COMPCODE}/OND-${String(nextCount).padStart(6, '0')}`;

    return res.json({
      status: 1,
      data: { count: nextCount, docid: previewDocid },
    });

  } catch (err) {
    console.error('getDocId Error:', err);
    return res.status(500).json({ status: 0, message: 'Error generating DocID preview' });
  }
}


export async function getIn(req, res) {
       const COMPCODE=String(req?.headers?.compcode).toUpperCase()
       const Idcard=String(req?.headers?.idcard)
      
        try {
            const result=await  prisma_Connector.onduty.findFirst({
                orderBy: {
                  id: 'desc',
                },include:{userdata:true},where:{compCode:COMPCODE,idcard:Idcard,inout:"IN",OR:[{approvalStatus:"approved"},{approvalStatus:"pending"}]}
              });
          
            
            
            res.json({status:1,data:result}) 
        }
        catch (err) {
           console.log(err);
           
        }
        
    }



// ---------------------------------------------------------------------------
// buildPrismaData
// ---------------------------------------------------------------------------
// Instead of spreading ...rest (which passes unknown/relation fields to Prisma),
// we WHITELIST every scalar column explicitly.
//
// Relation fields from req.body that need special handling:
//   userId   => userdata     { connect: { id } }
//   category => category_data{ connect: { id } }
//   hod      => scalar string (idcard of approver) — kept as-is
//   hr       => scalar string (idcard of hr)       — kept as-is
//
// Fields intentionally excluded from Prisma (frontend-only):
//   create, docCount, Isgo_onduty, docid
// ---------------------------------------------------------------------------
function buildPrismaData(body, photoname, in_time) {
  const {
    category,
    userId,
    hod,
    hr,
    empname,
    others,
    vechileno,
    start_km,
    bunk,
    Svechilekm,
    Evechilekm,
    in_location,
    in_latitude,
    in_longtiude,
    docdate,
    group,
    to_onduty,
  } = body;

  // userId  -> plain scalar string FK, NOT a relation connect.
  // category -> plain Int scalar FK, NOT a relation connect.
  // Both relation connects (userdata, category_data) are intentionally
  // avoided because they require the linked record to exist in MySQL,
  // but users/categories may live only in Oracle.
  const data = {
    hod:          hod          ?? null,
    hr:           hr           ?? null,
    empname:      empname      ?? null,
    others:       others       ?? null,
    vechileno:    vechileno    ?? null,
    start_km:     start_km     ?? null,
    bunk:         bunk         ?? null,
    Svechilekm:   Svechilekm   ?? null,
    Evechilekm:   Evechilekm   ?? null,
    in_location:  in_location  ?? null,
    in_latitude:  in_latitude  ?? null,
    in_longtiude: in_longtiude ?? null,
    docdate:      docdate ? new Date(docdate) : null,
    group:        group        ?? 'onduty',
    to_onduty:    to_onduty === true || to_onduty === 'true',
    photo:        String(photoname).trim(),
    in_time,
    ...(userId   != null                          ? { userId:   String(userId)   } : {}),
    ...(category != null && !isNaN(Number(category)) ? { category: Number(category) } : {}),
  };

  return data;
}


// ---------------------------------------------------------------------------
// reserveDocid
// Atomically reserves a unique docid via auto-increment PK.
// Only minimal fields written on the temp row; full data written on update.
// ---------------------------------------------------------------------------
async function reserveDocid(COMPCODE, idcard) {
  const next = await getNextAtomicSequence(COMPCODE);
  const tempDocid = `TEMP-${uuidv4()}`;

  const tempRow = await prisma_Connector.onduty.create({
    data: {
      docid:    tempDocid,
      idcard:   idcard,
      compCode: COMPCODE,
      inout:    '',
      create:   0,
    },
  });

  const finalRow = await prisma_Connector.onduty.update({
    where: { id: tempRow.id },
    data:  { docid: next.docid },
  });

  return finalRow;
}


// ---------------------------------------------------------------------------
// stTrack
// ---------------------------------------------------------------------------
export async function stTrack(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase();
  const Idcard   = String(req?.headers?.idcard);
  const doctrack = req?.body?.docid;

  try {
    let finalDocid = doctrack;

    if (finalDocid) {
      const existing = await prisma_Connector.onduty.findUnique({
        where: { docid: finalDocid },
      });
      if (!existing || existing.idcard !== Idcard) {
        finalDocid = null;
      }
    }

    if (!finalDocid) {
      const reserved = await reserveDocid(COMPCODE, Idcard);
      finalDocid = reserved.docid;
    }

    const result = await prisma_Connector.trackers.upsert({
      where:  { UserId: Idcard },
      create: { UserId: Idcard, isLive: true, COMPCODE, docid: finalDocid },
      update: { isLive: true, COMPCODE, docid: finalDocid },
    });

    return res.json({ status: 1, data: result });
  } catch (err) {
    console.error('stTrack error:', err);
    return res.json({ status: 0, message: 'Tracking startup failed' });
  }
}


// ---------------------------------------------------------------------------
// requestOnduty
// ---------------------------------------------------------------------------
export async function requestOnduty(req, res) {
  const COMPCODE  = String(req?.headers?.compcode).toUpperCase();
  const photoPath = req?.file?.path;
  const photoname = req?.file?.filename;

  const cleanupFile = () => {
    if (photoPath && fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
  };

  let connection     = null;
  let prismaRecord   = null;
  let isNewPrismaRow = false;

  try {
    const { category, create, docid, docCount, Isgo_onduty } = req.body;

    // 1. Validate
    if (!category || !create) {
      cleanupFile();
      return res.status(400).json({ status: 0, message: 'Category and create fields are required.' });
    }

    // 2. Block duplicate active session
    if (!Isgo_onduty) {
     const activeSession = await prisma_Connector.onduty.findFirst({
        where: {
          compCode:       COMPCODE,
          idcard:         req.headers.idcard,
          inout:          'IN',
          approvalStatus: { in: ['pending', 'approved'] },
           },
         });
      if (activeSession) {
        cleanupFile();
        return res.status(400).json({
          status:  0,
          message: 'You already have an active on-duty session. Please close it first.',
        });
      }
    }

    const in_time   = formatDateToOracle(new Date()).split(' ')[1];
    
    // Auto-fetch backend location
    if (req.body.in_latitude && req.body.in_longtiude) {
      const addr = await getAddressFromCoords(req.body.in_latitude, req.body.in_longtiude);
      if (addr) req.body.in_location = addr;
    }

    const prismaData = buildPrismaData(req.body, photoname, in_time);

    // 3. Resolve or create Prisma row
    if (docid) {
      const existing = await prisma_Connector.onduty.findUnique({ where: { docid } });
      const ownedByUser =
        existing &&
        (existing.idcard === req.headers.idcard || existing.idcard === req.body.idcard);

      if (ownedByUser) {
        prismaRecord = await prisma_Connector.onduty.update({
          where: { docid: existing.docid },
          data:  { ...prismaData, inout: 'IN', updatedAt: new Date() },
        });
        isNewPrismaRow = false;
      }
    }

    if (!prismaRecord) {
      // Step A: reserve a unique docid (minimal insert)
      const reserved = await reserveDocid(COMPCODE, req.headers.idcard);
      isNewPrismaRow = true;

      // Step B: write all the real data into that reserved row
      prismaRecord = await prisma_Connector.onduty.update({
        where: { id: reserved.id },
        data:  {
          ...prismaData,
          inout:     'IN',
          compCode:  COMPCODE,
          idcard:    req.headers.idcard,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // 4. Oracle INSERT
    connection = await getConnection(res);

    const oracleData = {
      ID:             generateUniqueId_Number(),
      DOCID:          prismaRecord.docid,
      IDCARD:         prismaRecord.idcard,
      EMPNAME:        prismaRecord.empname,
      HOD:            prismaRecord.hod,
      HR:             prismaRecord.hr,
      APPROVALSTATUS: String(prismaRecord.approvalStatus ?? 'pending'),
      USERID:         req.body.userId ?? null,
      OTHERS:         prismaRecord.others,
      GROUP_TYPE:     prismaRecord.group ?? 'onduty',
      INOUT:          prismaRecord.inout,
      PHOTO:          prismaRecord.photo,
      COMPCODE:       String(prismaRecord.compCode),
      IN_LOCATION:    prismaRecord.in_location,
      IN_TIME:        in_time,
      IN_LATITUDE:    prismaRecord.in_latitude,
      IN_LONGTIUDE:   prismaRecord.in_longtiude,
      VECHILENO:      prismaRecord.vechileno,
      BUNK:           prismaRecord.bunk,
      START_KM:       prismaRecord.start_km,
      SVECHILEKM:     prismaRecord.Svechilekm,
      CATEGORY:       Number(category) ?? 1,
      CREATE_FLAG:    Number(create)   ?? 0,
      TO_ONDUTY:      prismaRecord.to_onduty ? 1 : 0,
      UPDATEDAT:      formatDateToOracle(prismaRecord.updatedAt),
      CREATEDAT:      formatDateToOracle(prismaRecord.createdAt),
    };

    const sql = `
      INSERT INTO ONDUTY (
        id, docid, idcard, empname, hod, hr, approvalstatus,
        userid, others, group_type, inout, photo, compcode,
        in_location, in_time, in_latitude, in_longtiude,
        vechileno, bunk, start_km, svechilekm,
        category, create_flag, to_onduty, updatedat, createdat
      ) VALUES (
        :ID, :DOCID, :IDCARD, :EMPNAME, :HOD, :HR, :APPROVALSTATUS,
        :USERID, :OTHERS, :GROUP_TYPE, :INOUT, :PHOTO, :COMPCODE,
        :IN_LOCATION, :IN_TIME, :IN_LATITUDE, :IN_LONGTIUDE,
        :VECHILENO, :BUNK, :START_KM, :SVECHILEKM,
        :CATEGORY, :CREATE_FLAG, :TO_ONDUTY,
        TO_DATE(:UPDATEDAT, 'YYYY-MM-DD HH24:MI:SS'),
        TO_DATE(:CREATEDAT, 'YYYY-MM-DD HH24:MI:SS')
      )
    `;

    const oracleResult = await connection.execute(sql, oracleData);

    if (!oracleResult?.rowsAffected || oracleResult.rowsAffected < 1) {
      if (isNewPrismaRow) {
        await prisma_Connector.onduty.delete({ where: { id: prismaRecord.id } });
      }
      cleanupFile();
      return res.status(500).json({ status: 0, message: 'Oracle insert failed. Rolled back.' });
    }

    // 5. Both succeeded
    await connection.commit();

    await prisma_Connector.onduty.update({
      where: { docid: prismaRecord.docid },
      data:  { create: 1 },
    });

    await prisma_Connector.trackers.upsert({
      where:  { UserId: prismaRecord.idcard },
      create: { UserId: prismaRecord.idcard, isLive: true, COMPCODE, empname: prismaRecord.empname },
      update: { UserId: prismaRecord.idcard, isLive: true, COMPCODE, empname: prismaRecord.empname },
    });

    return res.status(201).json({
      status:  1,
      message: 'Onduty request created successfully',
      data: {
        id:        prismaRecord.id,
        docid:     prismaRecord.docid,
        category:  prismaRecord.category,
        createdAt: prismaRecord.createdAt,
        in_location: prismaRecord.in_location,
        in_latitude: prismaRecord.in_latitude,
        in_longtiude: prismaRecord.in_longtiude,
      },
    });

  } catch (err) {
    console.error('requestOnduty error:', err);

    try { await connection?.rollback(); } catch (_) {}

    if (isNewPrismaRow && prismaRecord?.id) {
      try {
        await prisma_Connector.onduty.delete({ where: { id: prismaRecord.id } });
        console.log(`Rolled back Prisma row id=${prismaRecord.id} docid=${prismaRecord.docid}`);
      } catch (rbErr) {
        console.error('Prisma rollback failed:', rbErr);
      }
    }

    cleanupFile();

    if (err.code === 'P2002') {
      return res.status(409).json({ status: 0, message: 'Duplicate entry detected' });
    }
    if (err.errorNum) {
      return res.status(500).json({ status: 0, message: `Oracle error: ${err.message}`, oraError: err.errorNum });
    }

    return res.status(500).json({
      status:  0,
      message: 'Internal server error',
      error:   process.env.NODE_ENV === 'development' ? err.message : undefined,
    });

  } finally {
    await connection?.close();
  }
}

export async function addOnduty_master(req, res) {
      const  data=req?.body?.data
       const COMPCODE=String(req?.headers?.compcode).toUpperCase()
          try {
           const result=await  prisma_Connector.ondutyMaster.create({data:{...data,COMPCODE}})  
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



export async function send_location(req, res) {
  console.log(req?.body);
  
      const  data=req?.body
       const COMPCODE=String(req?.headers?.compcode).toUpperCase()
          try {
           const result=await  prisma_Connector.location.create({data:{...data,COMPCODE}})  
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






 export async function get_live_user(req, res) {
         const COMPCODE = String(req?.headers?.compcode).toUpperCase();
       
          const dbResults = await prisma_Connector.trackers.findMany({ where: {isLive:true,COMPCODE}});

           res.json({status:1,data:dbResults})
  

  }


 export async function get_live_location(req, res) {
         const COMPCODE = String(req?.headers?.compcode).toUpperCase();
         const user=req?.query?.userId
         const today = new Date();
         const startOfDay = new Date(today.setHours(0, 0, 0, 0));
          const dbResults = await prisma_Connector.location.findMany({
         where: {
        COMPCODE,
         docId: { not: null },
         createdAt: { gte: startOfDay },
         userId:user
         },
        orderBy: {
        createdAt: 'desc', 
        },take: 1,
       });

    res.json(dbResults)
  

  }

export async function requestReachedOut(req, res) {
        const {docid, VEHICLENO, ...reset} = req?.body
        const COMPCODE = String(req.headers?.compcode).toUpperCase()
        const Idcard = String(req?.headers?.idcard)
        
        try {
            // 1. Fetch current record for KM validation
            const currentOnduty = await prisma_Connector.onduty.findUnique({
                where: { docid, idcard: Idcard, compCode: COMPCODE }
            });

            if (!currentOnduty) {
                return res.json({ status: 0, message: "Onduty record not found" });
            }

            // 2. Validate KM: Removed as per request to remove vehicle km entry


            const result = await prisma_Connector.onduty?.update({
                where: { docid, idcard: Idcard, inout: "OUT", compCode: COMPCODE },
                data: { ...reset }
            })

            if (result?.id) {
                await prisma_Connector?.vechilekm?.upsert({
                    where: { VEHICLENO: VEHICLENO || "" + Idcard },
                    create: { km: reset?.Evechilekm, VEHICLENO: VEHICLENO || "" + Idcard },
                    update: { km: reset?.Evechilekm, VEHICLENO: VEHICLENO || "" + Idcard }
                })
                await prisma_Connector?.trackers?.update({ where: { UserId: Idcard }, data: { endDocid: "" } })
                res.json({ status: 1, data: result })
            } else {
                res.json({ status: 0, data: {} })
            }
        } catch (err) {
            res.json({ status: 0, data: {} })
            console.error("requestReachedOut error:", err);
        } 
  }


  export async function get_reached(req, res) {
      const COMPCODE=String(req?.headers?.compcode).toUpperCase()
      const Idcard=String(req?.headers?.idcard)
        const today=new Date()
         const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        await prisma_Connector?.trackers?.findUnique({where:{UserId:Idcard}}).then(async (data)=>{
        try {
          if (!data?.endDocid) {
            return res.json({status:0,data:{}});
          }
          const result=await  prisma_Connector.onduty.findFirst({where:{compCode:COMPCODE,docid:data?.endDocid,inout:"OUT",Evechilekm:null,create:1,createdAt:{
             gte: startOfDay, lte: endOfDay 
           }}})
            if(result?.Evechilekm){
                  res.json({status:0,data:{}}) 
            }else{
                  res.json({status:1,data:result}) 
            }
        }
        catch (err) {
          res.json({status:0,data:{}}) 
           console.log(err);
           
        } 

      }).catch(()=>{

        res.json({status:500,data:{}}) 
      })

  }

export async function get_history_location(req, res) {
  const COMPCODE = String(req?.headers?.compcode || '').toUpperCase();
  const date     = req?.query?.date;
  const userId   = req?.query?.userId; // optional filter by user

  try {
    // ── 1. Date Range ─────────────────────────────────────────────────────────
    const today      = date ? new Date(date) : new Date();
    const startOfDay = new Date(new Date(today).setHours(0,  0,  0,   0));
    const endOfDay   = new Date(new Date(today).setHours(23, 59, 59, 999));

    // ── 2. Helper: Group by docId ─────────────────────────────────────────────
    function groupByDocId(dataArray) {
      return dataArray.reduce(
        (acc, item) => {
          if (!item.docId) return acc;
          if (!acc.docIds.includes(item.docId)) {
            acc.docIds.push(item.docId);
          }
          acc.groupedData[item.docId] = acc.groupedData[item.docId] || [];
          acc.groupedData[item.docId].push(item);
          return acc;
        },
        { groupedData: {}, docIds: [] }
      );
    }

    // ── 3. Try Live DB First ──────────────────────────────────────────────────
    const dbResults = await prisma_Connector.location.findMany({
      where: {
        COMPCODE,
        docId:     { not: null },
        createdAt: { gte: startOfDay, lte: endOfDay },
        ...(userId && { userId }), // ✅ optional user filter
      },
      orderBy: { createdAt: 'asc' },
    });

    if (dbResults.length > 0) {
      const { groupedData, docIds } = groupByDocId(dbResults);
      return res.json({              // ✅ single return
        status: 1,
        data:   [groupedData],
        meta:   docIds,
        source: 'db',
      });
    }

    // ── 4. Fallback: Compressed File ──────────────────────────────────────────
    const jsonpath      = jsonFilePaths(date);
    const compressdata  = compressedFilePaths(date);

    // Decompress if json not already extracted
    if (!fs.existsSync(jsonpath)) {
      const decompressed = await decompressFile_data(compressdata, jsonpath);
      if (!decompressed || !fs.existsSync(jsonpath)) {
        return res.json({
          status:  0,
          data:    [],
          meta:    [],
          message: 'No data found for this date.',
        });
      }
    }

    // ── 5. Read File ──────────────────────────────────────────────────────────
    let fileContent;
    try {
      fileContent = await fsp.readFile(jsonpath, 'utf8');
    } catch (readErr) {
      console.error('File read error:', readErr);
      return res.json({
        status:  'err',
        data:    [],
        meta:    [],
        message: 'Failed to read history file.',
      });
    }

    // ── 6. Parse JSON safely ──────────────────────────────────────────────────
    let jsonData;
    try {
      const trimmed = fileContent.trim();
      // Handle edge case: file starts with { instead of [
      if (trimmed.startsWith('{')) {
        jsonData = JSON.parse(`[${trimmed.replace(/}\s*{/g, '},{')}]`);
      } else {
        jsonData = JSON.parse(trimmed);
      }
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr);
      console.error('Content preview:', fileContent.substring(0, 200));
      return res.json({
        status:  'err',
        data:    [],
        meta:    [],
        message: 'Failed to parse history file.',
      });
    }

    // ── 7. Filter by userId if provided ──────────────────────────────────────
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    const filtered  = userId
      ? dataArray.filter((item) => item.userId === userId)
      : dataArray;

    if (filtered.length === 0) {
      return res.json({
        status:  0,
        data:    [],
        meta:    [],
        message: 'No location data found for this user/date.',
      });
    }

    // ── 8. Group & Respond ────────────────────────────────────────────────────
    const { groupedData, docIds } = groupByDocId(filtered);

    // ── 9. Cleanup extracted JSON file ────────────────────────────────────────
    try {
      await fsp.unlink(jsonpath); // ✅ delete BEFORE responding
    } catch (unlinkErr) {
      console.error('File delete error:', unlinkErr); // non-fatal
    }

    return res.json({              // ✅ single return, no double response
      status: 1,
      data:   [groupedData],
      meta:   docIds.filter(Boolean),
      source: 'file',
    });

  } catch (err) {
    console.error('get_history_location error:', err);
    return res.json({
      status:  'err',
      data:    [],
      meta:    [],
      message: 'Internal server error',
      error:   process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}






export async function requestOndutyOut(req, res) {
  const { docid, ...reset } = req?.body;
  const COMPCODE  = String(req.headers?.compcode).toUpperCase();
  const Idcard    = String(req?.headers?.idcard);
  const out_time  = formatDateToOracle(new Date()).split(' ')[1];

  // Auto-fetch backend location
  if (reset.out_latitude && reset.out_longtiude) {
    const addr = await getAddressFromCoords(reset.out_latitude, reset.out_longtiude);
    if (addr) reset.out_location = addr;
  }

  const connection = await getConnection(res);

  try {
    // 1. Validate
    if (!docid) {
      return res.status(400).json({ status: 0, message: 'docid is required.' });
    }

    // 2. Check record exists
    const existing = await prisma_Connector.onduty.findUnique({ where: { docid } });

    if (!existing) {
      return res.status(404).json({ status: 0, message: `No onduty record found for docid: ${docid}` });
    }

    // 3. Security: ensure this user owns the record
    if (existing.idcard !== Idcard) {
      return res.status(403).json({ status: 0, message: 'Unauthorized: This OnDuty record does not belong to you.' });
    }

    // 4. Guard: prevent re-closing an already closed session
    if (existing.inout === 'OUT') {
      return res.status(409).json({
        status:   0,
        message:  'This OnDuty session is already checked out.',
        data:     { docid: existing.docid, out_time: existing.out_time },
      });
    }

    // 5. Prisma UPDATE
    const result = await prisma_Connector.onduty.update({
      where: { docid },
      data: {
        ...reset,
        out_time,
        inout:     'OUT',
        updatedAt: new Date(),
      },
    });

    if (!result?.id) {
      return res.status(500).json({ status: 0, message: 'Prisma update failed.' });
    }

    // 6. Oracle UPDATE
    const sql = `
      UPDATE ONDUTY
      SET
        OUT_LOCATION  = :OUT_LOCATION,
        OUT_LATITUDE  = :OUT_LATITUDE,
        OUT_LONGTIUDE = :OUT_LONGTIUDE,
        OUT_TIME      = :OUT_TIME,
        END_KM        = :END_KM,
        INOUT         = 'OUT',
        TO_ONDUTY     = :TO_ONDUTY,
        UPDATEDAT     = SYSDATE,
        UPDATE_FLAG   = 1
      WHERE DOCID    = :DOCID
        AND COMPCODE = :COMPCODE
    `;

    const oracleBinds = {
      OUT_LOCATION:  result?.out_location  ?? null,
      OUT_LATITUDE:  result?.out_latitude  ?? null,
      OUT_LONGTIUDE: result?.out_longtiude ?? null,
      OUT_TIME:      result?.out_time      ?? null,
      END_KM:        result?.end_km        ?? null,
      TO_ONDUTY:     result?.to_onduty ? 1 : 0,
      DOCID:         result?.docid,
      COMPCODE:      COMPCODE,
    };

    const oracleResult = await connection.execute(sql, oracleBinds);

    if (oracleResult?.rowsAffected > 0) {

      // 7. Mark as synced
      await prisma_Connector.onduty.update({
        where: { docid: result?.docid },
        data:  { update: 1 },
      });

      // ✅ 8. FIX: Use null instead of '' for docid to avoid unique constraint clash
      await prisma_Connector.trackers.upsert({
        where:  { UserId: Idcard },
        create: {
          UserId:   Idcard,
          isLive:   false,
          COMPCODE,
          docid:    null,                            // ✅ FIXED: was ''
          endDocid: reset?.to_onduty ? null : docid, // ✅ FIXED: null instead of ''
        },
        update: {
          isLive:   false,
          COMPCODE,
          docid:    null,                            // ✅ FIXED: was ''
          endDocid: reset?.to_onduty ? '' : docid,
        },
      });

      return res.status(200).json({
        status:  1,
        data:    result,
        isNext:  !!reset?.to_onduty,
        message: 'OnDuty OUT submitted successfully.',
      });

    } else {
      // 9. Oracle failed — revert Prisma
      await prisma_Connector.onduty.update({
        where: { docid },
        data: {
          out_location:  existing.out_location,
          out_latitude:  existing.out_latitude,
          out_longtiude: existing.out_longtiude,
          out_time:      existing.out_time,
          end_km:        existing.end_km,
          inout:         existing.inout,
          to_onduty:     existing.to_onduty,
          updatedAt:     existing.updatedAt,
        },
      });

      return res.status(500).json({ status: 0, message: 'Oracle update failed. Prisma reverted.' });
    }

  } catch (err) {
    console.error('requestOndutyOut error:', err);

    if (err.code === 'P2002') {
      return res.status(409).json({ status: 0, message: 'Duplicate entry detected in trackers. Please try again.' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ status: 0, message: 'Onduty record not found.' });
    }
    if (err.errorNum) {
      return res.status(500).json({ status: 0, message: `Oracle error: ${err.message}`, oraError: err.errorNum });
    }

    return res.status(500).json({
      status:  0,
      message: 'Internal server error',
      error:   process.env.NODE_ENV === 'development' ? err.message : undefined,
    });

  } finally {
    await connection?.commit();
    await connection?.close();
  }
}







 export async function requestonduty_Approval(req, res) {
  const COMPCODE    = String(req.headers?.compcode).toUpperCase();
  const docid       = req?.body?.docid;
  const p_app       = req?.body?.approval;
  const approvedBy  = req?.body?.approvedBy;
  const rejectBy    = req?.body?.rejectBy;
  const reject_reason = req?.body?.reject_reason;


    

  const connection = await getConnection(res);

  try {
    // ── 1. Validate ───────────────────────────────────────────────────────────
    if (!docid || !p_app) {
      return res.status(400).json({
        status:  0,
        message: "docid and approval status are required.",
      });
    }

    if (!["approved", "rejected", "pending"].includes(p_app)) {
      return res.status(400).json({
        status:  0,
        message: `Invalid approval status: ${p_app}`,
      });
    }

    if (p_app === "rejected" && !reject_reason) {
      return res.status(400).json({
        status:  0,
        message: "reject_reason is required when rejecting.",
      });
    }

    // ── 2. Check record exists ────────────────────────────────────────────────
    const existing = await prisma_Connector.onduty.findUnique({
      where: { docid },
    });


     

    if (!existing) {
      return res.status(404).json({
        status:  0,
        message: `No onduty record found for docid: ${docid}`,
      });
    }

    // ── 3. Prisma UPDATE ──────────────────────────────────────────────────────
    const result = await prisma_Connector.onduty.update({
      where: { docid },
      data: {
        approvalStatus: p_app,
        approvedBy:     approvedBy ?? null,
        rejectBy:       rejectBy   ?? null,
        reject_reason:  reject_reason ?? null, // ✅ now saved
        updatedAt:      new Date(),
      },
    });


     

    if (!result?.id) {
      return res.status(500).json({
        status:  0,
        message: "Prisma update failed.",
      });
    }

    // ── 4. Oracle UPDATE ──────────────────────────────────────────────────────
    const sql = `
      UPDATE ONDUTY
      SET
        APPROVALSTATUS = :APPROVALSTATUS,
        APPROVEDBY     = :APPROVEDBY,
        REJECTBY       = :REJECTBY,
        REJECT_REASON  = :REJECT_REASON,
        UPDATEDAT      = SYSDATE,
        UPDATE_FLAG    = 1
      WHERE DOCID    = :DOCID
        AND COMPCODE = :COMPCODE
    `;

    const oracleBinds = {
      APPROVALSTATUS: p_app,
      APPROVEDBY:     approvedBy    ?? null,  // ✅ null safe
      REJECTBY:       rejectBy      ?? null,  // ✅ null safe
      REJECT_REASON:  reject_reason ?? null,  // ✅ now synced to Oracle
      DOCID:          docid,                  // ✅ matches :DOCID
      COMPCODE:       COMPCODE,
    };


  

    const oracleResult = await connection.execute(sql, oracleBinds);

    if (oracleResult?.rowsAffected > 0) {

      // ── 5. Mark as synced ───────────────────────────────────────────────────
      await prisma_Connector.onduty.update({
        where: { docid: result?.docid },
        data:  { update: 1 },
      });

      return res.status(200).json({
        status:  1,
        data:    { ...result },
        message: `OnDuty ${p_app} successfully.`,
      });

    } else {
      // ── 6. Oracle failed — revert Prisma ────────────────────────────────────
      await prisma_Connector.onduty.update({
        where: { docid },
        data: {
          approvalStatus: existing.approvalStatus,
          approvedBy:     existing.approvedBy,
          rejectBy:       existing.rejectBy,
          reject_reason:  existing.reject_reason,
          updatedAt:      existing.updatedAt,
        },
      });

      return res.status(500).json({
        status:  0,
        message: "Oracle update failed. Prisma reverted.",
      });
    }

  } catch (err) {
    console.error("requestonduty_Approval error:", err);

    // Prisma record not found
    if (err.code === "P2025") {
      return res.status(404).json({
        status:  0,
        message: "Onduty record not found in Prisma.",
      });
    }

  
    

    // Oracle specific error
    if (err.errorNum) {
      return res.status(500).json({
        status:   0,
        message:  `Oracle error: ${err.message}`,
        oraError: err.errorNum,
      });
    }

    return res.status(500).json({
      status:  0,
      message: "Internal server error",
      error:   process.env.NODE_ENV === "development" ? err.message : undefined,
    });

  } finally {
    await connection?.commit(); // ✅ awaited
    await connection?.close();  // ✅ awaited
  }
}



         export async function get_all_Onduty_reason(req, res) {
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()

        try {
            const result=await  prisma_Connector.ondutyMaster.findMany({where:{COMPCODE}})
            res.json({status:1,data:result}) 
        }
        catch (err) {
          res.json({status:0,data:{}}) 
           console.log(err);
           
        }
}

export async function get_Uploaded_IMAG(req, res){
  try {
     const filename=req?.query?.image
     if(filename){
     const ImagePath=path.join(process.cwd(),".","uploads")
      res.setHeader('Content-Type', 'image/png');
         if(fs.existsSync(ImagePath+"/"+filename)){
       
         const ImageStream=fs?.createReadStream(ImagePath+"/"+filename)
         ImageStream.pipe(res)
           }else{
        res?.json({error:"No Image Founded"}) 
         }
     }

       } catch (error) {
        res?.json({error:"No Image Founded"})
    
  }

}






export async function get__Date_Wise_Fuel(req, res) {
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const where=req?.query
    const connection = await getConnection(res)
        try {

                const sql = `
         SELECT ROWNUM SNO,AA.*
FROM 
(SELECT AA.VEHICLENO,AA.USEDBY,SUM(AA.TOTKM) TOTKM,AA.ITEMNAME,AA.VEHNAME,
SUM(TO_NUMBER(AA.LTRSKGS)
) 
AMOUNT
FROM 
(SELECT A.GTFUELTOKENID,A.FUELID,A.TOKENNO,A.TOKENDATE,A.EMPNAME,D.VEHICLENO,D.VEHICLENAME,
CC.ITEMNAME,AA.LTRSKGS,A.REMARKS,BB.BUNKNAME,A.USEDBY,A.KILOMETER,A.PREKM,
CASE WHEN A.PREKM=0 THEN 0 ELSE A.TOTKM END TOTKM,A.BUNKTONO,A.VEHNAME
FROM GTFUELTOKEN A
JOIN GTFUELTOKENITEMDET AA ON AA.GTFUELTOKENID=A.GTFUELTOKENID
JOIN GTGENITEMMAST CC ON CC.GTGENITEMMASTID=AA.ITEMNAME
JOIN GTFINANCIALYEAR B ON A.FINYEAR=B.GTFINANCIALYEARID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID=A.COMPCODE
JOIN GTBUNKMAST BB ON BB.GTBUNKMASTID=A.BUNKNAME
JOIN HRVEHMAST D ON D.HRVEHMASTID=A.VEHICLENO

WHERE C.COMPCODE=:COMPCODE AND A.TOKENDATE BETWEEN TO_DATE(:FROMDATE,'DD-MM-YYYY') AND  TO_DATE(:TODATE,'DD-MM-YYYY')  AND (D.VEHICLENO=:VEHICLENO1 OR 'ALL' = :VEHICLENO1)


ORDER BY A.TOKENNO,D.VEHICLENAME

)

AA

GROUP BY AA.VEHICLENO,AA.USEDBY,AA.ITEMNAME,AA.VEHNAME)AA
`;



            const oracleResult = await connection.execute(sql, {COMPCODE,...where});

         const transformedResult = oracleResult?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            oracleResult.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
          
          return res.json({ statusCode: 0, data: transformedResult })
           
        }
        catch (err) {
           console.log(err);
        }
}




export async function get__Date_Wise_Fuel_Individual(req, res) {
    const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const where=req?.query
    const connection = await getConnection(res)
        try {

                const sql = `
       SELECT ROWNUM SNO,AA.GTFUELTOKENID,AA.FUELID,AA.TOKENNO,AA.TOKENDATE,AA.EMPNAME,AA.VEHICLENO,AA.VEHICLENAME,AA.BUNKNAME,AA.ITEMNAME,
TO_NUMBER(AA.LTRSKGS) AMOUNT,AA.REMARKS,AA.USEDBY,AA.KILOMETER,AA.PREKM,AA.TOTKM,AA.BUNKTONO
FROM (
SELECT A.GTFUELTOKENID,A.FUELID,A.TOKENNO,A.TOKENDATE,A.EMPNAME,D.VEHICLENO,D.VEHICLENAME,
CC.ITEMNAME,AA.LTRSKGS,A.REMARKS,BB.BUNKNAME,A.USEDBY,A.KILOMETER,A.PREKM,
CASE WHEN A.PREKM=0 THEN 0 ELSE A.TOTKM END TOTKM,A.BUNKTONO
FROM GTFUELTOKEN A
JOIN GTFUELTOKENITEMDET AA ON AA.GTFUELTOKENID=A.GTFUELTOKENID
JOIN GTGENITEMMAST CC ON CC.GTGENITEMMASTID=AA.ITEMNAME
JOIN GTFINANCIALYEAR B ON A.FINYEAR=B.GTFINANCIALYEARID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID=A.COMPCODE
JOIN GTBUNKMAST BB ON BB.GTBUNKMASTID=A.BUNKNAME
JOIN HRVEHMAST D ON D.HRVEHMASTID=A.VEHICLENO
WHERE C.COMPCODE=:COMPCODE And A.TOKENDATE BETWEEN TO_DATE(:FROMDATE,'DD-MM-YYYY') AND  TO_DATE(:TODATE,'DD-MM-YYYY')   AND (D.VEHICLENO=:VEHICLENO1 OR 'ALL' = :VEHICLENO1)
ORDER BY A.TOKENNO
)AA
  `;



            const oracleResult = await connection.execute(sql, {COMPCODE,...where});

         const transformedResult = oracleResult?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            oracleResult.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
          
          return res.json({ statusCode: 0, data: transformedResult })
           
        }
        catch (err) {
           console.log(err);
        }
}
   






