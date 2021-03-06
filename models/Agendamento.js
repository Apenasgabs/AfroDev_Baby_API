const conexao = require('../infra/conexao');
const moment = require('moment');

class Agendamento {

    alterar(id, valores, resp) {
        const sql = 'UPDATE agendamentos SET ? WHERE id = ?'
        if (valores.data_servico) {
            valores.data_servico = moment(valores.data_servico).format('YYYY-MM-DD');
        }

        conexao.query(sql, [valores, id], (error, result) => {
            if (error) {
                resp.status(400).json(error)
            }
            resp.status(201).json({ ...valores, id })
        })
    }

    remover(id, resp) {
        const sql = `DELETE FROM agendamentos WHERE id = ?`

        conexao.query(sql, id, (error, results) => {
            if (error) {
                resp.status(400).json(error)
            }
            resp.status(201).json({
                mensagem: `Agendamento com ${id} removido com sucesso!`
            })
        });
    }

    buscaPorId(id, resp) {
        const sql = `SELECT * FROM agendamentos WHERE id = ?`
        conexao.query(sql, id, (error, results) => {
            if (error) {
                resp.status(400).json(error)
            }
            resp.status(201).json(results)
        });
    }

    listagem(resp) {
        const sql = 'SELECT * from agendamentos';

        conexao.query(sql, (error, results) => {
            if (error) {
                resp.status(400).json(error)
            }
            resp.status(200).json(results);
        });
    }

    inserir(agendamento, resp) {
        const sql = 'INSERT INTO agendamentos SET ?';

        const data_servico = moment(agendamento.data_servico).format('YYYY-MM-DD')
        const data_agendamento = moment().format('YYYY-MM-DD')
        const agendamentoComData = { ...agendamento, data_agendamento, data_servico }

        const isDataValida = moment(agendamento.data_servico).isSameOrAfter(agendamento.data_agendamento)
        const isNomeClienteValido = agendamento.nome_cliente.length >= 3

        const validacoes = [
            {
                nome: "data_servico",
                valido: isDataValida,
                mensagem: "Data do Agendamento deve ser igual ou superior a atual"
            },
            {
                nome: "nome_cliente",
                valido: isNomeClienteValido,
                mensagem: "O NOme do cliente deve ter pelo menos 3 caracteres"
            }
        ]

        const errors = validacoes.filter(campo => !campo.valido)

        if (errors.length > 0) {
            resp.status(400).json(errors)
        }

        conexao.query(sql, agendamentoComData, (error, results) => {
            if (error) {
                resp.status(400).json(error)
            }

            resp.status(201).json({
                ...agendamentoComData,
                id: results.insertId
            })
        })
    }

}

module.exports = new Agendamento;