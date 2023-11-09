export const timeout = (delay: number) => {
  return new Promise( res => setTimeout(res, delay) );
}