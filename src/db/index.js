import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

// * The database is on another continent, so use Asyn.
// *When you try to talk with the database, you will find problems, so put in try catch

const connectDB = async () => {
    try {
           const connectionInstance =  await mongoose.connect(`${process.env.MONGO_URL}/{${DB_NAME}}`)
                console.log(`connected ${connectionInstance.connection.host}`)
            } catch (error) {
                console.log("mogoDB found this error on DB file ",error)
                process.exit(1);
            }
}

export default connectDB


