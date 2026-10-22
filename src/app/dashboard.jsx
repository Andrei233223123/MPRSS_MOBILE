import { useEffect } from "react";
import { BackHandler } from "react-native";
import CustomerDashboard from "../screens/CustomerDashboard";
export default function Dashboard() {

  const backHandler = useCallback(()=>{
    return true;
  },[]);


  useEffect (()=>{
    const pressBack = BackHandler.addEventListener("hardwareBackPress", backHandler);

    return ()=> pressBack.remove();
  },[backHandler])

  return <CustomerDashboard />;
}