import { prisma_Connector } from "../../index.js";
import fs from "fs"
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import formatDateToOracle from "../utils/oracleDateFormat.js";
import { getConnection } from "../constants/dbConnection.js";
import { generateUniqueId_Number } from "../utils/idGenerator.js";
import { compressedFilePaths, jsonFilePaths } from "../utils/paths.js";
import { mapOnduty, mapOndutyeSingle, mapOndutyMaster, mapOndutyMasterList } from "../utils/responseMapper.js";
import { logServiceError } from "../utils/logger.js";

import { promises as fsp } from 'fs';
import fetch from "node-fetch";
import { gunzipSync } from 'fflate';

async function getAddressFromCoords(lat, lon) {
  if (!lat || !lon) return null;
  const nLat = Number(lat);
  const nLon = Number(lon);
  if (isNaN(nLat) || isNaN(nLon) || (nLat === 0 && nLon === 0)) return null;

  try {
    const tomtomKey = process.env.TOMTOM_API_KEY;
    const url = `https://api.tomtom.com/search/2/reverseGeocode/${nLat},${nLon}.json?key=${tomtomKey}&radius=50&language=en-US`;
    const res = await fetch(url);
    const data = await res.json();
    const best = data.addresses?.[0]?.address;
    if (!best) return null;

    const street = `${best?.streetNumber || ''} ${best?.streetName || ''}`.trim();
    const municipality = best?.municipality || best?.countrySubdivision || '';
    const rawAddr = best?.freeformAddress || (street ? `${street}, ${municipality}` : municipality);
    const clean = String(rawAddr || '').trim().replace(/^,\s*/, '');
    return clean && clean !== 'Unknown' && clean !== ', Unknown' ? clean : null;
  } catch (e) {
    logServiceError('OnDutyService:OnDutyService', e, req);
    return null;
  }
}

export async function get__Onduty(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase();
  const hod = req.query?.hod;
  const id = req.query?.id;
  try {
    const result = await prisma_Connector.onduty.findMany({
      where: hod
        ? { compCode: COMPCODE, OR: [{ hod: hod }, { hr: hod }], create: 1 }
        : { compCode: COMPCODE, userId: id, create: 1 },
      include: {
        userData: { select: { userName: true, idCard: true } },
        createdByUser: { select: { userName: true, idCard: true } },
        modifiedByUser: { select: { userName: true, idCard: true } }
      }
    });
    res.json({ status: 1, data: (result || []).map(mapOnduty) });
  }
  catch (err) {
    logServiceError('OnDutyService:get__Onduty', err, req);
    console.log(err);
    res.json({ status: 0, data: [] });
  }
}




export async function get__Onduty_edit(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase();
  try {
    const result = await prisma_Connector.onduty.findMany({ where: { compCode: COMPCODE } });
    res.json({ status: 1, data: (result || []).map(mapOnduty) });
  }
  catch (err) {
    logServiceError('OnDutyService:get__Onduty_edit', err, req);
    console.log(err);
    res.json({ status: 0, data: [] });
  }
}



export async function get__vechilekm(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase()
  const VEHICLENO = req.query?.VEHICLENO
  // const id=req.query?.id
  try {
    const result = await prisma_Connector.vechilekm.findFirst({ where: { compCode: COMPCODE, vehicleNo: VEHICLENO } });
    res.json({ status: 1, data: result })
  }
  catch (err) {
    logServiceError('OnDutyService:get__vechilekm', err, req);
    console.log(err);
  }
}



export async function Add__vechilekm(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase()
  const Idcard = String(req?.headers?.idcard)
  const VEHICLE = req?.body



  // const id=req.query?.id
  try {
    const result = await prisma_Connector.vechilekm.upsert({ where: { vehicleNo: VEHICLE?.vehicleNo || "" + Idcard }, create: VEHICLE?.vehicleNo ? { ...VEHICLE, compCode: COMPCODE, vehicleNo: "" + Idcard } : { ...VEHICLE, compCode: COMPCODE }, update: VEHICLE?.vehicleNo ? { ...VEHICLE, compCode: COMPCODE, vehicleNo: "" + Idcard } : { ...VEHICLE, compCode: COMPCODE } });
    if (result?.id) {


      res.json({ status: 1, data: VEHICLE?.VEHICLENO ? result : { ...result, VEHICLENO: undefined } })
    } else {
      res.json({ status: 0, data: [] })
    }
  }
  catch (err) {
    logServiceError('OnDutyService:Add__vechilekm', err, req);
    console.log(err);
  }
}




export async function get__Vechile(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase();
  const where = req?.query?.where ? JSON.parse(req?.query?.where) : undefined;
  console.log("where", where);

  let connection = null;
  try {
    connection = await getConnection(res);
    if (!connection) return;

    const sql = `
             SELECT ROWNUM SNO, AA.*
             FROM (
                SELECT D.VEHICLENO "vechileno", D.VEHICLENAME||' - '|| D.VEHICLENO "vechilename", D.VEHINCHARGE USEDBY
                FROM GTINSURANCE A
                JOIN GTINSURANCEDET B ON A.GTINSURANCEID=B.GTINSURANCEID
                JOIN GTINSDESCMAST C ON B.DESCOFINSASSET=C.GTINSDESCMASTID
                LEFT JOIN HRVEHMAST D ON B.VEHICLENO=D.HRVEHMASTID
                JOIN GTINSCOMPMAST E ON B.INSUREDBY=E.GTINSCOMPMASTID
                JOIN GTCOMPMAST F ON A.COMPGROUP=F.COMPCODE
                WHERE F.COMPCODE=:COMPCODE AND B.VALIDTO-TO_DATE(SYSDATE) >= 0
             ) AA
        `;

    const oracleResult = await connection.execute(sql, { COMPCODE });
    const transformedResult = oracleResult?.rows?.map(row => {
      const keyValuePair = {};
      oracleResult.metaData.forEach((col, index) => {
        keyValuePair[col.name] = row[index];
      });
      return keyValuePair;
    });

    return res.json({ statusCode: 0, data: transformedResult || [] });
  }
  catch (err) {
    logServiceError('OnDutyService:get__Vechile', err, req);
    if (err.errorNum === 942 || err.code === 'ORA-00942') {
      console.warn(`[get__Vechile] Vehicle/insurance tables not found in Oracle schema (ORA-00942) for ${COMPCODE}. Returning empty vehicle list.`);
    } else {
      console.error('get__Vechile error:', err);
    }
    return res.json({ statusCode: 0, data: [] });
  }
  finally {
    try {
      await connection?.close();
    } catch (_) { }
  }
}

export async function getPermissionRequest(req, res) {

  const hod = req?.query?.hod
  const emp = req?.query?.emp



  const COMPCODE = String(req?.headers?.compcode).toUpperCase()
  if (hod) {
    try {
      const result = await prisma_Connector?.permissionEntry?.findMany({
        where: { compCode: COMPCODE, hod, approvalStatus: "pending", AND: { create: 1 } }, include: {
          userData: {
            select: {
              email: true, userName: true, idCard: true
            }
          }
        },
      })

      const result_Leave = await prisma_Connector?.leaveEntry?.findMany({
        where: { compCode: COMPCODE, hod, approvalStatus: "pending", AND: { create: 1 } }, include: {
          userData: {
            select: {
              email: true, userName: true, idCard: true
            }
          }
        },
      })

      console.log([...result, ...result_Leave]);

      return res.json({ statusCode: 0, data: [...result, ...result_Leave] })
    }
    catch (err) {
      logServiceError('OnDutyService:getPermissionRequest', err, req);
      console.error('Error retrieving data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
    }
  } else if (emp) {
    return res.json({ statusCode: 0, data: [] })
  }
}


async function get_last_Row_Onduty(COMPCODE) {
  const result = await prisma_Connector.onduty.findFirst({
    orderBy: {
      id: 'desc',
    },
    select: {
      id: true,
    }, where: { compCode: COMPCODE }
  })

  return result
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ INTERNAL HELPER FOR ATOMIC SEQUENCES ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Returns { count: number, docid: string }
async function getNextAtomicSequence(COMPCODE) {
  let counter;
  const docModel = prisma_Connector.permissionDocId || prisma_Connector.permissionDocID;
  try {
    counter = await docModel.update({
      where: { id: 1 },
      data: { count: { increment: 1 } }
    });
  } catch (err) {
    logServiceError('OnDutyService:getPermissionRequest', err, req);
    if (err.code === 'P2025') {
      counter = await docModel.upsert({
        where: { id: 1 },
        create: { id: 1, count: 1000 },
        update: { count: { increment: 1 } }
      });
    } else {
      throw err;
    }
  }
  const nextId = counter.count;
  const docIdFormatted = `${COMPCODE}/OND-${String(nextId).padStart(6, '0')}`;
  return {
    count: nextId,
    docId: docIdFormatted,
    docid: docIdFormatted
  };
}

export async function getDocId(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase();
  const Idcard = String(req?.headers?.idcard);

  try {
    // 1. Return existing active session docid if found
    const activeSession = await prisma_Connector.onduty.findFirst({
      where: {
        compCode: COMPCODE,
        idCard: Idcard,
        inOut: 'IN',
        approvalStatus: { in: ['pending', 'approved'] },
      },
      orderBy: { id: 'desc' },
    });

    if (activeSession) {
      return res.json({
        status: 1,
        data: { count: activeSession.id, docId: activeSession.docId, docid: activeSession.docId },
      });
    }

    // 2. PEEK only Ã¢â‚¬â€ read current counter, do NOT increment
    const docModel = prisma_Connector.permissionDocId || prisma_Connector.permissionDocID;
    const counter = await docModel?.findUnique({
      where: { id: 1 },
    });

    const nextCount = (counter?.count ?? 999) + 1;
    const previewDocid = `${COMPCODE}/OND-${String(nextCount).padStart(6, '0')}`;

    return res.json({
      status: 1,
      data: { count: nextCount, docid: previewDocid, docId: previewDocid },
    });

  } catch (err) {
    logServiceError('OnDutyService:getDocId', err, req);
    console.error('getDocId Error:', err);
    return res.status(500).json({ status: 0, message: 'Error generating DocID preview' });
  }
}


export async function getIn(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase();
  const Idcard = String(req?.headers?.idcard);

  try {
    const result = await prisma_Connector.onduty.findFirst({
      orderBy: {
        id: 'desc',
      },
      include: { userData: true },
      where: {
        compCode: COMPCODE,
        idCard: Idcard,
        inOut: "IN",
        OR: [{ approvalStatus: "approved" }, { approvalStatus: "pending" }]
      }
    });

    if (result && (!result.inLocation || result.inLocation === 'Location unavailable' || !result.inLatitude || Number(result.inLatitude) === 0)) {
      try {
        const firstTrack = await prisma_Connector.location.findFirst({
          where: { docId: result.docId },
          orderBy: { id: 'asc' },
        });
        const bestTrack = firstTrack || await prisma_Connector.location.findFirst({
          where: { userId: Idcard, compCode: COMPCODE },
          orderBy: { id: 'desc' },
        });
        if (bestTrack && bestTrack.latitude && bestTrack.longitude && Number(bestTrack.latitude) !== 0) {
          result.inLatitude = String(bestTrack.latitude);
          result.inLongtiude = String(bestTrack.longitude);
          result.inLocation = bestTrack.address || `Near ${Number(bestTrack.latitude).toFixed(4)}, ${Number(bestTrack.longitude).toFixed(4)}`;
          await prisma_Connector.onduty.update({
            where: { id: result.id },
            data: {
              inLocation: result.inLocation,
              inLatitude: result.inLatitude,
              inLongtiude: result.inLongtiude,
            }
          });
        }
      } catch (healErr) {
        logServiceError('OnDutyService:getIn', healErr, req);
        console.warn('[getIn] Failed to heal departure location:', healErr);
      }
    }

    res.json({ status: 1, data: mapOnduty(result) });
  }
  catch (err) {
    logServiceError('OnDutyService:getIn', err, req);
    console.error('getIn Error:', err);
    return res.status(500).json({
      status: 0,
      message: 'Failed to fetch active OnDuty session',
    });
  }
}

function buildPrismaData(body, photoname, in_time) {
  const {
    category,
    userId,
    hod,
    hr,
    empName,
    empname,
    others,
    vechileno,
    vehicleNo,
    start_km,
    startKm,
    bunk,
    Svechilekm,
    startVehicleKm,
    Evechilekm,
    endVehicleKm,
    in_location,
    inLocation,
    in_latitude,
    inLatitude,
    in_longtiude,
    inLongtiude,
    docdate,
    docDate,
    group,
    to_onduty,
    toOnduty,
  } = body;

  const data = {
    hod: hod ?? null,
    hr: hr ?? null,
    empName: empName ?? empname ?? null,
    others: others ?? null,
    vehicleNo: vehicleNo ?? vechileno ?? null,
    startKm: startKm ?? (start_km != null ? String(start_km) : null),
    bunk: bunk ?? null,
    startVehicleKm: startVehicleKm ?? (Svechilekm != null ? String(Svechilekm) : null),
    endVehicleKm: endVehicleKm ?? (Evechilekm != null ? String(Evechilekm) : null),
    inLocation: inLocation ?? in_location ?? null,
    inLatitude: inLatitude ?? (in_latitude != null ? String(in_latitude) : null),
    inLongtiude: inLongtiude ?? (in_longtiude != null ? String(in_longtiude) : null),
    docDate: docDate ? new Date(docDate) : (docdate ? new Date(docdate) : new Date()),
    group: group ?? 'onduty',
    toOnduty: toOnduty === true || toOnduty === 'true' || to_onduty === true || to_onduty === 'true',
    photo: photoname ? String(photoname).trim() : null,
    inTime: in_time ?? null,
    ...(userId != null ? { userId: String(userId) } : {}),
    ...(category != null && !isNaN(Number(category)) ? { category: Number(category) } : {}),
  };

  return data;
}

async function reserveDocid(COMPCODE, idcard) {
  const next = await getNextAtomicSequence(COMPCODE);
  const tempDocid = `TEMP-${uuidv4()}`;

  const tempRow = await prisma_Connector.onduty.create({
    data: {
      docId: tempDocid,
      idCard: idcard,
      compCode: COMPCODE,
      inOut: '',
      create: 0,
    },
  });

  const finalRow = await prisma_Connector.onduty.update({
    where: { id: tempRow.id },
    data: { docId: next.docId },
  });

  return finalRow;
}

export async function stTrack(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase();
  const Idcard = String(req?.headers?.idcard);
  const doctrack = req?.body?.docid;

  try {
    let finalDocid = doctrack;

    if (finalDocid) {
      const existing = await prisma_Connector.onduty.findUnique({
        where: { docId: finalDocid },
      });
      if (!existing || existing.idCard !== Idcard) {
        finalDocid = null;
      }
    }

    if (!finalDocid) {
      const reserved = await reserveDocid(COMPCODE, Idcard);
      finalDocid = reserved.docId;
    }

    const result = await prisma_Connector.trackers.upsert({
      where: { userId: Idcard },
      create: { userId: Idcard, isLive: true, compCode: COMPCODE, docId: finalDocid },
      update: { isLive: true, compCode: COMPCODE, docId: finalDocid },
    });

    return res.json({ status: 1, data: result });
  } catch (err) {
    logServiceError('OnDutyService:stTrack', err, req);
    console.error('stTrack error:', err);
    return res.json({ status: 0, message: 'Tracking startup failed' });
  }
}

export async function requestOnduty(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase();
  const photoPath = req?.file?.path;
  const photoname = req?.file?.filename;

  const cleanupFile = () => {
    if (photoPath && fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
  };

  let connection = null;
  let prismaRecord = null;
  let isNewPrismaRow = false;

  try {
    const { category, create, docid, docCount, Isgo_onduty } = req.body;

    // 1. Validate
    if (!category || !create) {
      cleanupFile();
      return res.status(400).json({ status: 0, message: 'Category and create fields are required.' });
    }

    const approvalType = String(req.body.approval || 'HOD').toUpperCase();
    const hodVal = req.body.hod && String(req.body.hod).trim() !== '' && req.body.hod !== 'null' && req.body.hod !== '0' ? String(req.body.hod).trim() : null;
    const hrVal = req.body.hr && String(req.body.hr).trim() !== '' && req.body.hr !== 'null' && req.body.hr !== '0' ? String(req.body.hr).trim() : null;

    if (approvalType === 'BOTH') {
      if (!hodVal && !hrVal) {
        cleanupFile();
        return res.status(400).json({ status: 0, message: "Neither HOD nor HR is assigned to your profile in User Control. Dual approval requires both HOD and HR." });
      }
      if (!hodVal) {
        cleanupFile();
        return res.status(400).json({ status: 0, message: "Reporting HOD is not assigned to your profile in User Control. Dual approval requires an HOD." });
      }
      if (!hrVal) {
        cleanupFile();
        return res.status(400).json({ status: 0, message: "Reporting HR is not assigned to your profile in User Control. Dual approval requires an HR." });
      }
    } else if (approvalType === 'HR') {
      if (!hrVal && !hodVal) {
        cleanupFile();
        return res.status(400).json({ status: 0, message: "Reporting HR is not assigned to your profile. Please contact your administrator to assign an HR in User Control before submitting." });
      }
    } else {
      if (!hodVal) {
        cleanupFile();
        return res.status(400).json({ status: 0, message: "Reporting HOD is not assigned to your profile. Please contact your administrator to assign an HOD in User Control before submitting." });
      }
    }

    // 2. Block duplicate active session
    if (!Isgo_onduty) {
      const activeSession = await prisma_Connector.onduty.findFirst({
        where: {
          compCode: COMPCODE,
          idCard: req.headers.idcard,
          inOut: 'IN',
          approvalStatus: { in: ['pending', 'approved'] },
        },
      });
      if (activeSession) {
        cleanupFile();
        return res.status(400).json({
          status: 0,
          message: 'You already have an active on-duty session. Please close it first.',
        });
      }
    }

    const in_time = formatDateToOracle(new Date()).split(' ')[1];

    // Auto-fetch backend location
    let numInLat = Number(req.body.in_latitude);
    let numInLon = Number(req.body.in_longtiude);
    let hasValidInCoords = Boolean(numInLat && numInLon && !(numInLat === 0 && numInLon === 0));

    // Fallback: check recent tracked location in prisma.location if frontend didn't supply valid coordinates
    if (!hasValidInCoords) {
      try {
        const lastTrack = await prisma_Connector.location.findFirst({
          where: { userId: String(req.headers.idcard || req.body.idcard), compCode: COMPCODE },
          orderBy: { id: 'desc' },
        });
        if (lastTrack && lastTrack.latitude && lastTrack.longitude && Number(lastTrack.latitude) !== 0) {
          req.body.in_latitude = String(lastTrack.latitude);
          req.body.in_longtiude = String(lastTrack.longitude);
          numInLat = Number(lastTrack.latitude);
          numInLon = Number(lastTrack.longitude);
          hasValidInCoords = true;
          if (lastTrack.address) {
            req.body.in_location = lastTrack.address;
          }
        }
      } catch (trackErr) {
        logServiceError('OnDutyService:requestOnduty', trackErr, req);
        console.warn('[requestOnduty] Fallback tracking lookup error:', trackErr);
      }
    }

    if (hasValidInCoords) {
      if (!req.body.in_location || req.body.in_location.includes('Unknown') || req.body.in_location === 'Location unavailable' || req.body.in_location === 'Location retrieved on submission' || req.body.in_location === 'GPS coordinates ready') {
        const addr = await getAddressFromCoords(req.body.in_latitude, req.body.in_longtiude);
        if (addr) req.body.in_location = addr;
      }
    } else {
      req.body.in_latitude = null;
      req.body.in_longtiude = null;
    }

    if (!req.body.in_location || req.body.in_location.includes('Unknown') || req.body.in_location === 'Location retrieved on submission' || req.body.in_location === 'GPS coordinates ready' || req.body.in_location === 'Location unavailable') {
      req.body.in_location = hasValidInCoords ? `Near ${numInLat.toFixed(4)}, ${numInLon.toFixed(4)}` : 'Location unavailable';
    }

    const prismaData = buildPrismaData(req.body, photoname, in_time);

    // Defensive FK check: verify userId exists in MySQL User table to prevent P2003
    if (prismaData.userId) {
      const userExists = await prisma_Connector.user.findFirst({
        where: { idCard: String(prismaData.userId) },
        select: { idCard: true },
      });
      if (!userExists) {
        console.warn(`[requestOnduty] Warning: userId '${prismaData.userId}' not found in MySQL User table. Setting to null for MySQL record.`);
        delete prismaData.userId;
      }
    }

    // Defensive FK check: verify category exists in OndutyMaster table to prevent P2003
    if (prismaData.category) {
      const categoryExists = await prisma_Connector.ondutyMaster.findUnique({
        where: { id: prismaData.category },
        select: { id: true },
      });
      if (!categoryExists) {
        console.warn(`[requestOnduty] Warning: category '${prismaData.category}' not found in ondutyMaster table. Setting to null for MySQL record.`);
        delete prismaData.category;
      }
    }

    // 3. Resolve or create Prisma row
    if (docid) {
      const existing = await prisma_Connector.onduty.findUnique({ where: { docId: docid } });
      const ownedByUser =
        existing &&
        (existing.idCard === req.headers.idcard || existing.idCard === req.body.idcard);

      if (ownedByUser) {
        prismaRecord = await prisma_Connector.onduty.update({
          where: { docId: existing.docId },
          data: { ...prismaData, inOut: 'IN', updatedAt: new Date() },
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
        data: {
          ...prismaData,
          inOut: 'IN',
          compCode: COMPCODE,
          idCard: req.headers.idcard,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // 4. Oracle INSERT
    connection = await getConnection(res);
    if (!connection) {
      cleanupFile();
      return;
    }

    const oracleData = {
      ID: generateUniqueId_Number(),
      DOCID: prismaRecord.docId,
      IDCARD: prismaRecord.idCard,
      EMPNAME: prismaRecord.empName,
      HOD: prismaRecord.hod,
      HR: prismaRecord.hr,
      APPROVALSTATUS: String(prismaRecord.approvalStatus ?? 'pending'),
      USERID: req.body.userId ?? null,
      OTHERS: prismaRecord.others,
      GROUP_TYPE: prismaRecord.group ?? 'onduty',
      INOUT: prismaRecord.inOut,
      PHOTO: prismaRecord.photo,
      COMPCODE: String(prismaRecord.compCode),
      IN_LOCATION: prismaRecord.inLocation,
      IN_TIME: in_time,
      IN_LATITUDE: prismaRecord.inLatitude,
      IN_LONGTIUDE: prismaRecord.inLongtiude,
      VECHILENO: prismaRecord.vehicleNo,
      BUNK: prismaRecord.bunk,
      START_KM: prismaRecord.startKm,
      SVECHILEKM: prismaRecord.startVehicleKm,
      CATEGORY: Number(category) ?? 1,
      CREATE_FLAG: Number(create) ?? 0,
      TO_ONDUTY: prismaRecord.toOnduty ? 1 : 0,
      UPDATEDAT: formatDateToOracle(prismaRecord.updatedAt),
      CREATEDAT: formatDateToOracle(prismaRecord.createdAt),
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
      where: { docId: prismaRecord.docId },
      data: { create: 1 },
    });

    await prisma_Connector.trackers.upsert({
      where: { userId: prismaRecord.idCard },
      create: { userId: prismaRecord.idCard, isLive: true, compCode: COMPCODE, empName: prismaRecord.empName },
      update: { userId: prismaRecord.idCard, isLive: true, compCode: COMPCODE, empName: prismaRecord.empName },
    });

    return res.status(201).json({
      status: 1,
      message: 'Onduty request created successfully',
      data: mapOnduty(prismaRecord),
    });

  } catch (err) {
    logServiceError('OnDutyService:requestOnduty', err, req);
    console.error('requestOnduty error:', err);

    try { await connection?.rollback(); } catch (_) { }

    if (isNewPrismaRow && prismaRecord?.id) {
      try {
        await prisma_Connector.onduty.delete({ where: { id: prismaRecord.id } });
        console.log(`Rolled back Prisma row id=${prismaRecord.id} docid=${prismaRecord.docId}`);
      } catch (rbErr) {
        logServiceError('OnDutyService:requestOnduty', rbErr, req);
        console.error('Prisma rollback failed:', rbErr);
      }
    }

    cleanupFile();

    if (err.code === 'P2002') {
      return res.status(409).json({ status: 0, message: 'Duplicate entry detected' });
    }
    if (err.code === 'P2003') {
      const field = String(err.meta?.field_name || '');
      let message = 'Unable to complete request because a related record was not found.';
      if (field.includes('userId')) {
        message = 'User profile not found. Please log out, sign in again, or contact your administrator.';
      } else if (field.includes('category')) {
        message = 'Selected on-duty category is invalid. Please select a valid category and try again.';
      } else {
        message = `Unable to process request due to an invalid reference (${field || 'record'}).`;
      }
      return res.status(400).json({
        status: 0,
        message,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }

    if (err.errorNum) {
      return res.status(500).json({ status: 0, message: `Oracle error: ${err.message}`, oraError: err.errorNum });
    }

    return res.status(500).json({
      status: 0,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });

  } finally {
    try { await connection?.close(); } catch (_) { }
  }
}

export async function addOnduty_master(req, res) {
  const data = req?.body?.data || {};
  const COMPCODE = String(req?.headers?.compcode).toUpperCase();
  try {
    const result = await prisma_Connector.ondutyMaster.create({ data: { ...data, compCode: COMPCODE } });
    if (result?.id) {
      return res.json({ status: 1, data: mapOndutyMaster(result) });
    } else {
      return res.json({ status: 0, data: null });
    }
  } catch (err) {
    logServiceError('OnDutyService:addOnduty_master', err, req);
    console.log(err);
    return res.json({ status: 0, message: err?.message || 'Failed to add onduty master', data: null });
  }
}



export async function send_location(req, res) {
  console.log(req?.body);

  const data = req?.body
  const COMPCODE = String(req?.headers?.compcode).toUpperCase()
  try {
    const result = await prisma_Connector.location.create({ data: { ...data, compCode: COMPCODE } })
    // var auvit_data={PERMISSIONID:String(result?.permissionId),THRS:result?.thrs,APPROVALSTATUS:String(result?.approvalStatus),DOCID:String(result?.docid),REASON:result?.reason,TTIME:result?.tTime,FTIME:result?.fTime,COMPCODE:String(result?.compCode),CREATED_BY:String(result?.createdBy),CREATED_ON:formatDateToOracle(result?.createdOn),MODIFIED_BY:result?.createdBy,MODIFIED_ON:formatDateToOracle(result?.modifiedOn),IDCARD:Number(result?.userId),DOCDATE:result?.docDate,IS_CANCELLED:'false'}
    if (result?.id) {
      return res.json({ status: 1, data: result })
    } else {
      return res.json({ status: 0, data: {} })
    }

  } catch (err) {
    logServiceError('OnDutyService:send_location', err, req);
    console.log(err);

  }


}






async function getLocationAccess(req) {
  const COMPCODE = String(req?.headers?.compcode || '').trim().toUpperCase();
  const requesterId = String(req?.headers?.idcard || '').trim();

  if (!COMPCODE || !requesterId) {
    return { error: 'Company and employee identity are required.', statusCode: 400 };
  }

  const requester = await prisma_Connector.user.findFirst({
    where: {
      idCard: requesterId,
      active: true,
    },
    select: {
      idCard: true,
      level: true,
      isAdmin: true,
      isAllParty: true,
      companies: { select: { companyCode: true } },
    },
  });

  if (!requester) {
    return { error: 'You are not authorized for this company.', statusCode: 403 };
  }

  const isCompanyAdmin = requester.isAdmin ||
    requester.isAllParty ||
    requester.level === 'admin' ||
    requester.level === 'top';

  const hasCompanyAccess = isCompanyAdmin ||
    !requester.companies?.length ||
    requester.companies.some(
      c => String(c.companyCode || '').trim().toUpperCase() === COMPCODE
    );

  if (!hasCompanyAccess) {
    return { error: 'You are not authorized for this company.', statusCode: 403 };
  }

  const users = await prisma_Connector.user.findMany({
    where: {
      active: true,
      ...(isCompanyAdmin
        ? {}
        : { OR: [{ idCard: requesterId }, { hod: requesterId }, { hr: requesterId }] }),
    },
    select: { idCard: true, userName: true },
  });

  const allowedUsers = users.some(user => user.idCard === requesterId)
    ? users
    : [{ idCard: requesterId, userName: null }, ...users];

  return {
    COMPCODE,
    requesterId,
    allowedUsers,
    allowedUserIds: allowedUsers.map(user => user.idCard).filter(Boolean),
  };
}

async function getPermittedTrackingUsers(access) {
  const trackers = await prisma_Connector.trackers.findMany({
    where: {
      compCode: access.COMPCODE,
      userId: { in: access.allowedUserIds },
    },
  });
  const trackersByUser = new Map(trackers.map(tracker => [tracker.userId, tracker]));

  return access.allowedUsers.map(user => {
    const tracker = trackersByUser.get(user.idCard);
    return {
      ...(tracker || {}),
      userId: user.idCard,
      UserId: user.idCard,
      idCard: user.idCard,
      empName: tracker?.empName || user.userName || user.idCard,
      empname: tracker?.empName || user.userName || user.idCard,
      isLive: Boolean(tracker?.isLive),
      docid: tracker?.isLive ? tracker.docid : null,
    };
  });
}

export async function get_tracking_users(req, res) {
  try {
    const access = await getLocationAccess(req);
    if (access.error) {
      return res.status(access.statusCode).json({ status: 0, message: access.error });
    }

    return res.json({ status: 1, data: await getPermittedTrackingUsers(access) });
  } catch (error) {
    logServiceError('OnDutyService:get_tracking_users', error, req);
    console.error('get_tracking_users error:', error);
    return res.status(500).json({ status: 0, message: 'Unable to load permitted employees.' });
  }
}

export async function get_live_user(req, res) {
  try {
    const access = await getLocationAccess(req);
    if (access.error) {
      return res.status(access.statusCode).json({ status: 0, message: access.error });
    }

    const users = await getPermittedTrackingUsers(access);
    return res.json({ status: 1, data: users.filter(user => user.isLive) });
  } catch (error) {
    logServiceError('OnDutyService:get_live_user', error, req);
    console.error('get_live_user error:', error);
    return res.status(500).json({ status: 0, message: 'Unable to load active trackers.' });
  }
}

export async function get_live_location(req, res) {
  try {
    const access = await getLocationAccess(req);
    if (access.error) {
      return res.status(access.statusCode).json({ status: 0, message: access.error });
    }

    const userId = String(req?.query?.userId || access.requesterId).trim();
    if (!access.allowedUserIds.includes(userId)) {
      return res.status(403).json({ status: 0, message: 'You cannot view this employee location.' });
    }

    const tracker = await prisma_Connector.trackers.findFirst({
      where: { compCode: access.COMPCODE, userId: userId, isLive: true },
    });
    if (!tracker) return res.json([]);

    const latestLocation = await prisma_Connector.location.findFirst({
      where: { compCode: access.COMPCODE, userId: userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestLocation) return res.json([]);
    return res.json([{
      ...latestLocation,
      timestamp: Number(latestLocation.timestamp),
    }]);
  } catch (error) {
    logServiceError('OnDutyService:get_live_location', error, req);
    console.error('get_live_location error:', error);
    return res.status(500).json({ status: 0, message: 'Unable to load live location.' });
  }
}

export async function requestReachedOut(req, res) {
  const { docid, VEHICLENO, ...reset } = req?.body;
  const COMPCODE = String(req.headers?.compcode).toUpperCase();
  const Idcard = String(req?.headers?.idcard);

  try {
    const currentOnduty = await prisma_Connector.onduty.findFirst({
      where: { docId: docid, idCard: Idcard, compCode: COMPCODE }
    });

    if (!currentOnduty) {
      return res.json({ status: 0, message: "Onduty record not found" });
    }

    const endKmVal = reset?.Evechilekm ?? reset?.endVehicleKm ?? reset?.end_km ?? reset?.endKm;

    let rOutLat = reset.out_latitude != null ? String(reset.out_latitude) : (reset.outLatitude != null ? String(reset.outLatitude) : null);
    let rOutLon = reset.out_longtiude != null ? String(reset.out_longtiude) : (reset.outLongtiude != null ? String(reset.outLongtiude) : null);
    let rOutLocation = reset.out_location ?? reset.outLocation ?? null;

    const numRLat = Number(rOutLat);
    const numRLon = Number(rOutLon);
    const hasValidRCoords = Boolean(numRLat && numRLon && !(numRLat === 0 && numRLon === 0));

    if (!hasValidRCoords) {
      rOutLat = null;
      rOutLon = null;
    }

    if (rOutLocation && (rOutLocation.includes('Unknown') || rOutLocation === 'Location retrieved on submission' || rOutLocation === 'GPS coordinates ready')) {
      rOutLocation = hasValidRCoords ? `Near ${numRLat.toFixed(4)}, ${numRLon.toFixed(4)}` : null;
    }

    if (!rOutLat && !currentOnduty.outLatitude && currentOnduty.inLatitude && currentOnduty.inLongtiude) {
      rOutLat = String(currentOnduty.inLatitude);
      rOutLon = String(currentOnduty.inLongtiude);
      rOutLocation = rOutLocation || currentOnduty.inLocation || `Near ${Number(rOutLat).toFixed(4)}, ${Number(rOutLon).toFixed(4)}`;
    }

    if (!rOutLocation || rOutLocation === 'Location unavailable') {
      rOutLocation = currentOnduty.inLocation && currentOnduty.inLocation !== 'Location unavailable'
        ? currentOnduty.inLocation
        : 'Location unavailable';
    }

    const result = await prisma_Connector.onduty?.update({
      where: { docId: docid },
      data: {
        ...(reset.end_km != null || reset.endKm != null ? { endKm: String(reset.endKm ?? reset.end_km) } : {}),
        ...(reset.Evechilekm != null || reset.endVehicleKm != null ? { endVehicleKm: String(reset.endVehicleKm ?? reset.Evechilekm) } : {}),
        ...(rOutLocation != null ? { outLocation: rOutLocation } : {}),
        ...(rOutLat != null ? { outLatitude: rOutLat } : {}),
        ...(rOutLon != null ? { outLongtiude: rOutLon } : {}),
        inOut: "OUT",
        updatedAt: new Date()
      }
    });

    if (result?.id) {
      const vNo = VEHICLENO || result.vehicleNo || "" + Idcard;
      if (endKmVal) {
        await prisma_Connector?.vechilekm?.upsert({
          where: { vehicleNo: vNo },
          create: { km: String(endKmVal), vehicleNo: vNo, compCode: COMPCODE },
          update: { km: String(endKmVal), compCode: COMPCODE }
        });
      }
      await prisma_Connector?.trackers?.updateMany({ where: { userId: Idcard }, data: { endDocId: "" } });
      res.json({ status: 1, data: mapOnduty(result) });
    } else {
      res.json({ status: 0, data: {} });
    }
  } catch (err) {
    logServiceError('OnDutyService:requestReachedOut', err, req);
    res.json({ status: 0, data: {} });
    console.error("requestReachedOut error:", err);
  }
}

export async function get_reached(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase();
  const Idcard = String(req?.headers?.idcard);
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  try {
    const data = await prisma_Connector?.trackers?.findUnique({ where: { userId: Idcard } });
    const targetDocId = data?.endDocId || data?.endDocid;
    if (!targetDocId) {
      return res.json({ status: 0, data: {} });
    }
    const result = await prisma_Connector.onduty.findFirst({
      where: {
        compCode: COMPCODE,
        docId: targetDocId,
        inOut: "OUT",
        endVehicleKm: null,
        create: 1,
        createdAt: { gte: startOfDay, lte: endOfDay }
      }
    });
    if (result?.endVehicleKm) {
      res.json({ status: 0, data: {} });
    } else if (result) {
      // Heal inLocation/inLatitude if missing or 'Location unavailable'
      if (!result.inLocation || result.inLocation === 'Location unavailable' || !result.inLatitude || Number(result.inLatitude) === 0) {
        try {
          const firstTrack = await prisma_Connector.location.findFirst({
            where: { docId: targetDocId },
            orderBy: { id: 'asc' },
          });
          const bestTrack = firstTrack || await prisma_Connector.location.findFirst({
            where: { userId: Idcard, compCode: COMPCODE },
            orderBy: { id: 'desc' },
          });
          if (bestTrack && bestTrack.latitude && bestTrack.longitude && Number(bestTrack.latitude) !== 0) {
            result.inLatitude = String(bestTrack.latitude);
            result.inLongtiude = String(bestTrack.longitude);
            result.inLocation = bestTrack.address || `Near ${Number(bestTrack.latitude).toFixed(4)}, ${Number(bestTrack.longitude).toFixed(4)}`;

            await prisma_Connector.onduty.update({
              where: { id: result.id },
              data: {
                inLocation: result.inLocation,
                inLatitude: result.inLatitude,
                inLongtiude: result.inLongtiude,
              }
            });
          } else if (!result.inLocation || result.inLocation === 'Location unavailable') {
            result.inLocation = 'Location unavailable';
          }
        } catch (healErr) {
          logServiceError('OnDutyService:get_reached', healErr, req);
          console.warn('[get_reached] Failed to heal departure location:', healErr);
          if (!result.inLocation || result.inLocation === 'Location unavailable') {
            result.inLocation = 'Location unavailable';
          }
        }
      }
      res.json({ status: 1, data: mapOnduty(result) });
    } else {
      res.json({ status: 0, data: {} });
    }
  } catch (err) {
    logServiceError('OnDutyService:get_reached', err, req);
    console.error('get_reached error:', err);
    res.json({ status: 0, data: {} });
  }
}

export async function get_history_location(req, res) {
  try {
    const access = await getLocationAccess(req);
    if (access.error) {
      return res.status(access.statusCode).json({ status: 0, message: access.error });
    }

    const date = String(req?.query?.date || '').trim();
    const requestedUserId = String(req?.query?.userId || '').trim();
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ status: 0, message: 'Date must use YYYY-MM-DD format.' });
    }

    const [year, month, day] = date ? date.split('-').map(Number) : [];
    const selectedDate = date ? new Date(year, month - 1, day) : new Date();
    if (
      Number.isNaN(selectedDate.getTime()) ||
      (date && (
        selectedDate.getFullYear() !== year ||
        selectedDate.getMonth() !== month - 1 ||
        selectedDate.getDate() !== day
      ))
    ) {
      return res.status(400).json({ status: 0, message: 'The requested date is invalid.' });
    }
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    if (requestedUserId && !access.allowedUserIds.includes(requestedUserId)) {
      return res.status(403).json({ status: 0, message: 'You cannot view this employee history.' });
    }

    const allowedIds = requestedUserId ? [requestedUserId] : access.allowedUserIds;
    const groupByDocId = dataArray => dataArray.reduce(
      (acc, item) => {
        if (!item.docId) return acc;
        const docId = String(item.docId);
        if (!acc.docIds.includes(docId)) acc.docIds.push(docId);
        acc.groupedData[docId] = acc.groupedData[docId] || [];
        acc.groupedData[docId].push({
          ...item,
          timestamp: item.timestamp == null ? null : Number(item.timestamp),
        });
        return acc;
      },
      { groupedData: {}, docIds: [] },
    );

    const dbResults = await prisma_Connector.location.findMany({
      where: {
        compCode: access.COMPCODE,
        userId: { in: allowedIds },
        docId: { not: null },
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (dbResults.length > 0) {
      const { groupedData, docIds } = groupByDocId(dbResults);
      return res.json({
        status: 1,
        data: [groupedData],
        meta: docIds,
        source: 'db',
      });
    }

    const archiveDate = date || selectedDate.toISOString().slice(0, 10);
    const jsonpath = jsonFilePaths(archiveDate);
    const compressdata = compressedFilePaths(archiveDate);
    let fileContent = null;
    try {
      if (fs.existsSync(jsonpath)) {
        fileContent = await fsp.readFile(jsonpath, 'utf8');
      } else if (fs.existsSync(compressdata)) {
        fileContent = Buffer.from(gunzipSync(await fsp.readFile(compressdata))).toString('utf8');
      }
    } catch (readErr) {
      logServiceError('OnDutyService:get_history_location', readErr, req);
      console.error('Location archive read error:', readErr);
      return res.status(500).json({
        status: 0,
        data: [],
        meta: [],
        message: 'Failed to read location history.',
      });
    }

    if (!fileContent?.trim()) {
      return res.json({ status: 0, data: [], meta: [], message: 'No data found for this date.' });
    }

    let jsonData;
    try {
      const trimmed = fileContent.trim();
      jsonData = trimmed.startsWith('{')
        ? JSON.parse(`[${trimmed.replace(/}\s*{/g, '},{')}]`)
        : JSON.parse(trimmed);
    } catch (parseErr) {
      logServiceError('OnDutyService:get_history_location', parseErr, req);
      console.error('Location archive JSON parse error:', parseErr);
      return res.status(500).json({
        status: 0,
        data: [],
        meta: [],
        message: 'Failed to parse location history.',
      });
    }

    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    const filtered = dataArray.filter(item => allowedIds.includes(String(item?.userId || '')));
    if (!filtered.length) {
      return res.json({
        status: 0,
        data: [],
        meta: [],
        message: 'No location data found for this date.',
      });
    }

    const { groupedData, docIds } = groupByDocId(filtered);
    return res.json({
      status: 1,
      data: [groupedData],
      meta: docIds.filter(Boolean),
      source: 'file',
    });
  } catch (err) {
    logServiceError('OnDutyService:get_history_location', err, req);
    console.error('get_history_location error:', err);
    return res.status(500).json({
      status: 0,
      data: [],
      meta: [],
      message: 'Internal server error',
    });
  }
}






export async function requestOndutyOut(req, res) {
  const { docid, ...reset } = req?.body;
  const COMPCODE = String(req.headers?.compcode).toUpperCase();
  const Idcard = String(req?.headers?.idcard);
  const out_time = formatDateToOracle(new Date()).split(' ')[1];

  let outLat = reset.out_latitude != null ? String(reset.out_latitude) : (reset.outLatitude != null ? String(reset.outLatitude) : null);
  let outLon = reset.out_longtiude != null ? String(reset.out_longtiude) : (reset.outLongtiude != null ? String(reset.outLongtiude) : null);
  let outLocation = reset.out_location ?? reset.outLocation ?? null;

  const numLat = Number(outLat);
  const numLon = Number(outLon);

  // If frontend passed 0 or empty coordinates, fallback to the latest tracked location from background service
  if ((!numLat || !numLon || (numLat === 0 && numLon === 0)) && docid) {
    try {
      let lastTrack = await prisma_Connector.location.findFirst({
        where: { docId: docid },
        orderBy: { id: 'desc' },
      });
      if (!lastTrack) {
        lastTrack = await prisma_Connector.location.findFirst({
          where: { userId: Idcard, compCode: COMPCODE },
          orderBy: { id: 'desc' },
        });
      }
      if (lastTrack && lastTrack.latitude && lastTrack.longitude && Number(lastTrack.latitude) !== 0) {
        outLat = String(lastTrack.latitude);
        outLon = String(lastTrack.longitude);
      }
    } catch (e) {
      logServiceError('OnDutyService:requestOndutyOut', e, req);
      console.warn('[requestOndutyOut] Fallback location tracking lookup error:', e);
    }
  }

  // Auto-fetch backend location if non-zero coordinates exist
  const validLat = Number(outLat);
  const validLon = Number(outLon);
  const hasValidOutCoords = Boolean(validLat && validLon && !(validLat === 0 && validLon === 0));

  if (hasValidOutCoords) {
    const addr = await getAddressFromCoords(outLat, outLon);
    if (addr) {
      outLocation = addr;
    }
  } else {
    outLat = null;
    outLon = null;
  }

  // Clean up placeholders
  if (!outLocation || outLocation.includes('Unknown') || outLocation === 'Location retrieved on submission' || outLocation === 'GPS coordinates ready' || outLocation === 'Location unavailable') {
    if (hasValidOutCoords) {
      outLocation = `Near ${validLat.toFixed(4)}, ${validLon.toFixed(4)}`;
    } else {
      outLocation = 'Location unavailable';
    }
  }

  let connection = null;

  try {
    // 1. Validate
    if (!docid) {
      return res.status(400).json({ status: 0, message: 'docid is required.' });
    }

    // 2. Check record exists
    const existing = await prisma_Connector.onduty.findUnique({ where: { docId: docid } });

    if (!existing) {
      return res.status(404).json({ status: 0, message: `No onduty record found for docid: ${docid}` });
    }

    // 3. Security: ensure this user owns the record
    if (existing.idCard !== Idcard) {
      return res.status(403).json({ status: 0, message: 'Unauthorized: This OnDuty record does not belong to you.' });
    }

    // 4. Guard: prevent re-closing an already closed session
    if (existing.inOut === 'OUT') {
      return res.status(409).json({
        status: 0,
        message: 'This OnDuty session is already checked out.',
        data: { docId: existing.docId, outTime: existing.outTime },
      });
    }

    // 4b. If still no out coordinates, fallback to the trip's start location
    if (!outLat && existing.inLatitude && existing.inLongtiude && Number(existing.inLatitude) !== 0) {
      outLat = String(existing.inLatitude);
      outLon = String(existing.inLongtiude);
      if (!outLocation || outLocation === 'Location unavailable' || outLocation.includes('Unknown')) {
        outLocation = existing.inLocation || `Near ${Number(outLat).toFixed(4)}, ${Number(outLon).toFixed(4)}`;
      }
    }

    // 5. Prisma UPDATE
    const result = await prisma_Connector.onduty.update({
      where: { docId: docid },
      data: {
        outLocation: outLocation,
        outLatitude: outLat,
        outLongtiude: outLon,
        outTime: out_time,
        endKm: reset.end_km != null ? String(reset.end_km) : (reset.endKm != null ? String(reset.endKm) : null),
        endVehicleKm: reset.Evechilekm != null ? String(reset.Evechilekm) : (reset.endVehicleKm != null ? String(reset.endVehicleKm) : null),
        toOnduty: reset.to_onduty === true || reset.to_onduty === 'true' || reset.toOnduty === true,
        inOut: 'OUT',
        updatedAt: new Date(),
      },
    });

    if (!result?.id) {
      return res.status(500).json({ status: 0, message: 'Prisma update failed.' });
    }

    // 6. Oracle UPDATE
    connection = await getConnection(res);
    if (!connection) return;

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
      OUT_LOCATION: result?.outLocation ?? null,
      OUT_LATITUDE: result?.outLatitude ?? null,
      OUT_LONGTIUDE: result?.outLongtiude ?? null,
      OUT_TIME: result?.outTime ?? null,
      END_KM: result?.endKm ?? null,
      TO_ONDUTY: result?.toOnduty ? 1 : 0,
      DOCID: result?.docId,
      COMPCODE: COMPCODE,
    };

    const oracleResult = await connection.execute(sql, oracleBinds);

    if (oracleResult?.rowsAffected > 0) {

      // 7. Mark as synced
      await prisma_Connector.onduty.update({
        where: { docId: result?.docId },
        data: { update: 1 },
      });

      // 8. Trackers update
      await prisma_Connector.trackers.upsert({
        where: { userId: Idcard },
        create: {
          userId: Idcard,
          isLive: false,
          compCode: COMPCODE,
          docId: null,
          endDocId: reset?.to_onduty ? null : docid,
        },
        update: {
          isLive: false,
          compCode: COMPCODE,
          docId: null,
          endDocId: reset?.to_onduty ? '' : docid,
        },
      });

      return res.status(200).json({
        status: 1,
        data: mapOnduty(result),
        isNext: !!reset?.to_onduty,
        message: 'OnDuty OUT submitted successfully.',
      });

    } else {
      // 9. Oracle failed Ã¢â‚¬â€ revert Prisma
      await prisma_Connector.onduty.update({
        where: { docId: docid },
        data: {
          outLocation: existing.outLocation,
          outLatitude: existing.outLatitude,
          outLongtiude: existing.outLongtiude,
          outTime: existing.outTime,
          endKm: existing.endKm,
          endVehicleKm: existing.endVehicleKm,
          inOut: existing.inOut,
          toOnduty: existing.toOnduty,
          updatedAt: existing.updatedAt,
        },
      });

      return res.status(500).json({ status: 0, message: 'Oracle update failed. Prisma reverted.' });
    }

  } catch (err) {
    logServiceError('OnDutyService:requestOndutyOut', err, req);
    console.error('requestOndutyOut error:', err);

    if (err.code === 'P2002') {
      return res.status(409).json({ status: 0, message: 'Duplicate entry detected in trackers. Please try again.' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ status: 0, message: 'Onduty record not found.' });
    }
    if (err.code === 'P2003') {
      const field = String(err.meta?.field_name || '');
      let message = 'Unable to complete request because a related record was not found.';
      if (field.includes('userId')) {
        message = 'User profile not found. Please log out, sign in again, or contact your administrator.';
      } else if (field.includes('category')) {
        message = 'Selected on-duty category is invalid. Please select a valid category and try again.';
      } else {
        message = `Unable to process request due to an invalid reference (${field || 'record'}).`;
      }
      return res.status(400).json({
        status: 0,
        message,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }

    if (err.errorNum) {
      return res.status(500).json({ status: 0, message: `Oracle error: ${err.message}`, oraError: err.errorNum });
    }

    return res.status(500).json({
      status: 0,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });

  } finally {
    try {
      await connection?.commit();
      await connection?.close();
    } catch (_) { }
  }
}

export async function requestonduty_Approval(req, res) {
  const COMPCODE = String(req.headers?.compcode).toUpperCase();
  const docid = req?.body?.docid;
  const p_app = req?.body?.approval;
  const approvedBy = req?.body?.approvedBy;
  const rejectBy = req?.body?.rejectBy;
  const reject_reason = req?.body?.reject_reason || req?.body?.rejectRemark || req?.body?.rejectReason || req?.body?.reason || '';

  let connection = null;

  try {
    // 1. Validate
    if (!docid || !p_app) {
      return res.status(400).json({
        status: 0,
        message: "docid and approval status are required.",
      });
    }

    if (!["approved", "rejected", "pending"].includes(p_app)) {
      return res.status(400).json({
        status: 0,
        message: `Invalid approval status: ${p_app}`,
      });
    }

    if (p_app === "rejected" && !reject_reason) {
      return res.status(400).json({
        status: 0,
        message: "reject_reason is required when rejecting.",
      });
    }

    // 2. Check record exists
    const existing = await prisma_Connector.onduty.findUnique({
      where: { docId: docid },
    });

    if (!existing) {
      return res.status(404).json({
        status: 0,
        message: `No onduty record found for docid: ${docid}`,
      });
    }

    // 3. Prisma UPDATE
    const result = await prisma_Connector.onduty.update({
      where: { docId: docid },
      data: {
        approvalStatus: p_app,
        approvedBy: approvedBy ?? null,
        rejectBy: rejectBy ?? null,
        rejectReason: reject_reason ?? null,
        updatedAt: new Date(),
      },
    });

    if (!result?.id) {
      return res.status(500).json({
        status: 0,
        message: "Prisma update failed.",
      });
    }

    // 4. Oracle UPDATE
    connection = await getConnection(res);
    if (!connection) return;

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
      APPROVEDBY: approvedBy ?? null,
      REJECTBY: rejectBy ?? null,
      REJECT_REASON: reject_reason ?? null,
      DOCID: docid,
      COMPCODE: COMPCODE,
    };

    const oracleResult = await connection.execute(sql, oracleBinds);

    if (oracleResult?.rowsAffected > 0) {

      // 5. Mark as synced
      await prisma_Connector.onduty.update({
        where: { docId: result?.docId },
        data: { update: 1 },
      });

      return res.status(200).json({
        status: 1,
        data: mapOnduty(result),
        message: `OnDuty ${p_app} successfully.`,
      });

    } else {
      // 6. Oracle failed Ã¢â‚¬â€ revert Prisma
      await prisma_Connector.onduty.update({
        where: { docId: docid },
        data: {
          approvalStatus: existing.approvalStatus,
          approvedBy: existing.approvedBy,
          rejectBy: existing.rejectBy,
          rejectReason: existing.rejectReason,
          updatedAt: existing.updatedAt,
        },
      });

      return res.status(500).json({
        status: 0,
        message: "Oracle update failed. Prisma reverted.",
      });
    }

  } catch (err) {
    logServiceError('OnDutyService:requestonduty_Approval', err, req);
    console.error("requestonduty_Approval error:", err);

    if (err.code === "P2025") {
      return res.status(404).json({
        status: 0,
        message: "Onduty record not found in Prisma.",
      });
    }

    return res.status(500).json({
      status: 0,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });

  } finally {
    try {
      await connection?.commit();
      await connection?.close();
    } catch (_) { }
  }
}

export async function get_all_Onduty_reason(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase();

  try {
    const result = await prisma_Connector.ondutyMaster.findMany({ where: { compCode: COMPCODE } });
    res.json({ status: 1, data: mapOndutyMasterList(result) });
  }
  catch (err) {
    logServiceError('OnDutyService:get_all_Onduty_reason', err, req);
    console.log(err);
    res.json({ status: 0, data: [] });
  }
}

export async function get_Uploaded_IMAG(req, res) {
  try {
    const filename = req?.query?.image
    if (filename) {
      const ImagePath = path.join(process.cwd(), ".", "uploads")
      res.setHeader('Content-Type', 'image/png');
      if (fs.existsSync(ImagePath + "/" + filename)) {

        const ImageStream = fs?.createReadStream(ImagePath + "/" + filename)
        ImageStream.pipe(res)
      } else {
        res?.json({ error: "No Image Founded" })
      }
    }

  } catch (error) {
    logServiceError('OnDutyService:get_Uploaded_IMAG', error, req);
    res?.json({ error: "No Image Founded" })
  }
}

// â”€â”€ Standard Function Aliases â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getOndutyEntries = get__Onduty;
export const getOndutyEdit = get__Onduty_edit;
export const getOndutyDocId = getDocId;
export const getVehicles = get__Vechile;
export const getVehicleKm = get__vechilekm;
export const addVehicleKm = Add__vechilekm;
export const getAllOndutyReasons = get_all_Onduty_reason;
export const getHistoryLocation = get_history_location;
export const getLiveLocation = get_live_location;
export const getLiveUser = get_live_user;
export const getTrackingUsers = get_tracking_users;
export const getReachedTrips = get_reached;
export const getUploadedImage = get_Uploaded_IMAG;
export const approveOndutyRequest = requestonduty_Approval;
export const saveLocationTracking = send_location;
export const startLocationTracking = stTrack;







