import { Router } from 'express';

import { 
    get, 
    getActualVsBudget, 
    getActualVsBudgetValueMonthWise, 
    getAllEmployees_By_GENDER_BY_DEPARTMENT, 
    getBuyerWiseRevenue, 
    getCateogryToTSalary, 
    getCurrentMonthLeaves, 
    getDepData, 
    getDepWise_gender_attence, 
    getEachOverTimeWages, 
    getESI, 
    getFilterEmployees, 
    getGenderCount, 
    getInOut, 
    getInsuranceData, 
    getInsuranceData_Alert, 
    getLastMonthSalary, 
    getMonthESIPF, 
    getMoreDetails, 
    getOverTime, 
    getOverTimeWages, 
    getPayslip, 
    getShortShipmentRatio, 
    getTotalHeadCount, 
    getTotalPA, 
    getTotalStrength, 
    getUserMobData, 
    getYearlyComp, 
    getYearWiseToTSalary, 
    ToTexpenses,
    getESIPF,
    executeProcedure, 
    getOrdersInHand,
    getEmployeesDetail,
    getSalarydet,  
    getOrdersInHandMonthWise, 
    getpfdet,
    getesidet,
    getattdet,
    getagedet,
    getexpdet,
    getbgdet,
    getEmployeesDetail1,
    getPfDataDet,
    getEsiDataDet,
    getESIPF1,
    getattdetTable,
    getretdetTable,
    getLeaveAvailable,
    getlongAbsent,
    getFullPrasent,
    getPayPeriod,
    getFinYear,
    getEmployeeHeadCount,
    getHeadDetail,
    getESIlastmonth,
    getPFlastmonth,
    getregionCount,
    getOTwagesdet,
    getSalaryAgewise,
    getAgewiseESI,
    getLastSalarydet,
    getSalarydet1,
    getnewjoin,
    getStateWiseHeadCount
} from '../services/misDashboard.service.js';

const router = Router();

router.get('/', get);

// Original Routes
router.get('/getInsuranceData', getInsuranceData);
router.get('/getInsuranceDataAlert', getInsuranceData_Alert);
router.get('/getTotalStrength', getTotalStrength);
router.get('/getYearWiseToTSalary', getYearWiseToTSalary);
router.get("/getLastMonthSalary", getLastMonthSalary);
router.get("/getCurrentMonthLeaves", getCurrentMonthLeaves);
router.get("/getTotalHeadCount", getTotalHeadCount);
router.get("/getCateogryToTSalary", getCateogryToTSalary);
router.get("/ToTexpenses", ToTexpenses);
router.get("/getMonthESIPF", getMonthESIPF);
router?.get("/getOverTime", getOverTime);
router?.get("/getMoreDetails", getMoreDetails);
router?.get("/getESI", getESI);
router?.get("/getOverTimeWages", getOverTimeWages);
router?.get("/getEachOverTimeWages", getEachOverTimeWages);
router?.get("/getUserMobData", getUserMobData);
router?.get("/getInOut", getInOut);
router?.get("/getgendercount", getGenderCount);
router?.get("/getTotalPA", getTotalPA);
router.get("/getFilterEmployees", getFilterEmployees);
router.get("/getDepData", getDepData);
router?.get("/getDepWise_gender_attence", getDepWise_gender_attence);
router?.get("/getAllEmployees_By_GENDER_BY_DEPARTMENT", getAllEmployees_By_GENDER_BY_DEPARTMENT);
router.get("/getPayslip", getPayslip);

// New Routes from User Request
router.get('/ordersInHand', getOrdersInHand);
router.get('/employeeDet', getEmployeesDetail);
router.get('/employeeDetail', getEmployeesDetail1);
router.get('/otwagesdet', getOTwagesdet);
router.get('/salaryDet', getSalarydet);
router.get('/salaryDet1', getSalarydet1);
router.get('/lastsalaryDet', getLastSalarydet);
router.get('/pfDet', getpfdet);
router.get('/esiDet', getesidet);
router.get('/AttDet', getattdet);
router.get('/getNewjoin', getnewjoin);
router.get('/AttDetTable', getattdetTable);
router.get('/RetDetTable', getretdetTable);
router.get('/HeadDetail', getHeadDetail);
router.get('/AgeDet', getagedet);
router.get('/ExpDet', getexpdet);
router.get('/BgDet', getbgdet);
router.get('/PfDataDet', getPfDataDet);
router.get('/EsiDataDet', getEsiDataDet);
router.get('/leaveAvailable', getLeaveAvailable);
router.get('/headCount', getEmployeeHeadCount);
router.get("/LongAbsent", getlongAbsent);
router.get('/FullPrasent', getFullPrasent);
router.get('/PayPeriod', getPayPeriod);
router.get('/finYear', getFinYear);
router.get('/salaryAgewise', getSalaryAgewise);
router.get('/agewiseesi', getAgewiseESI);
router.get('/ordersInHandMonthWise', getOrdersInHandMonthWise);
router.get('/actualVsBudgetValueMonthWise', getActualVsBudgetValueMonthWise);
router.get('/yearlyComp', getYearlyComp);
router.get('/getregionCount', getregionCount);
router.get('/buyerWiseRev', getBuyerWiseRevenue);
router.get('/actualVsBudget', getActualVsBudget);
router.get('/shortShipment', getShortShipmentRatio);
router.get('/getESIPF', getESIPF);
router.get('/getESIPF1', getESIPF1);
router.get('/getEsilastmonth', getESIlastmonth);
router.get('/getPFlastmonth', getPFlastmonth);
router.put('/execute-procedure', executeProcedure);
router.get('/stateWiseHeadCount', getStateWiseHeadCount);

export default router;