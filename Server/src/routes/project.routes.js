const {Router} = require('express');
import {db, wrapResponse, wrapAccess, handleDefault} from '../utils';
import auth from '../middleware/auth.middleware';
import access from './../access';
const router = Router();
const docx = require("docx")
/********************************** КЛАССИФИКАТОР *************************************/

// /api/project/getAllProjectClassificators
router.get(
    '/getAllProjectClassificators',
    wrapAccess(auth, access.project.getAllProjectClassificators),
    (request, response) =>
      request.pool
         .query(db.queries.select('project_classificator'))
         .then(db.getAll)
         .then((result) => response.json({ classificators: result }))
         .catch((e) => handleDefault(e, response))
);

/********************************* ПРОЕКТЫ *****************************************/

// /api/project/getAllProjects
router.get(
   '/getAllProjects',
   wrapAccess(auth, access.project.getAllProjects),
   (request, response) =>
      request.pool
         .query(db.queries.select('project', {},
         `
            COUNT(l.like_id)::int as likes_сount,
            MIN(ph.change_date) as date_create,
            u.profile_image as author_image,
            u.firstname as author_firstname,
            u.surname as author_surname,
            (SELECT pc.class_name FROM project_classificator as pc WHERE pc.class_id = t.project_class) as classificator
         `,
         `
            LEFT JOIN likes as l ON l.project_id = t.project_id
            LEFT JOIN project_history as ph ON ph.project_id = t.project_id
            LEFT JOIN users as u ON u.user_id = t.author
         `,
         `
            GROUP BY t.project_id, u.profile_image, u.firstname, u.surname
            ORDER BY date_create DESC
         `))
         .then(db.getAll)
         .then((result) => response.json({ projects: result }))
         .catch((e) => handleDefault(e, response))
);

// /api/project/addProject
router.post(
   '/addProject',
   wrapAccess(auth, access.project.addProject),
   wrapResponse((request, response) => {
      var project = null;
      const {
         project_name, project_describe, project_status, project_class, author, conference_link,
         region_id, project_offer, project_profit, date_end, image
      } = request.body;

      const checkProjectDoesNotExist = (project) => {
         if (project) {
            response.status(400).json({ message: "Проект с таким названием уже существует" });
            throw 'internal';
         }
      };

      request.pool.connect()
         .then(client => {
            return client
               .query(db.queries.select('project', { project_name }))
               .then(db.getOne)
               .then(checkProjectDoesNotExist)

               .then(() => client.query(db.queries.insert('project', {
                  project_name, project_describe, project_status, project_class, author, conference_link,
                  region_id, project_offer, project_profit, date_end, image
               })))
               .then(db.getOne)
               .then((res) => {
                  project = res;
               })

               .then(() => client.query(db.queries.project.setDocuments({ project_id: project.project_id })))
               .then(() => client.release())
               .then(() => response.status(201).json({ message: "Проект создан", projectId: project.project_id }))
               .catch(e => {
                  client.release();
                  handleDefault(e, response);
               })
         });
   })
);

// /api/project/updateProject
router.post(
   '/updateProject',
   wrapAccess(auth, access.project.updateProject),
   wrapResponse((request, response) => {
      var project = null;
      const {
         project_id, project_name, project_describe, project_status, project_class, author,
         conference_link, region_id, project_offer, project_profit, date_end, image
      } = request.body;

      if (!project_id) {
         return response.status(400).json({ message: 'Не задан ID проекта для модификации' });
      }

      request.pool.connect()
         .then(client => {
            return client
               .query(db.queries.update('project', {
                  project_name, project_describe, project_status, project_class, author, conference_link,
                  region_id, project_offer, project_profit, date_end, image
               }, { project_id: project_id }))
               .then(db.getOne)
               .then(res => {
                  console.log(res);
                  if (res) {
                     project = res;
                     return client.query(db.queries.project.setDocuments({ project_id: res.project_id }))
                  } else {
                     handleDefault(new Error('Не удалось изменить данные по проекту'), response);
                  }
               })
               .then(() => client.release())
               .then(() => response.json({ projectId: project.project_id }))
               .catch(e => {
                  client.release();
                  handleDefault(e, response);
               })
         });
   })
);

// /api/project/getProjectByProjectId
router.get(
   '/getProjectByProjectId',
   wrapAccess(auth, access.project.getProjectByProjectId),
   wrapResponse((request, response) => {
      var project = null;
      var comments = null;
      var likes = null;
      const { projectId } = request.query;

      request.pool.connect()
         .then(client => {
            return client
               .query(db.queries.select('project', { project_id: projectId },
               `
                  pc.class_name,
                  u.firstname, u.surname
               `,
               `
                  LEFT JOIN project_classificator as pc ON pc.class_id = t.project_class
                  LEFT JOIN users as u ON u.user_id = t.author
               `,
               `
                  GROUP BY t.project_id, pc.class_name, u.firstname, u.surname
               `)).then(db.getOne).then(res => { project = res; })
               .then(() =>
                  client.query(db.queries.select('project_comments', { project: projectId },
                  `
                     u.lastname, u.firstname, u.profile_image
                  `,
                  `
                     LEFT JOIN users as u ON u.user_id = t.user
                  `
                  )).then(db.getAll).then(res => { comments = res; })
               )
               .then(() =>
                  client.query(db.queries.select('likes', { project_id: projectId }))
                  .then(db.getAll)
                  .then(res => { likes = res; })
               )
               .then(() => client.release())
               .then(() => response.json({
                  project: project,
                  likes: likes,
                  comments: comments

               }))
               .catch(e => {
                  client.release();
                  handleDefault(e, response);
               })
         });
   })
);
 
// /api/project/getByField
router.get(
   '/getByField',
   // wrapAccess(auth, access.project.getByField),
   (request, response) =>
      request.pool
         .query(db.queries.select('project', { [Object.keys(request.query)[0]]: Object.values(request.query)[0] }))
         .then(db.getAll)
         .then(res => response.json({ projects: res }))
         .catch((e) => handleDefault(e, response))
)

 
 
var PizZip = require('pizzip');
var Docxtemplater = require('docxtemplater');

var fs = require('fs');
var path = require('path');
 
// /api/project/generateReportByProjectId
router.get(
   '/generateReportByProjectId',
   wrapAccess(auth, access.project.generateReportByProjectId),
   wrapResponse((request, response) => {
      const { projectId } = request.query;

      request.pool
         .query(db.queries.select('project', { project_id: projectId })).then(db.getOne)
         .then(project => {
			try{
				var content = fs.readFileSync(path.resolve(__dirname, '../../template/template.docx'), 'binary');
				var zip = new PizZip(content);
				var doc = new Docxtemplater(zip);

				doc.setData({
					project_name: project.project_name,
					project_describe: project.project_describe
				});
				
				try {
					doc.render();
				} catch (error) {
					//console.log('err',error)
					return response.status(400).json({ message: error });
				}
				console.log(doc)
				try{
					var buf = doc.getZip().generate({type: 'nodebuffer'});
					//fs.writeFileSync(path.resolve(__dirname, 'output.docx'), buf);
					return response.json({buf})
				} catch(ex){
					//console.log(ex)
					return response.status(400).json({ message: ex });
				}
			
			} catch(ex){
				return response.status(400).json({ message: ex });
			}
         })
         .catch((e) => handleDefault(e, response))
   })
);
 

module.exports = router;