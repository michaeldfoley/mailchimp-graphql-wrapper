import dotenv from "dotenv";
import MailchimpAPI from "./mailchimp";
dotenv.config();

const { API_KEY, LIST_ID } = process.env;

const dataSources = () => ({
  mailchimpAPI: new MailchimpAPI(API_KEY, LIST_ID)
});

export default dataSources;
