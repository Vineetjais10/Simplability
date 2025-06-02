const PHONE_REGEX = new RegExp(/^[6-9]\d{9}$/);
const EMAIL_REGEX = new RegExp(/^(?!.*\.\.)(?!.*\.$)(?!^\.)([a-zA-Z0-9._%+-]+)@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|info|io|[a-zA-Z]{2})$/);
const URL_REGEX = new RegExp(
  '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', // fragment locator
  'i'
);

module.exports = { PHONE_REGEX, EMAIL_REGEX, URL_REGEX };
