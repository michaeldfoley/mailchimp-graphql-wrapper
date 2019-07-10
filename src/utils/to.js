export default function to(promise) {
  return Promise.resolve(promise)
    .then(data => {
      return [null, data];
    })
    .catch(err => [err]);
}
