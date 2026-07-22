import { create } from "zustand";

interface Resident {
  id: number | null;
  first_name: string;
  suffix?: string;
  middle_name?: string;
  last_name: string;
  email?: string;
}

const initialResident: Resident = {
  id: null,
  first_name: "",
  suffix: "",
  middle_name: "",
  last_name: "",
  email: "",
};

interface Store {
  resident: Resident;
  setResident: (resident?: Partial<Resident>) => void;
  email: string;
  setEmail: (email?: string) => void;
  isRegister: boolean;
  setIsRegister: (isRegister: boolean) => void;
  isForgot: boolean;
  setIsForgot: (isForgot: boolean) => void;
}

export const useStore = create<Store>((set) => ({
  resident: initialResident,
  setResident: (resident = {}) =>
    set({
      resident: {
        ...initialResident,
        ...resident,
      },
    }),
  email: "",
  setEmail: (email) => set({ email }),
  isRegister: false,
  setIsRegister: (isRegister) => set({ isRegister }),
  isForgot: false,
  setIsForgot: (isForgot) => set({ isForgot }),
}));
