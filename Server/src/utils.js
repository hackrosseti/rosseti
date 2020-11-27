const sql = require('yesql').pg;
var config = require('config');

export const getFromConfig = (query) => {
   if (config.has(query)) {
       return config.get(query);
   }

   throw new Error(`Error getting "${query}" from config`);
}

// WRAPPERS
export const wrapSql = (queryString, data) => sql(queryString)(data);
export const handleDefault = (error, response) => {
   if (error !== 'internal') {
      console.log(error);
      if (response) {
         response.status(500).json({ message: `Ошибка на сервере '${error.message}'`, error, stack: error.stack });
      }
   }
};
export const wrapResponse = (func) => {
   return (request, response, next) => {
      try {
         func(request, response, next);
      } catch (error) {
         return handleDefault(error, response);
      }
   }
};
export const wrapAccess = (func, accessArray) => {
   return (request, response, next) => {
      func(request, response, next, accessArray);
   };
};
export const getWhere = (data, tableAlias) => 
   data && typeof data === 'object' && Object.keys(data).length
      ? `WHERE ${Object.keys(data).map((key) => `${tableAlias ? `${tableAlias}.` : ''}${key} = :${key}`).join(' AND ')}`
      : '';

// DB HELPERS
export const db = {
   getOne: (result) => result.rows?.[0],
   getAll: (result) => result.rows,
   queries: {
      // SELECT
      select: (table, data, additionalSelect, joins, endQuery) => {
         const queryString = `SELECT t.* ${additionalSelect ? ', ' : ''}${additionalSelect}
                              FROM ${table} as t ${joins} ${getWhere(data, 't')} ${endQuery}`;
         return wrapSql(queryString, data);
      },
      // INSERT
      insert: (table, data) => {
         const queryString = `INSERT INTO ${table} as t (${Object.keys(data).join(', ')}) VALUES (${
            Object.keys(data).map((key) => `:${key}`).join(', ')
         }) RETURNING *`;
         return wrapSql(queryString, data);
      },
      // UPDATE
      update: (table, data, whereData) => {
         const queryString = `UPDATE ${table} SET ${
            Object.keys(data).map((key) => `${key} = :${key}`).join(', ')
         } ${getWhere(whereData)} RETURNING *`;
         const wrapData = {...data, ...whereData};
         console.log(queryString);
         console.log(wrapData);
         return wrapSql(queryString, wrapData);
      },
      // DELETE
      delete: (table, data) => {
         const queryString = `DELETE FROM ${table} ${getWhere(data, 't')}`;
         return wrapSql(queryString, data);
      },

      // API
      user: {
         getAllUsers: () => sql(`
            SELECT   user_id, login, role, password, firstname,
                     lastname, surname, company,
                     department, "position", r.region_name
            FROM users as u
            LEFT JOIN regions as r on r.region_id = u.region_id
         `)({}),
         
         setDocuments: (user_id) => sql(`
            UPDATE users as u
            SET document = to_tsvector(firstname || '. ' || lastname || '. ' || surname || '. ' || company || '. ' || department || '. ' || position) ${getWhere(user_id, 'u')}
         `)(user_id)
      },
      project: {
         setDocuments: (project_id) => sql(`
            UPDATE project as p
            SET document = to_tsvector(project_name || '. ' || project_describe) ${getWhere(project_id, 'p')}
         `)(project_id)
      }
   }
};