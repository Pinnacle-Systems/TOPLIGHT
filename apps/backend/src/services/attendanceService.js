import { getConnection } from "../constants/dbConnection.js";
import formatDateToOracle from "../utils/oracleDateFormat.js";
import { generateUniqueId_Number } from "../utils/idGenerator.js";
import { prisma_Connector } from "../../index.js";
import { logServiceError } from "../utils/logger.js";

async function resolvePunchTarget(req, res) {
  const requesterIdcard = String(req?.headers?.idcard || "").trim();
  const bodyIdcard = String(req?.body?.idcard || req?.body?.idCard || "").trim();
  const targetIdcard = bodyIdcard || requesterIdcard;
  const bodyCompCode = req?.body?.compcode || req?.body?.compCode;
  const isDelegatedPunch =
    targetIdcard.toUpperCase() !== requesterIdcard.toUpperCase();
  const targetCompCode = String(
    isDelegatedPunch
      ? bodyCompCode || ""
      : req?.headers?.compcode || bodyCompCode || ""
  ).trim().toUpperCase();

  if (!targetIdcard || !targetCompCode) {
    res.status(400).json({
      status: 0,
      message: "Employee ID and company code are required.",
    });
    return null;
  }

  if (isDelegatedPunch) {
    if (!requesterIdcard) {
      res.status(401).json({ status: 0, message: "Requester identity is required." });
      return null;
    }

    const requester = await prisma_Connector.user.findUnique({
      where: { idCard: requesterIdcard },
      select: {
        idCard: true,
        isAdmin: true,
        companies: { select: { companyCode: true } },
      },
    });

    if (!requester) {
      res.status(403).json({ status: 0, message: "Requester is not authorized to punch for employees." });
      return null;
    }

    if (!requester.isAdmin) {
      const hasCompanyAccess = requester.companies.some(
        company => String(company.companyCode || "").trim().toUpperCase() === targetCompCode
      );
      if (!hasCompanyAccess) {
        res.status(403).json({ status: 0, message: "You are not authorized to punch for this company." });
        return null;
      }

      const assignedEmployee = await prisma_Connector.user.findFirst({
        where: { idCard: targetIdcard, hod: requester.idCard },
        select: { idCard: true },
      });

      if (!assignedEmployee) {
        res.status(403).json({ status: 0, message: "You are not authorized to punch for this employee." });
        return null;
      }
    }
  }

  return { COMPCODE: targetCompCode, Idcard: targetIdcard };
}

// ---------------------------------------------------------------------------
// SHARED HELPER â€” get last punch row for today
// Returns: { inout: 0|1, atttime, unqid } or null
// ---------------------------------------------------------------------------
async function getLastPunchToday(connection, COMPCODE, Idcard) {
  const result = await connection.execute(
    `SELECT INOUT, ATTTIME, UNQID
     FROM (
       SELECT INOUT, ATTTIME, UNQID
       FROM PSSATT
       WHERE COMPCODE = :COMPCODE
         AND IDCARD   = :IDCARD
         AND TRUNC(ATTDATE) = TRUNC(SYSDATE)
       ORDER BY ATTDATE DESC
     )
     WHERE ROWNUM = 1`,
    { COMPCODE, IDCARD: Idcard }
  );

  if (!result.rows?.length) return null;

  const [inout, atttime, unqid] = result.rows[0];
  return { inout, atttime, unqid };
}

// ---------------------------------------------------------------------------
// SHARED HELPER â€” INSERT a new punch row
// ---------------------------------------------------------------------------
async function insertPunchRow(connection, { COMPCODE, Idcard, inout, pmno, atttime, empname, location }) {
  const UNQID = String(generateUniqueId_Number());
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  const dateStr = `${dd}-${mm}-${yyyy}`;
  const CHK = String(Idcard).substring(0, 10)
    + dateStr
    + String(atttime).substring(0, 8);




  const sql = `
    INSERT INTO PSSATT (
      ATTDATE, ATTTIME, COMPCODE, IDCARD,
      USERNAME, IPADD, INOUT, PMNO, UNQID, CHK,DTYPE
    ) VALUES (
      SYSDATE, :ATTTIME, :COMPCODE, :IDCARD,
      :USERNAME, :IPADD, :INOUT, :PMNO, :UNQID,:CHK,:DTYPE
    )
  `;

  const binds = {
    ATTTIME: atttime,
    COMPCODE,
    IDCARD: Idcard,
    USERNAME: empname ?? null,
    IPADD: location ?? null,
    INOUT: inout,               // 1 = IN, 0 = OUT
    PMNO: pmno,
    UNQID,
    CHK,                                                        // âœ… max 28 chars
    DTYPE: "MOB-ACTUAL",
  };

  const result = await connection.execute(sql, binds);
  return { result, UNQID };
}


// ---------------------------------------------------------------------------
// PUNCH IN  â€” POST /attendance/punch-in
// Headers : compcode, idcard
// Body    : { idcard, compcode, empname, location }
// ---------------------------------------------------------------------------
export async function punchIn(req, res) {
  const { empname, location } = req.body;
  let connection;

  try {
    const target = await resolvePunchTarget(req, res);

    console.log("punchIn target:", target);
    if (!target) return;
    const { COMPCODE, Idcard } = target;
    connection = await getConnection();

    // 1. Check last punch â€” must be INOUT=0 (OUT) or no row at all to allow IN
    const lastPunch = await getLastPunchToday(connection, COMPCODE, Idcard);


    if (lastPunch && lastPunch.inout === 1) {
      // Last punch was IN â†’ already punched in, block duplicate
      return res.status(400).json({
        status: 0,
        message: "Already punched in. Please punch out first.",
        data: { inTime: lastPunch.atttime },
      });
    }

    // 2. lastPunch is null (no punch today) OR lastPunch.inout === 0 (last was OUT)
    //    Both cases allow a new PUNCH IN
    const now = new Date();
    const inTime = formatDateToOracle(now).split(" ")[1]; // "HH24:MI:SS"

    const { result, UNQID } = await insertPunchRow(connection, {
      COMPCODE,
      Idcard,
      inout: 1,           // IN
      pmno: 1,           // MOBATTLOG_TRG maps PMNO=2 to OUT; other values map to IN
      atttime: inTime,
      empname,
      location,
    });

    if (!result?.rowsAffected || result.rowsAffected < 1) {
      return res.status(500).json({ status: 0, message: "Oracle insert failed." });
    }

    await connection.commit();

    return res.status(201).json({
      status: 1,
      message: "Punch In successful.",
      data: {
        unqid: UNQID,
        idcard: Idcard,
        inTime,
        punchDate: formatDateToOracle(now),
      },
    });

  } catch (err) {
    logServiceError("AttendanceService:punchIn", err, req);
    try { await connection?.rollback(); } catch (_) { }
    return res.status(500).json({
      status: 0,
      message: err.errorNum ? `Oracle error: ${err.message}` : "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    await connection?.close();
  }
}


// ---------------------------------------------------------------------------
// PUNCH OUT  â€” PUT /attendance/punch-out
// Headers : compcode, idcard
// Body    : { latitude, longitude, location }
// ---------------------------------------------------------------------------
export async function punchOut(req, res) {
  const { location } = req.body;
  let connection;

  try {
    const target = await resolvePunchTarget(req, res);
    if (!target) return;
    const { COMPCODE, Idcard } = target;
    connection = await getConnection();

    // 1. Check last punch â€” must be INOUT=1 (IN) to allow OUT
    const lastPunch = await getLastPunchToday(connection, COMPCODE, Idcard);

    if (!lastPunch) {
      return res.status(404).json({
        status: 0,
        message: "No punch-in found for today. Please punch in first.",
      });
    }

    if (lastPunch.inout === 0) {
      // Last punch was OUT â†’ already punched out
      return res.status(400).json({
        status: 0,
        message: "Already punched out. Please punch in first.",
        data: { outTime: lastPunch.atttime },
      });
    }

    // 2. lastPunch.inout === 1 â†’ valid, insert OUT row
    const now = new Date();
    const outTime = formatDateToOracle(now).split(" ")[1]; // "HH24:MI:SS"

    const { result, UNQID } = await insertPunchRow(connection, {
      COMPCODE,
      Idcard,
      inout: 0,           // OUT
      pmno: 2,           // MOBATTLOG_TRG uses PMNO=2 to mark an OUT punch
      atttime: outTime,
      empname: null,
      location,
    });

    if (!result?.rowsAffected || result.rowsAffected < 1) {
      return res.status(500).json({ status: 0, message: "Oracle insert failed." });
    }

    await connection.commit();

    return res.status(200).json({
      status: 1,
      message: "Punch Out successful.",
      data: {
        unqid: UNQID,
        idcard: Idcard,
        inTime: lastPunch.atttime,   // from the IN row
        outTime,
        punchDate: formatDateToOracle(now),
      },
    });

  } catch (err) {
    logServiceError("AttendanceService:punchOut", err, req);
    try { await connection?.rollback(); } catch (_) { }
    return res.status(500).json({
      status: 0,
      message: err.errorNum ? `Oracle error: ${err.message}` : "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    await connection?.close();
  }
}


// ---------------------------------------------------------------------------
// GET STATUS  â€” GET /attendance/status
// Headers : compcode, idcard
// Returns : { punchIn, punchOut, status: "NONE"|"IN"|"OUT" }
// ---------------------------------------------------------------------------
export async function getAttendanceStatus(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase();
  const Idcard = String(req?.headers?.idcard);

  const connection = await getConnection();

  try {
    // Fetch all today's rows ordered oldestâ†’newest
    const result = await connection.execute(
      `SELECT INOUT, ATTTIME
       FROM PSSATT
       WHERE COMPCODE = :COMPCODE
         AND IDCARD   = :IDCARD
         AND TRUNC(ATTDATE) = TRUNC(SYSDATE)
       ORDER BY ATTDATE ASC`,
      { COMPCODE, IDCARD: Idcard }
    );

    if (!result.rows?.length) {
      return res.status(200).json({
        status: 1,
        data: { punchIn: null, punchOut: null, status: "NONE" },
      });
    }

    // Find first IN row and last OUT row
    let punchIn = null;
    let punchOut = null;

    for (const [inout, atttime] of result.rows) {
      if (inout === 1 && !punchIn) punchIn = atttime;  // first IN
      if (inout === 0) punchOut = atttime;  // last OUT
    }

    // Status = last row's INOUT
    const lastRow = result.rows[result.rows.length - 1];
    const lastInout = Number(lastRow[0]);

    return res.status(200).json({
      status: 1,
      data: {
        punchIn,
        punchOut,
        // "IN"  â†’ last punch was IN  â†’ show PUNCH OUT button
        // "OUT" â†’ last punch was OUT â†’ show PUNCH IN button
        status: lastInout === 1 ? "IN" : "OUT",
      },
    });

  } catch (err) {
    logServiceError("AttendanceService:getAttendanceStatus", err, req);
    return res.status(500).json({ status: 0, message: err.message });
  } finally {
    await connection?.close();
  }
}



// ---------------------------------------------------------------------------
// GET PUNCH SUMMARY  â€” GET /attendance/summary
// Headers : compcode, idcard  (via SetHeader)
// Returns : punches[], totalPunches, totalMinutesWorked, totalTimeFormatted
// ---------------------------------------------------------------------------
export async function getPunchSummary(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase();
  const Idcard = String(req?.headers?.idcard);

  const connection = await getConnection();

  try {
    const result = await connection.execute(
      `SELECT INOUT, ATTTIME, ATTDATE
       FROM PSSATT
       WHERE COMPCODE = :COMPCODE
         AND IDCARD   = :IDCARD
         AND TRUNC(ATTDATE) = TRUNC(SYSDATE)
       ORDER BY ATTDATE ASC`,
      { COMPCODE, IDCARD: Idcard }
    );

    if (!result.rows?.length) {
      return res.status(200).json({
        status: 1,
        data: {
          punches: [],
          totalPunches: 0,
          totalMinutesWorked: 0,
          totalTimeFormatted: "00:00",
        },
      });
    }

    const rows = result.rows; // [[INOUT, ATTTIME, ATTDATE], ...]

    // â”€â”€ Build punch pairs (INâ†’OUT) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const punches = [];
    let totalSeconds = 0;
    let pendingIn = null;   // holds the unmatched IN row

    for (const [inout, atttime] of rows) {
      const statusDigit = Number(inout);
      if (statusDigit === 1) {
        // New IN punch
        pendingIn = atttime;
      } else if (statusDigit === 0 && pendingIn) {
        // OUT punch paired with previous IN
        const inSecs = timeToSeconds(pendingIn);
        const outSecs = timeToSeconds(atttime);
        const durationSeconds = outSecs - inSecs;
        const validDuration = durationSeconds > 0 ? durationSeconds : 0;

        punches.push({
          inTime: pendingIn,
          outTime: atttime,
          durationSeconds: validDuration,
          durationFormatted: formatDuration(validDuration),
        });

        totalSeconds += validDuration;
        pendingIn = null;
      }
    }

    // If there's an unmatched IN (still inside), add it as active with duration
    if (pendingIn) {
      const inSecs = timeToSeconds(pendingIn);
      const nowParts = new Date();
      const nowSecs = (nowParts.getHours() * 3600) + (nowParts.getMinutes() * 60) + nowParts.getSeconds();
      const activeSeconds = Math.max(0, nowSecs - inSecs);

      totalSeconds += activeSeconds;

      punches.push({
        inTime: pendingIn,
        outTime: null,        // still inside
        durationSeconds: activeSeconds,
        durationMinutes: Math.floor(activeSeconds / 60),
        durationFormatted: activeSeconds > 0 ? `Active (${formatDuration(activeSeconds)})` : "Active",
      });
    }

    // â”€â”€ Calculate total span (first punch to last punch/now) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const firstRow = rows[0];
    const lastRow = rows[rows.length - 1];

    const spanStart = firstRow[1]; // atttime of first punch
    let spanEnd = lastRow[1];  // atttime of last punch

    // If last punch is IN (1), span ends at current time
    if (Number(lastRow[0]) === 1) {
      spanEnd = formatDateToOracle(new Date()).split(" ")[1];
    }

    const spanSecs = timeToSeconds(spanEnd) - timeToSeconds(spanStart);
    const totalSpanSeconds = spanSecs > 0 ? spanSecs : 0;

    return res.status(200).json({
      status: 1,
      data: {
        punches,
        totalPunches: punches.length,
        totalMinutesWorked: Math.floor(totalSpanSeconds / 60),
        totalTimeFormatted: formatDuration(totalSpanSeconds),
        totalSpanSeconds,
        totalSpanFormatted: formatDuration(totalSpanSeconds),
      },
    });

  } catch (err) {
    logServiceError("AttendanceService:getPunchSummary", err, req);
    return res.status(500).json({ status: 0, message: err.message });
  } finally {
    await connection?.close();
  }
}

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// "09:30:05" â†’ 34205 (seconds since midnight)
function timeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const [h, m, s] = timeStr.split(":").map(Number);
  return (h * 3600) + (m * 60) + (s || 0);
}

// Format seconds into "HH:mm:ss" for both summary and log rows
function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return "00:00:00";

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatTimeIST(timeStr) {
  if (!timeStr || timeStr === '--:--' || timeStr === '-' || timeStr === 'null') return '--:--';
  const str = String(timeStr).trim();
  if (/am|pm/i.test(str)) return str.toUpperCase();
  const parts = str.split(':');
  if (parts.length >= 2) {
    let h = parseInt(parts[0], 10);
    const m = String(parts[1]).padStart(2, '0');
    if (isNaN(h)) return str;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  }
  return str;
}

function formatHumanDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return "0m";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0 && m === 0) return `${h}h 0m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}


// ---------------------------------------------------------------------------
// GET ATTENDANCE APPROVAL LIST FROM PSSATT
// ---------------------------------------------------------------------------
export async function fetchAttendanceApprovalItems(connection) {
  const sql = `
    SELECT 
      TO_CHAR(ATTDATE, 'YYYY-MM-DD') AS ATTDATE_STR,
      ATTDATE,
      ATTTIME,
      COMPCODE,
      IDCARD,
      INOUT,
      PMNO,
      UNQID,
      USERNAME,
      DTYPE,
      APPROVAL_STATUS
    FROM (
      SELECT ATTDATE, ATTTIME, COMPCODE, IDCARD, INOUT, PMNO, UNQID, USERNAME, DTYPE, APPROVAL_STATUS
      FROM PSSATT
      WHERE IDCARD IS NOT NULL
        AND (APPROVAL_STATUS IS NULL OR LOWER(APPROVAL_STATUS) NOT IN ('approved', 'rejected'))
      ORDER BY ATTDATE DESC, ATTTIME DESC
    )
    WHERE ROWNUM <= 200
  `;

  const result = await connection.execute(sql);
  if (!result?.rows?.length) return [];

  const groups = {};
  for (const [attDateStr, attdate, atttime, compcode, idcard, inout, pmno, unqid, username, dtype, approvalStatus] of result.rows) {
    const key = `${idcard}_${attDateStr}`;
    if (!groups[key]) {
      const rawName = username ? String(username).split('@')[0].trim() : String(idcard);
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
      groups[key] = {
        id: `ATT-${idcard}-${attDateStr}`,
        docid: `ATT-${idcard}-${attDateStr}`,
        docId: `ATT-${idcard}-${attDateStr}`,
        idcard: String(idcard),
        idCard: String(idcard),
        empname: formattedName,
        empName: formattedName,
        userName: formattedName,
        compcode: compcode || 'PSS',
        deptname: '',
        attDateStr: attDateStr,
        dateStr: attDateStr,
        date: attDateStr,
        docdate: attdate,
        docDate: attdate,
        createdAt: attdate,
        group: 'attendance',
        approvalStatus: approvalStatus || 'pending',
        approval_status: approvalStatus || 'pending',
        punches: [],
        firstIn: null,
        lastOut: null,
        totalPunches: 0,
      };
    }

    const isPunchIn = Number(pmno) === 1;
    groups[key].punches.push({
      inout: isPunchIn ? 1 : 0,
      pmno: Number(pmno),
      atttime,
      atttimeFormatted: formatTimeIST(atttime),
      unqid,
      dtype,
    });
  }

  const uniqueIdcards = [...new Set(Object.values(groups).map(g => g.idcard).filter(Boolean))];
  const userMap = {};
  if (uniqueIdcards.length > 0) {
    try {
      const users = await prisma_Connector.user.findMany({
        where: { idCard: { in: uniqueIdcards } },
        select: { idCard: true, userName: true }
      });
      users.forEach(u => {
        if (u.idCard) userMap[String(u.idCard).trim()] = u.userName;
      });
    } catch (_) {}
  }

  const list = Object.values(groups).map(item => {
    if (userMap[item.idcard]) {
      item.empname = userMap[item.idcard];
      item.empName = userMap[item.idcard];
      item.userName = userMap[item.idcard];
    }
    item.punches.sort((a, b) => timeToSeconds(a.atttime) - timeToSeconds(b.atttime));
    item.totalPunches = item.punches.length;

    const firstInRow = item.punches.find(p => p.pmno === 1);
    const lastOutRow = [...item.punches].reverse().find(p => p.pmno === 2);
    const lastPunch = item.punches[item.punches.length - 1];

    item.punchIn = firstInRow ? firstInRow.atttime : (item.punches[0] ? item.punches[0].atttime : '--:--');
    item.punchOut = lastOutRow ? lastOutRow.atttime : '--:--';
    item.lastInout = lastPunch ? (lastPunch.pmno === 1 ? 1 : 0) : 0;

    let workedSeconds = 0;
    if (firstInRow && lastOutRow) {
      const diff = timeToSeconds(lastOutRow.atttime) - timeToSeconds(firstInRow.atttime);
      if (diff > 0) workedSeconds = diff;
    }
    item.totalTimeFormatted = formatDuration(workedSeconds);
    item.humanWorked = formatHumanDuration(workedSeconds);
    item.totalMinutesWorked = Math.floor(workedSeconds / 60);
    item.punchInFormatted = formatTimeIST(item.punchIn);
    item.punchOutFormatted = formatTimeIST(item.punchOut);

    const statusTag = item.lastInout === 1 ? 'Punched IN' : 'Punched OUT';
    item.reason = `${statusTag} · Total: ${item.humanWorked}`;
    item.userdata = {
      username: item.empname,
      userName: item.empname,
      Idcard: item.idcard,
      idCard: item.idcard,
    };
    item.userData = item.userdata;

    return item;
  });

  return list;
}

export async function getAttendanceApprovalList(req, res) {
  let connection;
  try {
    connection = await getConnection();
    if (!connection) return res.status(500).json({ status: 0, message: "Database connection failed", data: [] });

    const data = await fetchAttendanceApprovalItems(connection);
    return res.status(200).json({ status: 1, data });
  } catch (err) {
    logServiceError("AttendanceService:getAttendanceApprovalList", err, req);
    return res.status(500).json({ status: 0, message: err.message, data: [] });
  } finally {
    await connection?.close();
  }
}


// ---------------------------------------------------------------------------
// APPROVE / REJECT ATTENDANCE RECORD (UPDATE APPROVAL_STATUS IN PSSATT)
// ---------------------------------------------------------------------------
export async function requestAttendance_Approval(req, res) {
  let connection;
  try {
    let {
      idcard,
      idCard,
      attdate,
      dateStr,
      date,
      unqids,
      unqid,
      docid,
      docId,
      approval,
      status,
      approvedBy,
      rejectBy,
      rejectRemark,
      rejectReason,
      reason,
    } = req.body || {};

    const approvalStatus = String(approval || status || '').trim().toLowerCase();
    if (!['approved', 'rejected', 'pending'].includes(approvalStatus)) {
      return res.status(400).json({
        status: 0,
        message: "Invalid approval status. Must be 'approved', 'rejected', or 'pending'.",
      });
    }

    if (!idcard && idCard) idcard = idCard;
    if (!attdate && dateStr) attdate = dateStr;
    if (!attdate && date) attdate = date;
    const effectiveDocId = docid || docId;

    if ((!idcard || !attdate) && effectiveDocId && String(effectiveDocId).startsWith('ATT-')) {
      const parts = String(effectiveDocId).split('-');
      if (parts.length >= 3) {
        if (!idcard) idcard = parts[1];
        if (!attdate) attdate = parts.slice(2).join('-');
      }
    }

    async function resolveApproverIdCard(val, headerVal) {
      const candidate = String(val || headerVal || '').trim();
      if (!candidate) return null;
      try {
        const found = await prisma_Connector.user.findFirst({
          where: { OR: [{ idCard: candidate }, { userName: candidate }] },
          select: { idCard: true },
        });
        if (found?.idCard) return String(found.idCard).trim();
      } catch (_) {}
      return candidate;
    }

    const headerIdCard = req.headers?.idcard || req.headers?.Idcard;
    const effectiveApprovedBy = approvalStatus === 'approved'
      ? await resolveApproverIdCard(approvedBy, headerIdCard)
      : null;
    const effectiveRejectBy = approvalStatus === 'rejected'
      ? await resolveApproverIdCard(rejectBy, headerIdCard)
      : null;
    const effectiveRejectReason = approvalStatus === 'rejected' ? (rejectRemark || rejectReason || reason || '') : null;

    connection = await getConnection();
    if (!connection) {
      return res.status(500).json({ status: 0, message: "Database connection failed" });
    }

    let rowsAffected = 0;

    // 1. If unqids are provided, update matching UNQIDs directly
    const validUnqids = Array.isArray(unqids) ? unqids.filter(Boolean) : (unqid ? [unqid] : []);
    if (validUnqids.length > 0) {
      const placeholders = validUnqids.map((_, i) => `:unq${i}`).join(', ');
      const bindObj = Object.fromEntries(validUnqids.map((u, i) => [`unq${i}`, String(u)]));
      bindObj.approvalStatus = approvalStatus;
      bindObj.approvedBy = effectiveApprovedBy;
      bindObj.rejectBy = effectiveRejectBy;
      bindObj.rejectRemark = effectiveRejectReason;

      const sqlByUnqid = `
        UPDATE PSSTLT.PSSATT
        SET 
          APPROVAL_STATUS = :approvalStatus,
          APPROVED_BY     = :approvedBy,
          REJECTED_BY     = :rejectBy,
          REJECTED_REASON = :rejectRemark,
          APPROVAL_DATE   = SYSDATE
        WHERE UNQID IN (${placeholders})
      `;
      const result = await connection.execute(sqlByUnqid, bindObj, { autoCommit: true });
      rowsAffected = result?.rowsAffected || 0;
    }

    // 2. If rowsAffected is 0 and idcard + attdate are known, update by IDCARD & ATTDATE
    if (rowsAffected === 0 && idcard && attdate) {
      const cleanDate = String(attdate).slice(0, 10);
      const sqlByDate = `
        UPDATE PSSTLT.PSSATT
        SET 
          APPROVAL_STATUS = :approvalStatus,
          APPROVED_BY     = :approvedBy,
          REJECTED_BY     = :rejectBy,
          REJECTED_REASON = :rejectRemark,
          APPROVAL_DATE   = SYSDATE
        WHERE IDCARD = :idcard
          AND TRUNC(ATTDATE) = TO_DATE(:attdate, 'YYYY-MM-DD')
      `;
      const result = await connection.execute(
        sqlByDate,
        {
          approvalStatus,
          approvedBy: effectiveApprovedBy,
          rejectBy: effectiveRejectBy,
          rejectRemark: effectiveRejectReason,
          idcard: String(idcard),
          attdate: cleanDate,
        },
        { autoCommit: true }
      );
      rowsAffected = result?.rowsAffected || 0;
    }

    if (rowsAffected === 0) {
      return res.status(404).json({
        status: 0,
        message: "No matching attendance records found to update.",
      });
    }

    return res.status(200).json({
      status: 1,
      message: `Attendance ${approvalStatus} successfully.`,
      rowsAffected,
    });
  } catch (err) {
    logServiceError("AttendanceService:requestAttendance_Approval", err, req);
    return res.status(500).json({ status: 0, message: err.message });
  } finally {
    await connection?.close();
  }
}

export const approveAttendanceRecord = requestAttendance_Approval;
