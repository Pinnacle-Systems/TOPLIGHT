import { getConnection } from "../constants/db.connection.js";
import formatDateToOracle from "../Utiles/OracleDateFormat.js";
import { generateUniqueId_Number } from "../Utiles/UniqueNumber.js";
import { prisma_Connector } from "../../index.js";

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
      where: { Idcard: requesterIdcard },
      select: {
        Idcard: true,
        isAdmin: true,
        Companies: { select: { companyCode: true } },
      },
    });

    if (!requester) {
      res.status(403).json({ status: 0, message: "Requester is not authorized to punch for employees." });
      return null;
    }

    if (!requester.isAdmin) {
      const hasCompanyAccess = requester.Companies.some(
        company => String(company.companyCode || "").trim().toUpperCase() === targetCompCode
      );
      if (!hasCompanyAccess) {
        res.status(403).json({ status: 0, message: "You are not authorized to punch for this company." });
        return null;
      }

      const assignedEmployee = await prisma_Connector.user.findFirst({
        where: { Idcard: targetIdcard, hod: requester.Idcard },
        select: { Idcard: true },
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
// SHARED HELPER — get last punch row for today
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
// SHARED HELPER — INSERT a new punch row
// ---------------------------------------------------------------------------
async function insertPunchRow(connection, { COMPCODE, Idcard, inout, pmno, atttime, empname, location }) {
  const UNQID = String(generateUniqueId_Number());
 const now      = new Date();
  const dd       = String(now.getDate()).padStart(2, "0");
  const mm       = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy     = now.getFullYear();
  const dateStr  = `${dd}-${mm}-${yyyy}`;   
   const CHK      = String(Idcard).substring(0, 10)
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
    ATTTIME  : atttime,
    COMPCODE,
    IDCARD   : Idcard,
    USERNAME : empname  ?? null,
    IPADD    : location ?? null,
    INOUT    : inout,               // 1 = IN, 0 = OUT
    PMNO     : pmno,
    UNQID,
    CHK,                                                        // ✅ max 28 chars
    DTYPE    : "MOB-BULK",    
  };

  const result = await connection.execute(sql, binds);
  return { result, UNQID };
}


// ---------------------------------------------------------------------------
// PUNCH IN  — POST /attendance/punch-in
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
    connection = await getConnection(res);

    // 1. Check last punch — must be INOUT=0 (OUT) or no row at all to allow IN
    const lastPunch = await getLastPunchToday(connection, COMPCODE, Idcard);

    
    if (lastPunch && lastPunch.inout === 1) {
      // Last punch was IN → already punched in, block duplicate
      return res.status(400).json({
        status : 0,
        message: "Already punched in. Please punch out first.",
        data   : { inTime: lastPunch.atttime },
      });
    }

    // 2. lastPunch is null (no punch today) OR lastPunch.inout === 0 (last was OUT)
    //    Both cases allow a new PUNCH IN
    const now    = new Date();
    const inTime = formatDateToOracle(now).split(" ")[1]; // "HH24:MI:SS"

    const { result, UNQID } = await insertPunchRow(connection, {
      COMPCODE,
      Idcard,
      inout   : 1,           // IN
      pmno    : 1,           // MOBATTLOG_TRG maps PMNO=2 to OUT; other values map to IN
      atttime : inTime,
      empname,
      location,
    });

    if (!result?.rowsAffected || result.rowsAffected < 1) {
      return res.status(500).json({ status: 0, message: "Oracle insert failed." });
    }

    await connection.commit();

    return res.status(201).json({
      status : 1,
      message: "Punch In successful.",
      data   : {
        unqid    : UNQID,
        idcard   : Idcard,
        inTime,
        punchDate: formatDateToOracle(now),
      },
    });

  } catch (err) {
    console.error("punchIn error:", err);
    try { await connection?.rollback(); } catch (_) {}
    return res.status(500).json({
      status : 0,
      message: err.errorNum ? `Oracle error: ${err.message}` : "Internal server error",
      error  : process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    await connection?.close();
  }
}


// ---------------------------------------------------------------------------
// PUNCH OUT  — PUT /attendance/punch-out
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
    connection = await getConnection(res);

    // 1. Check last punch — must be INOUT=1 (IN) to allow OUT
    const lastPunch = await getLastPunchToday(connection, COMPCODE, Idcard);

    if (!lastPunch) {
      return res.status(404).json({
        status : 0,
        message: "No punch-in found for today. Please punch in first.",
      });
    }

    if (lastPunch.inout === 0) {
      // Last punch was OUT → already punched out
      return res.status(400).json({
        status : 0,
        message: "Already punched out. Please punch in first.",
        data   : { outTime: lastPunch.atttime },
      });
    }

    // 2. lastPunch.inout === 1 → valid, insert OUT row
    const now     = new Date();
    const outTime = formatDateToOracle(now).split(" ")[1]; // "HH24:MI:SS"

    const { result, UNQID } = await insertPunchRow(connection, {
      COMPCODE,
      Idcard,
      inout   : 0,           // OUT
      pmno    : 2,           // MOBATTLOG_TRG uses PMNO=2 to mark an OUT punch
      atttime : outTime,
      empname : null,
      location,
    });

    if (!result?.rowsAffected || result.rowsAffected < 1) {
      return res.status(500).json({ status: 0, message: "Oracle insert failed." });
    }

    await connection.commit();

    return res.status(200).json({
      status : 1,
      message: "Punch Out successful.",
      data   : {
        unqid    : UNQID,
        idcard   : Idcard,
        inTime   : lastPunch.atttime,   // from the IN row
        outTime,
        punchDate: formatDateToOracle(now),
      },
    });

  } catch (err) {
    console.error("punchOut error:", err);
    try { await connection?.rollback(); } catch (_) {}
    return res.status(500).json({
      status : 0,
      message: err.errorNum ? `Oracle error: ${err.message}` : "Internal server error",
      error  : process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  } finally {
    await connection?.close();
  }
}


// ---------------------------------------------------------------------------
// GET STATUS  — GET /attendance/status
// Headers : compcode, idcard
// Returns : { punchIn, punchOut, status: "NONE"|"IN"|"OUT" }
// ---------------------------------------------------------------------------
export async function getAttendanceStatus(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase();
  const Idcard   = String(req?.headers?.idcard);

  const connection = await getConnection(res);

  try {
    // Fetch all today's rows ordered oldest→newest
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
        data  : { punchIn: null, punchOut: null, status: "NONE" },
      });
    }

    // Find first IN row and last OUT row
    let punchIn  = null;
    let punchOut = null;

    for (const [inout, atttime] of result.rows) {
      if (inout === 1 && !punchIn)  punchIn  = atttime;  // first IN
      if (inout === 0)               punchOut = atttime;  // last OUT
    }

    // Status = last row's INOUT
    const lastRow   = result.rows[result.rows.length - 1];
    const lastInout = Number(lastRow[0]);

    return res.status(200).json({
      status: 1,
      data  : {
        punchIn,
        punchOut,
        // "IN"  → last punch was IN  → show PUNCH OUT button
        // "OUT" → last punch was OUT → show PUNCH IN button
        status: lastInout === 1 ? "IN" : "OUT",
      },
    });

  } catch (err) {
    console.error("getAttendanceStatus error:", err);
    return res.status(500).json({ status: 0, message: err.message });
  } finally {
    await connection?.close();
  }
}



// ---------------------------------------------------------------------------
// GET PUNCH SUMMARY  — GET /attendance/summary
// Headers : compcode, idcard  (via SetHeader)
// Returns : punches[], totalPunches, totalMinutesWorked, totalTimeFormatted
// ---------------------------------------------------------------------------
export async function getPunchSummary(req, res) {
  const COMPCODE = String(req?.headers?.compcode).toUpperCase();
  const Idcard   = String(req?.headers?.idcard);

  const connection = await getConnection(res);

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
        data  : {
          punches            : [],
          totalPunches       : 0,
          totalMinutesWorked : 0,
          totalTimeFormatted : "00:00",
        },
      });
    }

    const rows = result.rows; // [[INOUT, ATTTIME, ATTDATE], ...]

    // ── Build punch pairs (IN→OUT) ──────────────────────────────────────────
    const punches       = [];
    let   totalSeconds  = 0;
    let   pendingIn     = null;   // holds the unmatched IN row

    for (const [inout, atttime] of rows) {
      const statusDigit = Number(inout);
      if (statusDigit === 1) {
        // New IN punch
        pendingIn = atttime;
      } else if (statusDigit === 0 && pendingIn) {
        // OUT punch paired with previous IN
        const inSecs  = timeToSeconds(pendingIn);
        const outSecs = timeToSeconds(atttime);
        const durationSeconds = outSecs - inSecs;
        const validDuration   = durationSeconds > 0 ? durationSeconds : 0;

        punches.push({
          inTime           : pendingIn,
          outTime          : atttime,
          durationSeconds  : validDuration,
          durationFormatted: formatDuration(validDuration),
        });

        totalSeconds += validDuration;
        pendingIn     = null;
      }
    }

    // If there's an unmatched IN (still inside), add it as active
    if (pendingIn) {
      punches.push({
        inTime           : pendingIn,
        outTime          : null,        // still inside
        durationMinutes  : null,
        durationFormatted: "Active",
      });
    }

    // ── Calculate total span (first punch to last punch/now) ──────────────────
    const firstRow  = rows[0];
    const lastRow   = rows[rows.length - 1];
    
    const spanStart = firstRow[1]; // atttime of first punch
    let   spanEnd   = lastRow[1];  // atttime of last punch
    
    // If last punch is IN (1), span ends at current time
    if (Number(lastRow[0]) === 1) {
      spanEnd = formatDateToOracle(new Date()).split(" ")[1];
    }
    
    const spanSecs = timeToSeconds(spanEnd) - timeToSeconds(spanStart);
    const totalSpanSeconds = spanSecs > 0 ? spanSecs : 0;

    return res.status(200).json({
      status: 1,
      data  : {
        punches,
        totalPunches       : punches.length,
        totalMinutesWorked : Math.floor(totalSeconds / 60),
        totalTimeFormatted : formatDuration(totalSeconds),
        totalSpanSeconds,
        totalSpanFormatted : formatDuration(totalSpanSeconds),
      },
    });

  } catch (err) {
    console.error("getPunchSummary error:", err);
    return res.status(500).json({ status: 0, message: err.message });
  } finally {
    await connection?.close();
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

// "09:30:05" → 34205 (seconds since midnight)
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