import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
    path: './.env'
})
connectDB().then(() => {
    app.listen(8000, () => {
        console.log(`port at 8000`)
    })

}).catch((error) => {
    console.log(`index file ${error}`)
})
