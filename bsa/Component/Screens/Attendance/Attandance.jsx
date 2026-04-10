import { Text, View } from "react-native";
import AttendanceList from "./AttendanceList";
import { useGetEmployeeidsQuery } from "../../../redux/service/user";

function Attandance() {

    const { data: employee, refetch: employeecoderef } = useGetEmployeeidsQuery()

    return (

        <View>

            <Text>Attendance</Text>
            <AttendanceList 
                data={employee?.data} 
                onRefresh={employeecoderef}
            />
        </View>
    )
    
}


export default Attandance