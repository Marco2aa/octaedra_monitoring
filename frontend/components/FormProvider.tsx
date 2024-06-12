import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FormData {
  servername: string;
  protocol: string;
  url: string;
  method: string;
  isSwitchSSLOn: boolean;
  isSwitchDomainOn: boolean;
  chips: ChipData[];
  qualite: string;
  update: string;
  isIPV6: boolean;
  timeout: number;
  packet_size: number;
}

interface ChipData {
  label: string;
  color: string;
}

interface FormContextType {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error(
      "useFormContext doit être utilisé à l'intérieur de FormProvider"
    );
  }
  return context;
};

export const FormProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] = useState<FormData>({
    servername: "",
    protocol: "https://",
    url: "",
    method: "",
    isSwitchSSLOn: false,
    isSwitchDomainOn: false,
    chips: [],
    qualite: "",
    update: "",
    isIPV6: false,
    timeout: 1,
    packet_size: 64,
  });

  useEffect(() => {
    AsyncStorage.getItem("timeout").then((value) => {
      if (value) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          timeout: parseInt(value),
        }));
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("timeout", formData.timeout.toString());
  }, [formData.timeout]);

  const contextValue = { formData, setFormData };

  return (
    <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>
  );
};
