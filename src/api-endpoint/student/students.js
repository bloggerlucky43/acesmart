import api from "../../libs/axios";
import { toaster } from "../../components/ui/toaster";

export const addStudent = async (form) => {
  try {
    const response = await api.post("/student",form,{withCredentials:true});

    const data=response.data;

    console.log(data);
    if(!data.success){
      toaster.create({
        title:data.message,
        type:"error",
      })
    }

    return data;
  } catch (error) {
console.error("Add student failed:",error)
  }
};
