export function reject(message = "") {
  return Promise.reject(new Error(message));
}
