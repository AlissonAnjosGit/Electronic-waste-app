import {Knex} from 'knex';

export async function up(knex:Knex ) {
    return knex.schema.createTable('categorias_pontos', table => {
        table.increments('id').primary();
        table.integer('ponto_id').notNullable().references('id').inTable('pontos');
        table.integer('categoria_id').notNullable().references('id').inTable('categorias');; 

    });
}

export async function down(knex:Knex) {
    return knex.schema.dropTable('categorias_pontos');
}