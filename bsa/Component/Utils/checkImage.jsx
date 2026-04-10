import { Alert } from "react-native";

export async function isImageUrl(url) {
 const image=await fetch(url)
//  Alert?.alert("",JSON.stringify(image.text))
  return /\.(jpeg|jpg|gif|png|webp|svg|bmp)$/i.test(url);
}