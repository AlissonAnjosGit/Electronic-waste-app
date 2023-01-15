import {Knex} from 'knex';

export async function seed(knex:Knex) {
    await knex('categorias').insert([
        {title: 'Grandes Equipamentos', image: 'grandesEquipamentos.svg'},
        {title: 'Pequenos Equipamentos', image: 'pequenosEquipamentos.svg'},
        {title: 'Informática e Telefonia', image: 'informaticaEtelefonia.svg'},
        {title: 'Pilhas e Baterias', image: 'pilhasEbaterias.svg'},
    ])
}