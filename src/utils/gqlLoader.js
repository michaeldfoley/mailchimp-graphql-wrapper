import fs from "fs";
import path from "path";
import { gql } from "apollo-server";

const loadGQLFile = type => {
  const filePath = path.join(__dirname, "../api", type);
  return fs.readFileSync(filePath, "utf-8");
};

export default loadGQLFile;
