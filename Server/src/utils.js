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
   console.log(error, error.stack);
   if (response) {
      response.status(500).json({ message: 'Что-то пошло не так, попробуйте снова', error, stack: error.stack });
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
      ? `WHERE ${Object.keys(data).map((key) => `${tableAlias}.${key} = :${key}`).join(' AND ')}`
      : '';

// DB HELPERS
export const db = {
   getOne: (result) => result.rows?.[0],
   getAll: (result) => result.rows,
   queries: {
      // SELECT
      select: (table, data) => {
         const queryString = `SELECT t.* FROM ${table} as t ${getWhere(data, 't')}`;
         return wrapSql(queryString, data);
      },
      // INSERT
      insert: (table, data) => {
         const queryString = `INSERT INTO ${table} as t (${Object.keys(data).join(', ')}) VALUES (${
            Object.keys(data).map((key) => `:${key}`).join(', ')
         }) RETURNING t.*`;
         return wrapSql(queryString, data);
      },
      // UPDATE
      update: (table, data, whereData) => {
         const queryString = `UPDATE ${table} as t SET ${
            Object.keys(data).map((key) => `t.${key} = :${key}`).join(', ')
         } ${getWhere(whereData, 't')} RETURNING t.*`;
         return wrapSql(queryString, {...data, ...whereData});
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
            UPDATE users
            SET document = to_tsvector(firstname || '. ' || lastname || '. ' || surname || '. ' || company || '. ' || department || '. ' || position) WHERE user_id = :user_id
         `)({ user_id: user_id })
      }
   }
};