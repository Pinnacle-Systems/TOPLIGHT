import moment from "moment"
export function AddMonth(inc) {

    const moment_current=moment()
    moment_current.add(inc,"months")

    return moment_current?.format("DD/MM/YYYY")
    
}