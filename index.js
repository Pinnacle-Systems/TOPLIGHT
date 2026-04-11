

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path,{ dirname } from 'path';
import {gzipSync} from "fflate"
import dns from 'node:dns';

// ── Cloudflare DNS servers (1.1.1.1 = primary, 1.0.0.1 = fallback) ──────────
dns.setServers(['1.1.1.1', '1.0.0.1']);

// ── Verify DNS is actually working at startup ─────────────────────────────────
dns.resolve4('cloudflare.com', (err, addresses) => {
  if (err) {
    console.error('[DNS] ❌ Cloudflare DNS resolution test FAILED:', err.message);
  } else {
    console.log('[DNS] ✅ Cloudflare DNS working. cloudflare.com →', addresses.join(', '));
  }
});


import { createRequire } from "module";
const require = createRequire(import.meta.url);


import {
  commonMast,
  poRegister,
  supplier,
  poData,
  misDashboard,
  ordManagement,
  user,
  Leave,
  Permission,
  Notification,
  Advance,
  Role,
  Onduty,
  attendance
} from "./src/routes/index.js"
import { getConnection } from './src/constants/db.connection.js';
import bodyParser from 'body-parser';
import { PrismaClient } from './src/generated/prisma/client.js';
import { Server } from 'socket.io';
import http  from "http"
import nodeCron from 'node-cron';
import FileHandlerAndWrite from './src/Utiles/FileHandler.js';
import  fs from 'fs';
import formatDateToOracle from './src/Utiles/OracleDateFormat.js';
import { decompressFile_data } from './src/Utiles/decompress.js';
import { compressedFilePaths, jsonFilePaths } from './src/Utiles/Paths.js';




//192.168.1.50




const app = express()






app.use(express.json())
app.use(bodyParser?.json({limit:'500mb' }))
app.use(bodyParser?.urlencoded({ limit: '500mb', extended: true}))

app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  exposedHeaders: ['Content-Disposition']
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const path_dir = __dirname + '/web-build/';




app.use(express.static(path_dir));



BigInt.prototype['toJSON'] = function () {
  return parseInt(this.toString());
};




app.use('/poRegister', poRegister)

app.use('/att', poRegister)

app.use('/commonMast', commonMast)
app.use('/supplier', supplier)
app.use('/poData', poData)
app.use("/role",Role)
app.use('/misDashboard', misDashboard)
app.use('/ordManagement', ordManagement)
app.use('/leave',Leave)
app.use('/Permission',Permission)
app.use('/Notifi',Notification)
app.use("/advance",Advance)
app.use("/onduty",Onduty)

app.use("/attendance",attendance)



 


export async function getCommonData(req, res) {
    const Table=req.body?.table
    const where=req.body?.where
    const fields=req.body?.fields
    const map=req?.body?.map

    
   
    const connection = await getConnection(res)
    try {
     console.log("table----------------",Table);
     
        const sql =
            `select ${fields} from ${Table} WHERE ${where}`
        
        const result = await connection.execute(sql)
        console.log(result);
    
        if(map=="true" || map==true){
        const transformedResult = result?.rows?.map(row => {
          const keyValuePair = {};
          // Assuming the first row contains the column names
          result.metaData.forEach((col, index) => {
            keyValuePair[col.name] = row[index];
          });
          return keyValuePair;
         });
        
        return res.json({ statusCode: 0, data: transformedResult })
        }else{
          return res.json({ statusCode: 0, data: result?.rows })
        }
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection?.close()
    }
}

app.post('/getCommon', getCommonData)



app.use('/users', user)
const PORT = 8025;

const peers = {};

app.get('/',(req,res)=>{
 
  res.status(200).json({"name":"welcom"})
})

// ── Health + DNS Diagnostics Endpoint ─────────────────────────────────────────
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dns: { servers: dns.getServers(), status: 'unknown', resolvedIp: null },
    database: { mysql: 'unknown', oracle: 'unknown' },
  };

  // DNS check
  try {
    await new Promise((resolve, reject) => 
      dns.resolve4('cloudflare.com', (err, addrs) => {
        if (err) reject(err);
        else { health.dns.status = 'ok'; health.dns.resolvedIp = addrs[0]; resolve(); }
      })
    );
  } catch (e) {
    health.dns.status = 'error';
    health.dns.error = e.message;
    health.status = 'degraded';
  }

  // MySQL / Prisma check
  try {
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    health.database.mysql = 'ok';
    await prisma.$disconnect();
  } catch (e) {
    health.database.mysql = 'error: ' + e.message;
    health.status = 'degraded';
  }

  // Oracle check
  try {
    const { getConnection: getOra } = await import('./src/constants/db.connection.js');
    const conn = await getOra();
    await conn.execute('SELECT 1 FROM DUAL');
    health.database.oracle = 'ok';
    await conn.close();
  } catch (e) {
    health.database.oracle = 'error: ' + e.message;
    health.status = 'degraded';
  }

  const httpCode = health.status === 'ok' ? 200 : 207;
  res.status(httpCode).json(health);
});


const server=http.createServer(app)
const io=new Server(server,{cors: {
  origin: '*', 
  methods: ['GET', 'POST'],
}})

io.on('connection', client => {


  client.on('join', (roomId) => {
    client.join(roomId);
    peers[client.id] = roomId;
    console.log(`User ${client.id} joined room ${roomId}`);
    
    // Notify others in the room
    client.to(roomId).emit('user-connected', client.id);
  });

  // Relay ICE candidates
  client.on('ice-candidate', (candidate, targetId) => {
    client.to(targetId).emit('ice-candidate', candidate, client.id);
  });

  
  client.on('offer', (offer, targetId,to) => {
    client.to(targetId).emit('offer'+to?.group, offer, client.id);
  });

  // Relay SDP answers
  client.on('answer', (answer, targetId) => {
    client.to(targetId).emit('answer', answer, client.id);
  });

  // Handle disconnection
  client.on('disconnect', () => {
    const roomId = peers[client.id];
    if (roomId) {
      client.to(roomId).emit('user-disconnected', client.id);
      delete peers[client.id];
    }
    console.log('Client disconnected:', client.id);
  });


  

  //request
  client.on("permission_request", (data) => {
    client.broadcast.emit("get_Notifi_permission_id:"+data.compcode+""+data.hod, {
      data,
    });
  })






  

   client.on("message_request", (data) => {

   
    
    client.broadcast.emit("get_message:"+data.groupId+data?.COMPCODE, {
      data,
    });
  })


   

   client.on("locationUpdate", (data) => {
    console.log(data);
    
  })


  client.on("onduty_Approval_Response", (data) => {
    client.broadcast.emit("get_Onduty_Approval_status:"+data.compcode+""+data.Idcard, {
      data,
    });
  })



  client.on("leave_request", (data) => {
  client.broadcast.emit("get_Notifi_leave_id:"+data.compcode+""+data.hod, {
    data,
  });
   })




   client.on("onduty_request", (data) => {
  client.broadcast.emit("get_Notifi_onduty_id:"+data.compcode+""+data.hod, {
    data,
  });
   })



//approvals_response
  client.on("Approval_Response", (data) => {
  
    client.broadcast.emit("get_Approval_Notifi:"+data.compcode+""+data.Idcard, {
      data,
    });
  })
 

  client.on("leave_Approval_Response", (data) => {
  client.broadcast.emit("get_leave_Approval_Notifi:"+data.compcode+""+data.Idcard, {
    data,
  });
   }) 



    client.on("advance_request", (data) => {
  client.broadcast.emit("get_Notifi_advance_id:"+data.compcode+""+data.hod, {
    data,
  });
   })


     client.on("advance_Approval_Response", (data) => {
  client.broadcast.emit("get_advance_Approval_Notifi:"+data.compcode+""+data.Idcard, {
    data,
  });
   }) 
   

});




nodeCron.schedule('50  23 * * *', async () => {
  const prisma = new PrismaClient();
     const today =  new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  const currentDate = formatDateToOracle(new Date()).split(' ')[0];
    
  try {
    await FileHandlerAndWrite(async (dirPath) => {
      const jsonFilePath = path.join(dirPath, `${currentDate}.json`);
      const compressedFilePath = path.join(dirPath, `${currentDate}.text.gz`);

      const jsonWriteStream = fs.createWriteStream(jsonFilePath);
      const batchSize = 1000;
      let skip = 0;
      let recordCount = 0;
      let isFirstRecord = true;

      // Write opening bracket for JSON array
      jsonWriteStream.write('[');

      try {
        while (true) {
          const records = await prisma.location.findMany({
            skip,
            take: batchSize,
            where:{ createdAt: { gte: startOfDay, lte: endOfDay }}
          });

          if (records.length === 0) break;

          for (const record of records) {
            // Add comma before all records except the first one
            const prefix = isFirstRecord ? '' : ',\n';
            const line = prefix + JSON.stringify(record);
            
            if (!jsonWriteStream.write(line)) {
              await new Promise(resolve => jsonWriteStream.once('drain', resolve));
            }
            
            recordCount++;
            isFirstRecord = false;
          }

          skip += batchSize;
        }

        // Write closing bracket for JSON array
        jsonWriteStream.write(']');
        await new Promise(resolve => jsonWriteStream.end(resolve));

        // Read the properly formatted JSON file
        const fileData = await fs.promises.readFile(jsonFilePath);
        const compressed = gzipSync(fileData, { level: 9 });
        await fs.promises.writeFile(compressedFilePath, compressed);

        console.log(`Successfully processed ${recordCount} records. Compressed size: ${compressed.length} bytes`);

      } finally {
        try {
          if (fs.existsSync(jsonFilePath)) {
             fs.unlinkSync(jsonFilePath)
            await prisma?.location?.deleteMany({})

          }
        } catch (cleanupError) {
          console.error('Error cleaning up JSON file:', cleanupError);
        }
      }
    });

  } catch (error) {
    console.error('Error in cron job:', error);
  } finally {
    await prisma.$disconnect().catch(e => console.error('Error disconnecting Prisma:', e));
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


export const prisma_Connector = new PrismaClient();

