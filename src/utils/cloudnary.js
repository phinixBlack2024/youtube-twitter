import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name: 'duo18mey1',
    api_key: '415151894557394',
    api_secret: '8VEsHQ0eaP9Rb0U04BNjCG4v2H4'
});

const uploadOnCloud = async (localFilePath) => {
    try {
        if (!localFilePath) return false
        const uploadResponse = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log(`success upload colud ${uploadResponse.url}`)
        return uploadResponse;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return false
    }
}
export default uploadOnCloud