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
		 
		const storageConfig = multer.diskStorage({
			destination: (req, file, cb) =>{
				console.log(file);
				cb(null, `uploads`);
			},
			filename: (req, file, cb) =>{
				console.log(file);
				cb(null, file.originalname?file.originalname:'file.doc');
			}
		});
		console.log("2")
		const upload = multer({storage:storageConfig}).single("file");
		console.log("3",upload)
		upload(request, response, function(e){
			//console.log("4",request)
			if(e){
				console.log(e)
				return response.status(400).json({ message: 'Ошибка при загрузке файла' });
			}
			console.log("5")
			const { projectId } = request.query;
			//console.log(request)
			let filedata = request.file;
			console.log(filedata)
			if (!filedata) {
				return response.status(400).json({ message: 'Ошибка при загрузке файла' });
			}
	
			request.pool
				.query(db.queries.insert('project_documents'), {
					document_name: filedata.originalname,
					document_link: `./uploads`,
					project_id: projectId
				})
				.then(db.getOne)
				.then(res => response.json({ document: res }))
				.catch(e => handleDefault(e, response));
		},function(e){ console.log(e)})
        
    })
);

// /api/document/download
router.post(
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
                    `./uploads/${document.project_id}/${document.document_link}${document.document_name}`),
                    'binary'
                );
				return Buffer.from(content);
            })
            .then(data => repsponse.json({ data }))
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