import knex from '../database/connection';
import {Request, Response} from 'express';

class PontosController {

    async index(request:Request, response:Response){
        const {city, uf, categorias} = request.query;
        
        const parsedCategorias = String(categorias).split(',')
        .map(categoria => Number(categoria.trim()));

        const pontos = await knex('pontos')
        .join('categorias_pontos','pontos.id', '=', 'categorias_pontos.ponto_id')
        .whereIn('categorias_pontos.categoria_id', parsedCategorias)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('pontos.*');


        if(pontos.length==0){
            return response.status(400).json({message: 'Nenhum ponto foi encontrado'});
        }
        return response.json(pontos)
    }

    async show(request:Request, response:Response){
        const {id} = request.params;

        const ponto = await knex('pontos').where('id', id).first();

        if(!ponto){
            return response.status(400).json({message: 'Ponto nao encontrado'});
        }

        const serializedPoint = {
            ...ponto,
            image_url: `http://localhost:3333/uploads/imagensPontos/${ponto.image}`,
        };

        const categorias = await knex('categorias')
        .join('categorias_pontos','categorias.id','=','categorias_pontos.categoria_id')
        .where('categorias_pontos.ponto_id',id).select('categorias.title');



        return response.json({ponto: serializedPoint, categorias});
    }

    async create(request:Request, response:Response) {
        const {
            name, 
            email, 
            whatsapp,
            rua,
            numero, 
            latitude, 
            longitude, 
            city, 
            uf, 
            categorias
        } = request.body;
    
        const trx = await knex.transaction();

        const ponto = {
            image : request.file.filename,
            name, 
            email, 
            whatsapp,
            rua,
            numero, 
            latitude, 
            longitude, 
            city, 
            uf        
        }
        const insertedIds = await trx('pontos').insert(ponto);
    
        const ponto_id = insertedIds[0];
    
        const categoriasPontos = categorias.split(',')
        .map((categoria : string) => Number(categoria.trim()))
        .map((categoria_id:Number) => {
            return {
                categoria_id,
                ponto_id
            }
        })
    
        await trx('categorias_pontos').insert(categoriasPontos);
        await trx.commit();
     
        return response.json({
            id:ponto_id,
            ...ponto
        });
    }

}

export default PontosController;