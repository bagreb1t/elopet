import express from 'express';
import cors from 'cors';
import fs from 'fs';
import fileUpload from 'express-fileupload';
import { PDFDocument, rgb } from 'pdf-lib';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(express.static('.'));

// escolhe automaticamente o arquivo de dados disponível
const CAMINHO_DADOS = fs.existsSync('./dados_tratados.json')
  ? './dados_tratados.json'
  : './dados_treatments.json';

// rota teste
app.get('/', (req, res) => {
  res.send('Servidor EloPet funcionando!');
});

// upload do CSV
app.post('/api/upload', (req, res) => {
  try {
    if (!req.files || !req.files.planilha) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const planilha = req.files.planilha;

    planilha.mv('./pets.csv', (err) => {
      if (err) {
        console.error('Erro ao salvar arquivo:', err);
        return res.status(500).json({ error: 'Erro ao salvar o arquivo.' });
      }

      res.json({ message: 'Planilha enviada com sucesso! Agora rode o preparar_dados.py.' });
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno no upload.' });
  }
});


app.get('/api/download-modelo', (req, res) => {
  try {
    const cabecalho = "nome,porte,energia,espaco_necessario,temperamento,vacinado,idade_estimada\n";
    
    // Instruções alinhadas diretamente abaixo de cada coluna correspondente
    const linhaOpcoes = "OPÇÕES ACEITAS:,Pequeno | Médio | Grande,1 a 5 (1=Calmo / 5=Agitado),Apartamento | Quintal pequeno | Quintal grande,Brincalhão | Dócil | Sociável | Agitado | Protetor | Calmo,Sim | Não,Apenas números (Ex: 2)\n";
    
    // Exemplo de preenchimento real para servir de modelo
    const exemplo = "Rex,Grande,5,Quintal grande,Agitado,Sim,3\n";

    // Unindo todo o conteúdo
    const csvContent = cabecalho + linhaOpcoes + exemplo;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=modelo_animais_elopet.csv');
    
    // Utf-8 BOM (\uFEFF) garante que o Excel abra as acentuações e vírgulas corretamente
    res.status(200).send(Buffer.from('\uFEFF' + csvContent, 'utf-8'));
  } catch (error) {
    console.error('Erro ao disponibilizar modelo CSV:', error);
    res.status(500).json({ error: 'Erro interno ao gerar o arquivo modelo.' });
  }
});

// rota de matchmaking
app.get('/api/match', (req, res) => {
  try {
    const { porte, energia, espaco, temperamento } = req.query;

    console.log('Filtros recebidos:', { porte, energia, espaco, temperamento });

    if (!porte || !energia || !espaco || !temperamento) {
      return res.status(400).json({ error: 'Filtros incompletos.' });
    }

    if (!fs.existsSync(CAMINHO_DADOS)) {
      console.log('Arquivo de dados não encontrado:', CAMINHO_DADOS);
      return res.status(500).json({ error: 'Base de dados não processada.' });
    }

    const animais = JSON.parse(fs.readFileSync(CAMINHO_DADOS, 'utf-8'));

    const resultado = animais.filter(pet =>
      String(pet.porte).toLowerCase() === String(porte).toLowerCase() &&
      parseInt(pet.energia) === parseInt(energia) &&
      String(pet.espaco_necessario).toLowerCase() === String(espaco).toLowerCase() &&
      String(pet.temperamento).toLowerCase() === String(temperamento).toLowerCase()
    );

    console.log(`Pets encontrados: ${resultado.length}`);
    res.json(resultado);
  } catch (error) {
    console.error('Erro na rota /api/match:', error);
    res.status(500).json({ error: 'Erro interno ao buscar pets.' });
  }
});

// gerar certificado PDF
app.post('/api/adotar', async (req, res) => {
  try {
    const { adotante, adotanteCpf, petNome, petIdade } = req.body;

    if (!adotante || !adotanteCpf || !petNome || !petIdade) {
      return res.status(400).json({ error: 'Dados incompletos para gerar certificado.' });
    }

    const codigo = 'ELO-' + Math.random().toString(36).substring(2, 11).toUpperCase();

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);

    page.drawRectangle({
      x: 20,
      y: 20,
      width: 560,
      height: 360,
      borderColor: rgb(0.13, 0.5, 0.27),
      borderWidth: 4
    });

    page.drawText('CERTIFICADO DE ADOÇÃO RESPONSÁVEL', {
      x: 100,
      y: 340,
      size: 20,
      color: rgb(0.1, 0.5, 0.3)
    });

    page.drawText('ELOPET - A plataforma digital que conecta você ao seu novo melhor amigo', {
      x: 130,
      y: 320,
      size: 10,
      color: rgb(0.4, 0.4, 0.4)
    });

    const dataHoje = new Date().toLocaleDateString('pt-BR');
    const sufixoIdade = parseInt(petIdade) === 1 ? 'ano' : 'anos';

    const texto =
      `Certificamos que ${adotante}, inscrito(a) sob o CPF nº ${adotanteCpf}, ` +
      `realizou a adoção responsável do pet ${petNome}, com idade estimada em ${petIdade} ${sufixoIdade}.`;
      const texto2 =
      `Este certificado deverá ser apresentado na instituição parceira para a conclusão e assinatura do termo final de adoção.`;

    page.drawText(texto, {
      x: 50,
      y: 240,
      size: 12,
      color: rgb(0.15, 0.15, 0.15),
      maxWidth: 500,
      lineHeight: 18
    });
    page.drawText(texto2, {
      x: 50,
      y: 190,
      size: 9,
      color: rgb(0.15, 0.15, 0.15),
      maxWidth: 500,
      lineHeight: 18
    });

    page.drawText(`Curitiba - PR, ${dataHoje}.`, {
      x: 50,
      y: 140,
      size: 12,
      color: rgb(0.2, 0.2, 0.2)
    });

    page.drawText(`Código de Autenticidade: ${codigo}`, {
      x: 50,
      y: 95,
      size: 11,
      color: rgb(0.5, 0.5, 0.5)
    });

    page.drawText('Documento gerado pela plataforma EloPet PR 2026', {
      x: 145,
      y: 45,
      size: 10
    });

    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificado-${petNome}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: 'Erro interno ao gerar o PDF.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor EloPet operando em http://localhost:${PORT}`);
});