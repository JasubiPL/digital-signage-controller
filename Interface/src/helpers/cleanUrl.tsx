export const cleanUrl= ( url:string ) =>{
  const { pathname, search } = new URL(url)

  return pathname + search
}