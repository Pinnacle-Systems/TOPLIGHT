import { mapRole, mapUser } from "../utils/responseMapper.js";
import bcrypt from "bcryptjs"
import { getConnection } from "../constants/dbConnection.js";
import OracleDB from "oracledb";
import { prisma_Connector } from "../../index.js";
import { readFile } from 'fs/promises';
import { google } from 'googleapis';
import Random_Otp from "../utils/randomOtp.js";
import { sendMail } from "../utils/mailer.js";
import fs from "fs"
import path from "path";
import fetch  from  "node-fetch"


export async function login(req, res) {
    // const connection = await getConnection(res)
    const {deviceName,MobileIP, username, password,COMPCODE } = req.body
    if (!username) return res.json({ statusCode: 1, message: "Username is Required" })
    if (!password) return res.json({ statusCode: 1, message: "Password is Required" });

    const sql =await prisma_Connector.user.findFirst({where:{userName:username},include:{companies:true}})

   
    if (!sql?.userName && !sql?.username) return res.json({ statusCode: 1, message: "Username Doesn't Exist" })
    let storedPassword = sql?.password

    const isMatched = await bcrypt.compare(password, storedPassword)


    if (!isMatched) return res.json({ statusCode: 1, message: "Password Doesn't Match",Id:sql?.id})
    console.log(isMatched, 'isMatched');
    // let gtCompMastId = result.rows[0][2]
    // let supplyDetails = await connection.execute(`
    // select pcategory 
    // from gtcompprodet 
    // join gtpartycatmast on gtcompprodet.partycat = gtpartycatmast.gtpartycatmastid
    // where gtcompmastid=:gtCompMastId
    // `, { gtCompMastId })
    // supplyDetails = supplyDetails.rows.map(item => item[0])

//     const sql2 = `SELECT A.COMPCODE "label",A.COMPCODE "value" FROM GTCOMPMAST A 
// WHERE A.PTRANSACTION = 'COMPANY' ORDER BY 1`
   

    // const result2 = await connection?.execute(sql2)

   

    // const transformedResult = result2?.rows?.map(row => {
    //     const keyValuePair = {};
    //     // Assuming the first row contains the column names
    //     result2.metaData.forEach((col, index) => {
    //       keyValuePair[col.name] = row[index];
    //     });
    //     return keyValuePair;
    //    });
  
    // await connection.close()
    await prisma_Connector?.userLog.create({data:{mobileName:deviceName,mobileIp:MobileIP,user:sql.userName,compCode:COMPCODE,idCard:sql?.idCard,type:"Login"}})
    return res.json({ statusCode: 0, message: "Login Successfull" ,data:mapUser(sql)})

}





export async function UserLogs(req,res){
  try {
    const data = await prisma_Connector.userLog.findMany({
      orderBy: { date: 'desc' },
    })
    return res.json({ status: data.length > 0 ? 1 : 0, data })
  } catch (error) {
    console.error('Error retrieving login logs:', error)
    return res.status(500).json({
      status: 0,
      message: 'Could not load login activity. Please try again.',
    })
  }
}

export async function create(req, res) {
    const { 
        username, 
        userName, 
        password, 
        checkboxes, 
        hod, 
        hr, 
        email, 
        otpemail, 
        otpEmail, 
        roleId, 
        Idcard, 
        idCard, 
        Compcodes, 
        companies, 
        approval, 
        level, 
        isAdmin, 
        ...reset 
    } = req.body;

    const userTargetName = String(userName || username || '').trim();
    const userTargetIdCard = String(idCard || Idcard || '').trim();
    const userTargetOtpEmail = otpEmail || otpemail || email;

    if (!userTargetName || !password) {
        return res.json({ statusCode: 1, message: 'Username and Password are Required' });
    }

    try {
        const userNameResult = await prisma_Connector.user.findFirst({
            where: { userName: userTargetName }
        });
        if (userNameResult?.userName) {
            return res.json({ statusCode: 1, message: 'UserName Already Exists' });
        }

        const rawCompanies = Compcodes || companies;
        const normalizedCompanies = Array.isArray(rawCompanies)
            ? rawCompanies.map(item => {
                const cCode = String(item.companyCode || item.COMPCODE || item.compCode || '').trim();
                const cId = String(item.companyId || item.companyid || item.COMPID || item.gtcompmastid || item.GTCOMPMASTID || '').trim();
                const gComp = item.gComp || item.GCOMP || undefined;
                return {
                    companyCode: cCode,
                    companyId: cId && cId !== 'undefined' && cId !== 'null' ? cId : (cCode || '0'),
                    ...(gComp ? { gComp: String(gComp) } : {})
                };
            }).filter(c => c.companyCode)
            : [];

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userCreationData = {
            userName: userTargetName,
            roleId: roleId || undefined,
            otpEmail: userTargetOtpEmail,
            password: hashedPassword,
            email: email || undefined,
            idCard: userTargetIdCard,
            hod: hod || undefined,
            hr: hr || undefined,
            approval: approval || 'HOD',
            level: level || 'user',
            isAdmin: Boolean(isAdmin),
            ...(normalizedCompanies.length > 0 ? { companies: { create: normalizedCompanies } } : {})
        };

        const UserCreation = await prisma_Connector.user.create({
            data: userCreationData
        });

        return res.json({ 
            statusCode: 0, 
            message: 'User created successfully', 
            data: mapUser(UserCreation) 
        });
    } catch (error) {
        console.error('Error in create user:', error);
        return res.json({ 
            statusCode: 1, 
            message: error.message || 'An error occurred while creating the user' 
        });
    }
}



export async function get_hod_token(req, res) {

    const hod=req?.query?.hod

    try {
        const result =await prisma_Connector.user.findUnique({where:{idCard:hod},select:{
            fcm:true
        }})

        return res.json({ statusCode: 0, data:result })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' });
    }
    
}


export async function get_fcm_token(req, res) {
    const Idcard=req?.query?.Idcard
    try {
        const result =await prisma_Connector.user.findUnique({where:{idCard:Idcard},select:{
            fcm:true
        }})

        return res.json({ statusCode: 0, data:result })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' });
    }
    
}

export async function get_refresh_token(req, res) {
try {
    

    const scopes = ['https://www.googleapis.com/auth/firebase.messaging'];
    const key =  JSON.parse(
        await readFile(new URL('./../../Fcm/serves-firebase.json', import.meta.url))
      );
    
    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      scopes
    );
    
    const tokens = await jwtClient?.authorize();
    return res?.json({status:0,data:{token: tokens?.access_token}})
 
} catch (error) {
    console.log(error);
    
}
  
}


export async function get(req, res) {

    const connection = await getConnection(res)
    try {
        
        const result =await prisma_Connector.user.findMany({include:{companies:true,role:true},where:{active:true}})

        let empMap = {};
        try {
            const empSql = `SELECT B.IDCARD, D.FNAME, C.COMPCODE FROM HREMPLOYMAST A 
JOIN HREMPLOYDETAILS B ON A.HREMPLOYMASTID = B.HREMPLOYMASTID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID = A.COMPCODE
JOIN HREMPLOYMAST D ON D.HREMPLOYMASTID = B.HREMPLOYMASTID`;
            const empRes = await connection.execute(empSql);
            if (empRes?.rows) {
                empRes.rows.forEach(r => {
                    const idCard = String(r[0] || '').trim();
                    const fName = r[1];
                    const compCode = r[2];
                    if (idCard) {
                        empMap[idCard] = fName;
                        if (compCode) {
                            empMap[`${compCode}-${idCard}`] = fName;
                        }
                    }
                });
            }
        } catch (e) {
            console.warn('[user.service.js:get] Could not fetch employee names:', e);
        }

        const mapdata = result.map((data) => {
            const rawId = String(data?.idCard || '').trim();
            const empName = empMap[rawId] || null;
            const finalUsername = data?.userName || data?.username || '';
            return {
                ...data,
                gmail: data?.email,
                username: finalUsername,
                userName: finalUsername,
                Idcard: data?.idCard,
                idCard: data?.idCard,
                empName: empName,
                employeeName: empName,
            };
        });

        return res.json({ statusCode: 0, data:mapdata })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}




export async function update_fcm(req, res) {
const compCode=String(req.headers?.compcode).toUpperCase()
const Idcard=req.body?.Idcard
const fcm=req.body?.fcm
    
    try {
       if(Idcard && fcm){
        const result =await prisma_Connector.user.update({where:{idCard:Idcard},data:{fcm}})
        return res.json({ statusCode: 0, data:result })
       }

       return res.json({ statusCode: 500, data:{},mesage:"Id Not Found" })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' });
    }
    
}



export async function getUserDetails(req, res) {
     const Idcard=req.query.Idcard
     const ismul=req?.query?.ismul
     const COMPCODE=String(req?.headers?.compcode).toUpperCase()
    const connection = await getConnection(res)
    try {
        if(ismul){
            const sql =`SELECT D.MNNAME1 DeptName,A.FNAME,A.IDCARDNO EMPID,c.DESIGNATION,E.MOBNO
            FROM HREMPLOYMAST A
             JOIN HREMPLOYDETAILS B ON A.HREMPLOYMASTID=B.HREMPLOYMASTID
            JOIN GTDESIGNATIONMAST C ON C.GTDESIGNATIONMASTID=B.DESIGNATION
            JOIN GTDEPTDESGMAST D ON D.GTDEPTDESGMASTID=B.DEPTNAME
            JOIN GTCOMPMAST CM ON  CM.GTCOMPMASTID=A.COMPCODE 
            left join  HRECONTACTDETAILS E on E.HREMPLOYMASTID=A.HREMPLOYMASTID
            WHERE   A.IDCARDNO IN (${String(Idcard)})  and CM.COMPCODE=:COMPCODE` 
            const result =await connection.execute(sql,{COMPCODE})  

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
            const sql=`  
SELECT D.MNNAME1 DeptName,A.FNAME,A.IDCARDNO EMPID,c.DESIGNATION,E.MOBNO
FROM HREMPLOYMAST A
 JOIN HREMPLOYDETAILS B ON A.HREMPLOYMASTID=B.HREMPLOYMASTID
JOIN GTDESIGNATIONMAST C ON C.GTDESIGNATIONMASTID=B.DESIGNATION
JOIN GTDEPTDESGMAST D ON D.GTDEPTDESGMASTID=B.DEPTNAME
JOIN GTCOMPMAST CM ON  CM.GTCOMPMASTID=A.COMPCODE 
left join  HRECONTACTDETAILS E on E.HREMPLOYMASTID=A.HREMPLOYMASTID
WHERE A.IDCARDNO=:IDCARDNO and CM.COMPCODE=:COMPCODE
`
            const result =await connection.execute(sql,{COMPCODE,IDCARDNO:Idcard})  
       const resp = result?.rows[0]
        return res.json({ statusCode: 0, data: resp ? {
            Department:resp[0],Name:resp[1],EmpId:resp[2],Designation:resp[3],
            Mobile:resp[4]
          } : {} })

        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}

export async function getOne(req, res) {

    const connection = await getConnection(res)
    try {
        const sql = `  
  select T.userName, mobuserlog.allowedpages, T.DEFAULTADMIN
from mobileuser T
left join mobuserlog on T.USERNAME = mobuserlog.USERNAME
order by userName`
        const result = await connection.execute(sql)
        const resp = result.rows.map(user => ({
            userName: user[0], allowedpages: user[1],
            defaultAdmin: user[2]
        }))
        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}

export async function getUserDet(req, res) {
    const connection = await getConnection(res)
    try {
        const sql = `SELECT B.IDCARD||'@'||C.COMPCODE MOBUSER,C.COMPCODE,D.BANDNAME,E.MNNAME1 DEPTNAME,F.DESIGNATION FROM HREMPLOYMAST A
JOIN HREMPLOYDETAILS B ON A.HREMPLOYMASTID=B.HREMPLOYMASTID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID=A.COMPCODE
JOIN HRBANDMAST D ON D.HRBANDMASTID=B.BAND
JOIN GTDEPTDESGMAST E ON E.GTDEPTDESGMASTID=B.DEPTNAME
JOIN GTDESIGNATIONMAST F ON F.GTDESIGNATIONMASTID=B.DESIGNATION
WHERE D.BANDNAME='STAFF' AND B.IDACTIVE='YES'`
        const result = await connection.execute(sql)

        const resp = result.rows.map(user => ({ id: user[0], value: user[0], role: user[4] }))

        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}


const pipeURIImage=async (res)=>{

     const imageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTdmrjoiXGVFEcd1cX9Arb1itXTr2u8EKNpw&s';

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return res.status(500).send('Failed to fetch image');
    }

    res.setHeader('Content-Type', response.headers.get('content-type'));

    response.body.pipe(res);
  } catch (err) {
    res.status(500).send('Error fetching image');
  }
}
export async function getUserImage(req, res) {
    const USERNAME = req.params?.USERNAME;

    try {

       var pic=await prisma_Connector?.user?.findFirst({where:{userName:USERNAME}})
       console.log(pic);
       
       if(pic?.pic){
       const pa_loc=path.join(process.cwd(),'.',"uploads",'profile',pic.pic)
       
       if(fs.existsSync(pa_loc)){
       res.setHeader("Content-Type","Image/JPEG")
       const fs_stream=fs.createReadStream(pa_loc)
      return fs_stream.pipe(res)
       }else{
       return pipeURIImage(res)
       }
    }

  return pipeURIImage(res)
    } catch (error) {
        console.log(error);
        
    }
  
    // let connection;
    // try {
    //   // Step 1: Get a connection to the Oracle DB
    //   connection = await getConnection(res);
  
      
    //   const sql = `SELECT IMAGE FROM MOBILEUSER WHERE lower(USERNAME) = :USERNAME`;
    //   const binds = { USERNAME };
  
    
    //   const result = await connection.execute(sql, binds, { outFormat: OracleDB.OUT_FORMAT_OBJECT });
  
    
    //   const imageBlob = result?.rows[0]?.IMAGE;
  
    //   if (!imageBlob) {
     
    //     return res.status(404).send('Image not found');
    //   }

    //   imageBlob?.getData((err, data) => {
    //     if (err) {
    //       console.error('Error fetching image data:', err);
    //       return res.status(500).json({ error: 'Failed to fetch image data' });
    //     }
  
    //     res.setHeader('Content-Type', 'image/jpeg'); 
    //     res.send(data);  
  
    //   });
  
     
    
      
 
  
  
    // } catch (err) {
    //   console.error('Error fetching image:', err);
    //   res.status(500).json({ error: 'Internal Server Error' });
    // } finally {
    //   if (connection) {
    //     await connection.close();
    //   }
    // }
  }

export async function UploadImage(req, res) {
    try {
        
     
        console.log(req?.headers);
    
      if (!req.file) {
        return res.status(400).send('No image data provided');
      }
      
      
     var result= await prisma_Connector?.user.update({data:{pic:req?.file?.filename},where:{idCard:req?.headers?.idcard}})
  


      
      
  
    //   // Step 4: Connect to Oracle and insert the image
    //     const connection = await getConnection(res)

    //   const sql = `Update MOBILEUSER set IMAGE=:imageData where USERNAME='${USERNAME}'`;
    //   const binds = {
    //     imageData:req?.file?.buffer
    //   };
  
    //   const result = await connection.execute(sql, binds, { autoCommit: true });
      
      res.status(200).send({ message: 'Image uploaded successfully!',status:1, result });
      
    //   // Step 5: Close the connection
    //   await connection.close();
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: 'Failed to upload image', error: err.message });
    }

}
  


export async function getDesignation(req, res) {
    const connection = await getConnection(res)
    try {
        const sql = `select distinct(role) from mobuserlog `
        const result = await connection.execute(sql)

        const resp = result.rows.map(user => ({ value: user[0], id: user[0] }))

        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}



export async function getCreatedRolesOnPage(req, res) {
      const COMPCODE = String(req?.headers?.compcode || '').toUpperCase();
    try { 
        const queryWhere = { roleOnPage: { some: {} } };
        if (COMPCODE && COMPCODE !== 'UNDEFINED' && COMPCODE !== 'NULL') {
            queryWhere.compCode = COMPCODE;
        }
        const result = await prisma_Connector.role.findMany({
            where: queryWhere,
            select: { name: true, id: true, active: true, roleOnPage: true }
        });
       
   
        res.json({ status: 1, data: (result || []).map(mapRole) });
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.json({ 
            status:  500,
            data: [],
            message: 'An error occurred while fetching roles'
        });
    }
}


export async function getRolesOnPage(req, res) {
    //   const COMPCODE = String(req?.headers?.compcode).toUpperCase();
      const {RoleId}=req?.query
  
    try { 
        const result = await prisma_Connector.roleOnPage.findMany({
            where: RoleId ? {roleName:RoleId}: {  },
        });
        const filterResult = result?.map((data) => {
           
            
         return {
            dbid:data?.id,
            id: data?.roleId,
            create: data?.create,
            read: data?.read,
            delete: data?.delete,
            edit: data?.edit,
            isdefault: data?.isDefault ?? data?.isdefault ?? false,
            link: data?.link
        }});

   
        res.json({ status: 1, data: filterResult });
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.json({ 
            status:  500,
            data: [],
            message: 'An error occurred while fetching roles'
        });
    }
}



export async function getUserRolesOnPage(req, res) {
    const COMPCODE = String(req?.headers?.compcode || '').toUpperCase();
    const { RoleId } = req?.query || {};

    if (!RoleId || RoleId.startsWith('undefined')) {
        return res.json({ status: 1, data: [] });
    }

    try {
        const queryWhere = { name: RoleId };
        if (COMPCODE && COMPCODE !== 'UNDEFINED' && COMPCODE !== 'NULL') {
            queryWhere.compCode = COMPCODE;
        }

        const result = await prisma_Connector.role.findMany({
            where: queryWhere,
            select: { roleOnPage: true }
        });

        const rolePages = result[0]?.roleOnPage || [];
        const filterResult = rolePages.map((data) => ({
            id: data?.roleId,
            create: data?.create,
            read: data?.read,
            delete: data?.delete,
            edit: data?.edit,
            isdefault: data?.isDefault ?? data?.isdefault ?? false,
            link: data?.link
        }));

        res.json({ status: 1, data: filterResult });
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.json({ 
            status: 500,
            data: [],
            message: 'An error occurred while fetching roles'
        });
    }
}

export async function createRoleOnPage(req, res) {
    const { roleName, permissions } = req.body;

    try {
        if (!roleName) {
            return res.status(400).json({ status: 0, message: 'roleName is required' });
        }

        if (!permissions || typeof permissions !== 'object' || Object.keys(permissions).length === 0) {
            return res.status(400).json({ status: 0, message: 'permissions are required' });
        }

        const role = await prisma_Connector.role.findUnique({
            where: { name: roleName }
        });

        if (!role) {
            return res.status(404).json({ status: 0, message: `Role "${roleName}" does not exist` });
        }

        const insertPromises = [];

        for (const page in permissions) {
            const pagePermissions = permissions[page] || {};

            const read = Boolean(pagePermissions.read);
            const create = Boolean(pagePermissions.create);
            const edit = Boolean(pagePermissions.edit);
            const del = Boolean(pagePermissions.delete);
            const isdefault = Boolean(pagePermissions.isdefault ?? pagePermissions.isDefault);

            insertPromises.push({
                roleId: role.id,
                roleName,
                link: page,
                read,
                create,
                edit,
                delete: del,
                isDefault: isdefault,
            });
        }

        // Clean up any existing permissions for this role and insert fresh ones in a transaction
        const [deleteResult, createResult] = await prisma_Connector.$transaction([
            prisma_Connector.roleOnPage.deleteMany({ where: { roleName } }),
            prisma_Connector.roleOnPage.createMany({ data: insertPromises })
        ]);

        return res.json({
            status: 1,
            data: createResult,
            message: 'Role permissions created successfully'
        });
    } catch (error) {
        console.error('createRoleOnPage error:', error);
        return res.status(500).json({
            status: 0,
            message: 'An error occurred while creating role permissions: ' + error.message
        });
    }
}

export async function UpdateRoleOnPage(req, res) {
    const { roleName, permissions } = req.body;

    try {
        // Validate required fields
        if (!roleName || !permissions) {
            return res.status(400).json({ 
                status: 0, 
                message: 'roleName and permissions are required' 
            });
        }

        const role = await prisma_Connector.role.findUnique({
            where: { name: roleName }
        });

        // Process each permission in parallel
        const results = await Promise.all(
            Object.entries(permissions).map(async ([page, pagePermissions]) => {
                try {
                    const { read, create, edit, delete: del, isdefault, isDefault, dbid } = pagePermissions;

                    // Prepare the update/create data
                    const upsertData = {
                        read: Boolean(read),
                        create: Boolean(create),
                        edit: Boolean(edit),
                        delete: Boolean(del),
                        isDefault: Boolean(isdefault ?? isDefault),
                        roleName: roleName,
                        link: page,
                        ...(role ? { roleId: role.id } : {})
                    };

                    if (dbid && Number(dbid) > 0) {
                        return await prisma_Connector.roleOnPage.update({
                            where: { id: Number(dbid) },
                            data: upsertData
                        });
                    } else {
                        const existing = await prisma_Connector.roleOnPage.findFirst({
                            where: { roleName, link: page }
                        });
                        if (existing) {
                            return await prisma_Connector.roleOnPage.update({
                                where: { id: existing.id },
                                data: upsertData
                            });
                        } else {
                            return await prisma_Connector.roleOnPage.create({
                                data: upsertData
                            });
                        }
                    }

                } catch (err) {
                    console.error(`Error processing page ${page}:`, err);
                    return null; // Continue processing other pages even if one fails
                }
            })
        );

        // Check if any operations failed
        const failedOperations = results.filter(result => result === null).length;
        const successCount = results.length - failedOperations;

        if (successCount === 0 && failedOperations > 0) {
            return res.status(500).json({
                status: 0,
                message: 'Failed to update any permissions'
            });
        }

        return res.json({ 
            status: 1, 
            data: { 
                message: 'Permissions processed successfully',
                count: successCount,
                successCount,
                failedCount: failedOperations
            } 
        });

    } catch (error) {
        console.error('Unexpected error in UpdateRoleOnPage:', error);
        return res.status(500).json({ 
            status: 0, 
            message: 'An error occurred while updating permissions: ' + error.message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}




export async function getCompanyCode(req,res) { 
    const Idcard = req.query.Idcard;

    if (Idcard) {
        try {
            const allocatedCompanies = await prisma_Connector.companyCode.findMany({
                where: { idCard: String(Idcard) },
                select: { companyCode: true, companyId: true },
                orderBy: { companyCode: 'asc' },
            });

            return res.json({
                statusCode: 0,
                data: allocatedCompanies.map(company => ({
                    id: company.companyCode,
                    value: company.companyCode,
                    COMPID: company.companyId,
                })),
            });
        } catch (err) {
            console.error('Error retrieving allocated company codes:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    const connection = await getConnection(res);
    try {
        const sql =`SELECT A.COMPCODE "id",A.COMPCODE "value",A.GTCOMPMASTID COMPID FROM GTCOMPMAST A 
WHERE A.PTRANSACTION = 'COMPANY' ORDER BY 1`

        const result = await connection.execute(sql)
        
        const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
          
          return res.json({ statusCode: 0, data: transformedResult })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection?.close()
    }
}


export async function getEmployeeIds(req,res) { 
   
    const connection = await getConnection(res)
      try {
        
        const sql =`SELECT C.COMPCODE||'('||B.IDCARD ||')'||'('|| D.FNAME ||')' "value",
C.COMPCODE||'-'||B.IDCARD "id",
C.COMPCODE,
C.COMPNAME,
B.DEPTNAME,
D.FNAME "empName",
D.FNAME "EMPNAME",
D.FNAME "FNAME",
B.IDCARD "idCard",
B.IDCARD "IDCARD"
FROM HREMPLOYMAST A 
JOIN HREMPLOYDETAILS B ON A.HREMPLOYMASTID = B.HREMPLOYMASTID
JOIN GTCOMPMAST C ON C.GTCOMPMASTID = A.COMPCODE
JOIN HREMPLOYMAST D ON D.HREMPLOYMASTID = B.HREMPLOYMASTID
ORDER BY 3,TO_NUMBER(B.IDCARD)`

   
        const result = await connection.execute(sql)
        
        const transformedResult = result?.rows?.map(row => {
            const keyValuePair = {};
            // Assuming the first row contains the column names
            result.metaData.forEach((col, index) => {
              keyValuePair[col.name] = row[index];
            });
            return keyValuePair;
           });
          
          return res.json({ statusCode: 0, data: transformedResult })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}




export async function getEmployeeIdsWithAtt(req, res) {

  const connection = await getConnection(res);

  try {
    const HodId = req?.query?.hod;

    // 1. Get employee idcards under this HOD from Prisma
    const prismaIdget = await prisma_Connector?.user?.findMany({
      where: { hod: HodId },
    });

    if (!prismaIdget?.length) {
      return res.json({ statusCode: 0, data: [] });
    }

    const Ids = prismaIdget.map((u) => u?.Idcard).filter(Boolean);

    if (!Ids.length) {
      return res.json({ statusCode: 0, data: [] });
    }

    // Oracle bind-safe IN list  â†’ :0, :1, :2 ...
    const bindPlaceholders = Ids.map((_, i) => `:id${i}`).join(", ");
    const bindValues       = Object.fromEntries(Ids.map((id, i) => [`id${i}`, id]));

    // 2. Employee master info
    const empSql = `
      SELECT
        C.COMPCODE,
        C.COMPNAME,
        B.IDCARD,
        B.DEPTNAME,
        D.FNAME AS EMPNAME
      FROM HREMPLOYMAST A
      JOIN HREMPLOYDETAILS B ON A.HREMPLOYMASTID = B.HREMPLOYMASTID
      JOIN GTCOMPMAST      C ON C.GTCOMPMASTID   = A.COMPCODE
      JOIN HREMPLOYMAST    D ON D.HREMPLOYMASTID = B.HREMPLOYMASTID
      WHERE B.IDCARD IN (${bindPlaceholders})
      ORDER BY C.COMPCODE, TO_NUMBER(B.IDCARD)
    `;

    const empResult = await connection.execute(empSql, bindValues);

    const employees = empResult.rows.map((row) => {
      const obj = {};
      empResult.metaData.forEach((col, i) => { obj[col.name] = row[i]; });
      return obj;
    });

    if (!employees.length) {
      return res.json({ statusCode: 0, data: [] });
    }

    // 3. Today's attendance from PSSATT for all these IDCARDs at once
    const attSql = `
      SELECT
        IDCARD,
        INOUT,
        ATTTIME,
        ATTDATE
      FROM PSSATT
      WHERE IDCARD IN (${bindPlaceholders})
        AND TRUNC(ATTDATE) = TRUNC(SYSDATE)
      ORDER BY IDCARD, ATTDATE ASC
    `;

    const attResult = await connection.execute(attSql, bindValues);

    // 4. Group attendance rows by IDCARD
    const attMap = {};

    for (const [idcard, inout, atttime] of attResult.rows) {
      const key = String(idcard);
      if (!attMap[key]) attMap[key] = [];
      attMap[key].push({ inout: Number(inout), atttime });
    }

    // 5. Compute summary per employee
    const data = employees.map((emp) => {
      const empIdForMap = String(emp.IDCARD);
      const rows    = attMap[empIdForMap] || [];
      const summary = computeAttSummary(rows);

      return {
        // identity
        id      : `${emp.COMPCODE}-${emp.IDCARD}`,
        idcard  : emp.IDCARD,
        empname : emp.EMPNAME,
        compcode: emp.COMPCODE,
        compname: emp.COMPNAME,
        deptname: emp.DEPTNAME,

        // today's first IN / last OUT for display
        punchIn  : summary.firstInTime,
        punchOut : summary.lastOutTime,

        // last row's INOUT â€” drives the button (0=OUTâ†’show IN, 1=INâ†’show OUT)
        lastInout: summary.lastInout,

        // summary stats
        totalPunches      : summary.totalPunches,
        totalMinutesWorked: summary.totalMinutes,
        totalTimeFormatted: minutesToFormatted(summary.totalMinutes),

        // full punch log for expanded view
        punches: summary.punches,
      };
    });

    return res.json({ status: 1, data });

  } catch (err) {
    console.error("getEmployeeIdsWithAtt error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await connection.close();
  }
}


// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function computeAttSummary(rows) {
  // rows: [{ inout: 0|1, atttime: "HH:MI:SS" }, ...] ordered ASC

  const punches     = [];
  let   totalMinutes = 0;
  let   pendingIn    = null;
  let   firstInTime  = null;
  let   lastOutTime  = null;
  let   lastInout    = null;

  for (const { inout, atttime } of rows) {
    const statusDigit = Number(inout);
    lastInout = statusDigit;

    if (statusDigit === 1) {
      pendingIn = atttime;
      if (!firstInTime) firstInTime = atttime;

    } else if (statusDigit === 0) {
      lastOutTime = atttime;

      if (pendingIn) {
        const duration = timeToMinutes(atttime) - timeToMinutes(pendingIn);
        const mins     = duration > 0 ? duration : 0;
        totalMinutes  += mins;

        punches.push({
          inTime           : pendingIn,
          outTime          : atttime,
          durationMinutes  : mins,
          durationFormatted: minutesToFormatted(mins),
        });

        pendingIn = null;
      }
    }
  }

  // Unmatched IN â†’ still active
  if (pendingIn) {
    punches.push({
      inTime           : pendingIn,
      outTime          : null,
      durationMinutes  : null,
      durationFormatted: "Active",
    });
  }

  return {
    punches,
    totalMinutes,
    firstInTime,
    lastOutTime,
    lastInout,                    // null=no punch, 1=IN, 0=OUT
    totalPunches: punches.length,
  };
}

// "09:30:00" â†’ 570
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// 570 â†’ "09:30"
function minutesToFormatted(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return "00:00";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}




export async function remove(req, res) {
    const rawId = req.body?.id || req.query?.id || req.params?.id;
    const userId = Number(rawId);
    if (!userId) {
        return res.json({ statusCode: 1, status: 0, message: "User ID is required" });
    }
    try {
        const userRecord = await prisma_Connector.user.findUnique({ where: { id: userId } });
        if (!userRecord) {
            return res.json({ statusCode: 1, status: 0, message: "User not found" });
        }
        try {
            await prisma_Connector.notification.deleteMany({
                where: { OR: [{ senderId: userId }, { receiverId: userId }] }
            }).catch(() => {});

            if (userRecord.idCard) {
                await prisma_Connector.companyCode.deleteMany({
                    where: { idCard: userRecord.idCard }
                }).catch(() => {});
                await prisma_Connector.settings.deleteMany({
                    where: { userId: userRecord.idCard }
                }).catch(() => {});
            }

            await prisma_Connector.user.delete({ where: { id: userId } });
            return res.json({ statusCode: 0, status: 1, message: "User deleted successfully" });
        } catch (deleteErr) {
            console.warn('[user.service.js:remove] Hard delete failed, soft deleting:', deleteErr?.message);
            await prisma_Connector.user.update({
                where: { id: userId },
                data: {
                    active: false,
                    userName: `${userRecord.userName}_deleted_${Date.now()}`
                }
            });
            return res.json({ statusCode: 0, status: 1, message: "User deleted successfully" });
        }
    } catch (err) {
        console.error("Error in user remove:", err);
        return res.status(500).json({ statusCode: 1, status: 0, message: "Internal server error" });
    }
}

export async function send_Otp(req,res){
    var reset=req?.body?.reset
    
        try {
      var data=await prisma_Connector.user?.findFirst({where: reset ? {OR:[{otpemail:req?.body?.username},{username:req?.body?.username}]}:{username:req?.body?.username}})
     
      
       const isMatched = !reset && await bcrypt.compare(req?.body?.password, data?.password)


 
       
      if(isMatched || reset && data?.otpemail){
      var Random_otp_val=Random_Otp()
      console.log(data);
      
      var otp=await sendMail({to:data?.otpemail,otp:Random_otp_val})
     
     
     
      if(otp?.accepted[0]==data?.otpemail){
        await prisma_Connector.user?.update({
          where:{
            username:data?.username
          },data:{
            otp:Random_otp_val
          }
        }).then((data)=>{
          if(data?.otp)
            res.json({status:1})
          else
            res.json({status:0})
        })
      
      }else{
        res.json({status:0})
      }
      }
      else if(!data?.otpemail){
        return res.json({status:0,err:"Email is Not Register!"})
      }else{
        return res.json({status:0,err:"Password is Not Correct!"})
      }
      } catch (error) {
        console.log(error);
        res.json({status:500,err:error})
      }
      
      
      
  
}





export async function verify_Otp_and_change_pass(req,res){
    var otp=req?.body?.otp
    var username=req?.body?.username
    var NewPass=req?.body?.NewPass
    
        try {
          var data=await prisma_Connector.user?.findFirst({where:{otp:otp}})
         if(data?.otp){
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(NewPass, saltRounds); 
            const changePassword=await prisma_Connector?.user?.update({
                where:{username},data:{password:hashedPassword}
            })
            if(changePassword?.password){
                return res?.json({status:1})
            }else{
                return res?.json({status:0})
            }
          }else{

            return res?.json({status:0})
          }
        }catch(err){
            console.log(err);
            

        }
      
      
  
}





export async function Change_Settings(req, res) {
const compCode=String(req.headers?.compcode).toUpperCase()
const Idcard=req.body?.Idcard
const data=req.body?.data

    try {
       
        const result =await prisma_Connector.settings.upsert({where:{userId:Idcard},update:data,create:data}) 
        
        return res.json({ statusCode: 1, data:result })
      

    //    return res.json({ statusCode: 500, data:{},mesage:"Id Not Found" })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' });
    }
    
}




export async function get_Hod_Details(req, res) {
const Idcard=req.query?.hod
const COMPCODE=String(req.headers?.compcode).toUpperCase()
const connection = await getConnection(res)
    try {


          const sql =`SELECT D.MNNAME1 DeptName,A.FNAME,A.IDCARDNO EMPID,c.DESIGNATION,E.MOBNO
            FROM HREMPLOYMAST A
             JOIN HREMPLOYDETAILS B ON A.HREMPLOYMASTID=B.HREMPLOYMASTID
            JOIN GTDESIGNATIONMAST C ON C.GTDESIGNATIONMASTID=B.DESIGNATION
            JOIN GTDEPTDESGMAST D ON D.GTDEPTDESGMASTID=B.DEPTNAME
            JOIN GTCOMPMAST CM ON  CM.GTCOMPMASTID=A.COMPCODE 
            left join  HRECONTACTDETAILS E on E.HREMPLOYMASTID=A.HREMPLOYMASTID
            WHERE   A.IDCARDNO IN (${String(Idcard)})  and CM.COMPCODE=:COMPCODE` 
            const result_or =await connection.execute(sql,{COMPCODE})  

            const transformedResult = result_or ?.rows?.map(row => {
                const keyValuePair = {};
                // Assuming the first row contains the column names
                result_or.metaData.forEach((col, index) => {
                  keyValuePair[col.name] = row[index];
                });
                return keyValuePair;
               });
       
           const result = Idcard ? await prisma_Connector.user.findUnique({where:{idCard:Idcard}})  : {}
            var data= transformedResult ? Object.assign(result,...transformedResult) : {}
        
        return res.json({ statusCode: 1, data })
     
    //    return res.json({ statusCode: 500, data:{},mesage:"Id Not Found" })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' });
    }
    
}



export async function get_Change_Settings(req, res) {
const compCode=String(req.headers?.compcode).toUpperCase()
const Idcard=req.query?.Idcard
    try {
       
        const result = Idcard ? await prisma_Connector.settings.findUnique({where:{userId:Idcard}})  : {}
        
        return res.json({ statusCode: 0, data:result })
      

    //    return res.json({ statusCode: 500, data:{},mesage:"Id Not Found" })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Internal Server Error' });
    }
    
}












