import { Stack } from "expo-router";
import { useCallback, useEffect } from "react";
import { BackHandler } from "react-native";

export default function Layout() {

  const preventBackHandler = useCallback(() => {
    return true;
  },[])
  

  useEffect(()=>{
    const handler = BackHandler.addEventListener("hardwareBackPress", preventBackHandler);

    return ()=> handler.remove();
  },[preventBackHandler]);

  return (
  
    <Stack
      screenOptions={{
        headerShown: false,
        
      }}
    />
  );
}