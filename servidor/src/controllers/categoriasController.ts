import knex from '../database/connection';
import {Request, Response} from 'express';


class categoriasController { 

    async index(request:Request, response:Response) { //retorna uma lista com as categorias
        const categorias = await knex('categorias').select('*');
    
        const serializedCategorias = categorias.map( categoria =>{
            return {
                id: categoria.id,
                name: categoria.title,
                image_url: `http://localhost:3333/uploads/${categoria.image}`,
            };
        });
    
        return response.json(serializedCategorias);
    }
}

export default categoriasController;