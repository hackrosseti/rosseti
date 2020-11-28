 const {Router} = require('express');
 const fs = require('fs');
 const path = require('path');
 import {db, wrapResponse, wrapAccess, handleDefault} from '../utils';
 import auth from '../middleware/auth.middleware';
 import access from './../access';
 const router = Router();
 const multer = require('multer');
 
 // /api/document/upload
 router.post(
     '/upload',
	wrapAccess(auth, access.document.upload),
	wrapResponse((request, response) => {
		const { projectId } = request.query;
        const projectDir = `uploads/${projectId}`;
		const storageConfig = multer.diskStorage({
			destination: (req, file, cb) => {
				cb(null, `uploads/${projectId}`);
			},
			filename: (req, file, cb) => {
				cb(null, file.originalname);
			}
        });
        const upload = multer({ storage: storageConfig }).single("file");

        if (!fs.existsSync(projectDir)){
			fs.mkdirSync(projectDir);
        }
        
		upload(request, response, error => {
			if (error) {
				return response.status(400).json({ message: 'Ошибка при загрузке файла' });
			}
	
			let filedata = request.file;
			if (!filedata) {
				return response.status(400).json({ message: 'Ошибка при загрузке файла' });
			}
		
			request.pool
                .query(db.queries.insert('project_documents', {
                    document_name: filedata.originalname,
                    document_link: `./uploads/${projectId}`,
                    project_id: projectId
                }))
                .then(db.getOne)
                .then(res => response.json({ document: res }))
                .catch(e => handleDefault(e, response));
		})
         
     })
 );
 
// /api/document/download
router.get(
    '/download',
    wrapAccess(auth, access.document.download),
    (request, response) => 
        request.pool
            .query(db.queries.select('project_documents', {
                doc_id: request.query.documentProjectId
            }))
            .then(db.getOne)
            .then(document => {
                const content = fs.readFileSync(path.resolve(
                    __dirname,
                    `../../uploads/${document.project_id}/${document.document_name}`),
                    'binary'
                );
				 
				return {result:  Buffer.from(content), document: document };
            })
            .then(data => response.json(data))
            .catch(e => handleDefault(e, response))
);

 // /api/document/getAllProjectDocument
 router.get(
     '/getAllProjectDocument',
     wrapAccess(auth, access.document.getAllProjectDocument),
     (request, response) => {
         request.pool
             .query(db.queries.select('project_documents', {
                 project_id: request.query.projectId
             }))
             .then(db.getAll)
             .then(res => response.json({ documents: res }))
             .catch(e => handleDefault(e, response));
     }
 )
 
 module.exports = router;
 
