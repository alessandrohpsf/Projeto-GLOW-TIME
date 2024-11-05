// Função para verificar se o nome contém apenas letras
function validarNome(nome) {
    const regexNome = /^[A-Za-z\s]+$/; // Aceita apenas letras e espaços
    return regexNome.test(nome);
}

// Função para verificar se o e-mail tem um formato válido
function validarEmail(email) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Verifica o formato de e-mail básico
    return regexEmail.test(email);
}

// Função para verificar se o telefone contém apenas números
function validarTelefone(telefone) {
    const regexTelefone = /^(?:\(\d{2}\)\d{9}|\d{11}|\(\d{2}\)\d{5}-\d{4})$/;
    return regexTelefone.test(telefone);
}

// Inicializa o EmailJS com seu ID de usuário
emailjs.init("YgXGvFXBtAVSsBzZU"); // Substitua "YOUR_USER_ID" pelo seu ID da EmailJS



// Função para enviar e-mail de confirmação do agendamento
function enviarEmailAgendamento(agendamento) {
    emailjs.send("service_2i66yu7", "template_kczihfa", {
        nome: agendamento.nome,
        email: agendamento.email,
        telefone: agendamento.telefone,
        servico: agendamento.servico,
        data: agendamento.data,
        horario: agendamento.horario,
    }, "YgXGvFXBtAVSsBzZU")
    .then(function(response) {
        console.log("E-mail enviado com sucesso!", response.status, response.text);
        alert("Agendamento realizado e e-mail de confirmação enviado!");
    }, function(error) {
        console.error("Erro ao enviar o e-mail", error);
        alert("Erro ao enviar e-mail de confirmação.");
    });
}

// Função para carregar os agendamentos do LocalStorage

function carregarAgendamentos() {
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    const tabela = document.querySelector('#tabelaAgendamentos tbody');
    tabela.innerHTML = '';

    agendamentos.forEach((agendamento, index,) => {
        const row = tabela.insertRow();
        row.innerHTML = `
            <td>${agendamento.nome}</td>
            <td>${agendamento.email}</td>
            <td>${agendamento.telefone}</td>
            <td>${agendamento.servico}</td>
            <td>${agendamento.data}</td>
            <td>${agendamento.horario}</td>
            <td>
                <button onclick="deletarAgendamento(${index})">Excluir</button>
            </td>
        `;
    });
}

// Função para agendar um serviço (Create)
function agendarServico() {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const servico = document.getElementById('servico').value;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;

    // Verificar se todos os campos obrigatórios estão preenchidos
    if (!nome || !email || !telefone || !data || !horario) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Verificar se o nome contém apenas letras
    if (!validarNome(nome)) {
        alert('O nome deve conter apenas letras.');
        return;
    }

    // Verificar se o e-mail é válido
    if (!validarEmail(email)) {
        alert('Por favor, insira um e-mail válido.');
        return;
    }

    // Verificar se o telefone contém apenas números
    if (!validarTelefone(telefone)) {
        alert('O telefone deve conter apenas números.');
        return;
    }

    const agendamento = {
        nome,
        email,
        telefone,
        servico,
        data,
        horario
    };

    const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];
    agendamentos.push(agendamento);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));

    // Salvar data e horário no LocalStorage para tornar o horário indisponível
    const horariosIndisponiveis = JSON.parse(localStorage.getItem('horariosIndisponiveis')) || {};
    if (!horariosIndisponiveis[data]) {
        horariosIndisponiveis[data] = [];
    }
    horariosIndisponiveis[data].push(horario);
    localStorage.setItem('horariosIndisponiveis', JSON.stringify(horariosIndisponiveis));


   // Chama a função para enviar o e-mail de confirmação
    enviarEmailAgendamento(agendamento);
}

// Função para limpar o formulário após o agendamento
function limparFormulario() {
    document.getElementById('nome').value = '';
    document.getElementById('email').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('servico').value = 'Aroma Essence';
    document.getElementById('data').value = '';
    document.getElementById('horario').value = '';
}

// Função para editar um agendamento (Update)
function editarAgendamento(index) {
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos'));
    const agendamento = agendamentos[index];

    document.getElementById('nome').value = agendamento.nome;
    document.getElementById('email').value = agendamento.email;
    document.getElementById('telefone').value = agendamento.telefone;
    document.getElementById('servico').value = agendamento.servico;
    document.getElementById('data').value = agendamento.data;
    document.getElementById('horario').value = agendamento.horario;

    deletarAgendamento(index); // Remove o agendamento antigo para ser atualizado
}

// Função para deletar um agendamento (Delete)
function deletarAgendamento(index) {
    const agendamentos = JSON.parse(localStorage.getItem('agendamentos'));
    const agendamento = agendamentos[index];
    
    const horariosIndisponiveis = JSON.parse(localStorage.getItem('horariosIndisponiveis')) || {};
    const horarioIndex = horariosIndisponiveis[agendamento.data].indexOf(agendamento.horario);
    if (horarioIndex > -1) {
        horariosIndisponiveis[agendamento.data].splice(horarioIndex, 1);
        localStorage.setItem('horariosIndisponiveis', JSON.stringify(horariosIndisponiveis));
    }

    agendamentos.splice(index, 1);
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
    carregarAgendamentos();
}

// Função para desabilitar horários já agendados em uma data específica
function desabilitarHorarios(dataSelecionada) {
    const horariosIndisponiveis = JSON.parse(localStorage.getItem('horariosIndisponiveis')) || {};
    const horarioSelect = document.getElementById('horario');

    // Habilita todos os horários
    for (let i = 0; i < horarioSelect.options.length; i++) {
        horarioSelect.options[i].disabled = false;
    }

    // Desabilita horários indisponíveis para a data selecionada
    if (horariosIndisponiveis[dataSelecionada]) {
        horariosIndisponiveis[dataSelecionada].forEach(horario => {
            for (let i = 0; i < horarioSelect.options.length; i++) {
                if (horarioSelect.options[i].value === horario) {
                    horarioSelect.options[i].disabled = true;
                }
            }
        });
    }
}

// Evento para verificar e desabilitar horários quando a data for selecionada
document.getElementById('data').addEventListener('change', function() {
    const dataSelecionada = this.value;
    desabilitarHorarios(dataSelecionada);
});

// Carrega os agendamentos ao abrir a página  
carregarAgendamentos();
