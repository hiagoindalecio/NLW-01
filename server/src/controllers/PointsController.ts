import knex from '../database/connection'
import { Request, Response } from 'express'

class PointsController {
    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;
        const parsedItems = String(items).split(',')
            .map(item => Number(item.trim())); //transformando items em um array/ .trim() tira espacos da direita e da esquerda
        const allItems = (parsedItems[0] ? parsedItems : [String(-1)]);
        console.log(`Items: ${allItems}`);
        const points = await knex('tb_points')
            .join('point_itens', 'tb_points.id_point', 'point_itens.point_id')
            .whereIn('point_itens.item_id', allItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('tb_points.*');
        const serializedPoints  = points.map( point => { // Percorre e reorganiza o que sera retornado
            return {
                ...point,
                imagem_url: `http://192.168.0.106:3333/uploads/${point.image}`,
            };
        } );
        return response.json(serializedPoints);
    }

    async show(request: Request, response: Response) {
        const { id } = request.params; // O mesmo que const id = request.params.id (a variavel tem o mesmo nome)
        const trx = await knex.transaction();
        const point = await trx ('tb_points').where('id_point', id).first(); //.first pega o primeiro retorno 
        if(!point) {
            return response.status(400).json({ mensagem: 'Point not found.' }) //status 400 geralmente se liga a um erro do usuario
        }
        /**
         * SELECT * FROM tb_items 
         *   JOIN point_items ON tb_items.id_item = pointt_itens.item_id
         *  WHERE point_items.point_id = id
         */
        const items = await trx ('tb_items')
            .join('point_itens', 'tb_items.id_item', '=', 'point_itens.item_id')
            .where('point_itens.point_id', id)
            .select('tb_items.title');
        const serializedPoint  = {
                ...point,
                imagem_url: `http://192.168.0.106:3333/uploads/${point.image}`,
        };
        return response.json({
            point: serializedPoint,
            items
        });
    }
    async create(request: Request, response: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;
    
        const trx = await knex.transaction();//aguarda todas as translacoes para que nada ocorra em caso de erro em uma delas
        // utilizando o transaction, se a segunda requisicao falhar a primaira nao vai executar
        const point = {
            email,
            name,// o mesmo que escrever name: name(nome da variavel igual o da prorpiedade pode ser emitido
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            image: request.file.filename
        }
        const insertedId = await trx('tb_points').insert(point);
        const point_id = insertedId[0];
        const pointItems = items
            .split(',') // transforma em um array quebrando na virgula
            .map((item: string) => Number(item.trim())) // converte tudo pra numero
            .map((item_id: number) => { // retorna um obj contendo item_id e ponto_id
            return {
                item_id,
                point_id
            }
        });
        await trx('point_itens').insert(pointItems);
        await trx.commit();
        return response.json({ 
            id: point_id,
            ...point //...point retorna todos os dados de point
         });
    };
};

export default PointsController;