function fieldToArray(field) {
  return field
    .split(",")
    .map(str => str.replace(/^\^|\^$/g, ""))
    .filter(Boolean);
}

export default function memberReducer(member) {
  const {
    id,
    email_address: email,
    email_type: emailType,
    status,
    interests,
    merge_fields: { FNAME, LNAME, FIDN, ROLE, EXCLUSION, IMCID }
  } = member;
  return {
    id,
    email,
    emailType,
    status,
    firstName: FNAME,
    lastName: LNAME,
    fidn: FIDN,
    roles: fieldToArray(ROLE),
    interests: Object.keys(interests).filter(key => interests[key]),
    exclusions: fieldToArray(EXCLUSION),
    recipientId: IMCID
  };
}
