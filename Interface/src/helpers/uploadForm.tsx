import axios from "axios";

type Categories = {
  categories: string,
  company: string
}

export const uploadForm = async ( file: File | null, category: Categories) => {
  const { categories, company } = category

  const formData = new FormData();
  //formData.append("category", fileData.categories);
  if (file) {
    formData.append("document", file);
  }

  try {
    const res = await axios.post(`http://localhost:7000/api/save-${categories}?company=${company}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Respuesta del servidor:", res.data);
    return await {status: res.status, message: res.data.message }
  } catch (error) {
    console.error("Error al enviar el formulario:", error);
    return await {status: 400, err: "Error al cargar el archivo, intentelo mas tarde"  }
  }

};
