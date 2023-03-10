import multer, { diskStorage } from 'multer';
import path from 'path';
import crypto from 'crypto';

export default{
    storage: multer.diskStorage({
        destination: path.resolve(__dirname, '..', '..', 'uploads','imagensPontos'),
        filename(request, file, callback){
            const hash = crypto.randomBytes(6).toString('hex');
            const fileName = `${hash}-${file.originalname}`;
            callback(null, fileName)
        }
    })
};