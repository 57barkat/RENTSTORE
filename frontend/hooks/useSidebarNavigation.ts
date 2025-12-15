import { useSidebar } from "@/contextStore/SidebarContext";
import { useNavigation } from "@react-navigation/native";

export const useSidebarNavigation = () => {
  const { close } = useSidebar();
  const navigation = useNavigation<any>();

  const handleNavigate = (screen: string) => {
    console.log("Navigate to:", screen);
    navigation.navigate(screen);
    close();
  };

  const handleLogout = () => {
    console.log("Logout pressed");
    close();
  };

  return { handleNavigate, handleLogout };
};
