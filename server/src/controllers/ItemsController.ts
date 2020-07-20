import knex from '../database/connection'
import { Request, Response } from 'express'

class ItemsController {
    async index(request: Request, response: Response){
        const items = await knex('tb_items').select('*'); //Select no banco SELECT * FROM tb_items
        const serializedItems  = items.map( item => { // Percorre e reorganiza o que sera retornado
            return {
                id_item: item.id_item,
                title: item.title,
                imagem_url: `http://192.168.0.102:3333/uploads/${item.image}`,
            };
        } );
        response.send(serializedItems);
    };
};
export default ItemsController;