

function Random_Otp() {
 var OTp=(Math.floor(100000 + Math.random() * 900000)).toString()
 return OTp
}

export default Random_Otp