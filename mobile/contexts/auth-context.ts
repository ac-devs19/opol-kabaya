import { Platform } from "react-native";
import { create } from "zustand";
import * as Application from "expo-application";
import axios from "@/api/axios";
import { setToken } from "@/services/auth-storage";

interface UserSession {
  device_id: string;
  required_password: number;
  is_biometric: number;
}

interface User {
  id: number;
  id_number: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  sex: string;
  marital_status: string;
  birth_date: string;
  religion: string;
  profile_picture: string;
  mobile_number: string;
  mobile_verified_at: string;
  email: string;
  email_verified_at: string;
  province: string;
  municipality: string;
  barangay: string;
  street_name: string;
  postal_code: string;
  user_verified_at: string;
  user_session: UserSession;
}

interface AuthStore {
  device_name: string;
  device_id: string;
  token_name: string;
  user: User | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  initDeviceId: () => Promise<void>;
  initialize: () => Promise<void>;
  getUser: () => Promise<void>;
  lock: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set, get) => ({
  device_name: `${Platform.OS}-${Platform.Version}`,
  device_id: "",
  token_name: "",
  user: null,
  loading: true,

  setLoading: (loading) => set({ loading }),

  initDeviceId: async () => {
    let id = "";

    if (Platform.OS === "android") {
      id = Application.getAndroidId();
    } else {
      id = (await Application.getIosIdForVendorAsync()) ?? "";
    }

    set({ device_id: id });
    set({ token_name: `${get().device_name}-${id}` });
  },

  initialize: async () => {
    await get().initDeviceId();
    await get().getUser();
  },

  getUser: async () => {
    try {
      const { data } = await axios.get("/user");
      set({ user: data });
    } catch (error: any) {
      console.log(error);
    } finally {
      set({ loading: false });
    }
  },

  lock: async () => {
    try {
      await axios.post("/lock", {
        device_id: get().device_id,
      });
      await get().getUser();
    } catch (error: any) {
      console.log(error);
    }
  },

  logout: async () => {
    try {
      await axios.post("/logout", {
        params: {
          device_id: get().device_id,
        },
      });
      await setToken(null);
      set({
        user: null,
      });
    } catch (error: any) {
      console.log(error);
    }
  },
}));
