import Toast from "react-native-toast-message";
import { UserType } from "@/contextStore/AuthContext";

export const processLoginSuccess = async (
  user: UserType,
  loginFn: (user: UserType) => Promise<void>,
) => {
  await loginFn(user);

  Toast.show({
    type: "success",
    text1: "Welcome back!",
    text2: user.name,
  });
};
