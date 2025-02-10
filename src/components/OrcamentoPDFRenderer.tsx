import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Cliente, Orcamento, InformacoesEmpresa } from '../types';

interface OrcamentoPDFRendererProps {
  orcamento: Orcamento;
  cliente: Cliente;
  informacoesEmpresa: InformacoesEmpresa;
}

// Registrar fontes
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
  fontWeight: 300,
});

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
  fontWeight: 400,
});

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
  fontWeight: 500,
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    padding: 30,
    fontSize: 10,
    color: '#333',
  },
  header: {
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 50,
    objectFit: 'contain',
  },
  titleContainer: {
    flex: 1,
  },
  titleContainerWithLogo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 16,
    color: '#2B6CB0',
    marginBottom: 15,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 5,
    backgroundColor: '#F7FAFC',
    padding: 10,
    gap: 40,
  },
  infoColumn: {
    flex: 1,
  },
  infoRow: {
    marginBottom: 5,
  },
  infoLabel: {
    color: '#666',
    marginBottom: 2,
    fontSize: 10,
  },
  infoValue: {
    color: '#333',
    fontSize: 10,
  },
  clienteSection: {
    marginBottom: 5,
  },
  clienteTitle: {
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 5,
  },
  clienteInfo: {
    backgroundColor: '#F7FAFC',
    padding: 10,
    flexDirection: 'row',
    gap: 40,
  },
  clienteColumn: {
    flex: 1,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  descricaoCell: {
    flex: 4,
    paddingRight: 10,
  },
  qtdCell: {
    flex: 1,
    textAlign: 'center',
  },
  valorCell: {
    flex: 2,
    textAlign: 'right',
  },
  subtotalCell: {
    flex: 2,
    textAlign: 'right',
  },
  footerSection: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  observacoesContainer: {
    flex: 1,
  },
  observacoesTitle: {
    fontSize: 10,
    fontWeight: 500,
    marginBottom: 5,
    color: '#333',
  },
  observacoesText: {
    fontSize: 9,
    color: '#333',
    marginBottom: 5,
  },
  total: {
    alignSelf: 'flex-start',
    backgroundColor: '#F7FAFC',
    padding: 10,
    width: '200px',
  },
  totalText: {
    textAlign: 'right',
    fontWeight: 500,
  },
  statusBadge: {
    backgroundColor: '#FEFCBF',
    padding: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#975A16',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: '#F7FAFC',
    padding: 10,
  },
  statusColumn: {
    flex: 1,
  },
  empresaSection: {
    marginBottom: 3,
  },
  empresaTitle: {
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 5,
  },
  assinaturaSection: {
    marginTop: 50,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  assinaturaLinha: {
    width: '50%',
    borderBottomWidth: 1,
    borderColor: '#333',
    marginBottom: 5,
  },
  assinaturaTexto: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    width: '50%',
  },
  assinaturaContainer: {
    alignItems: 'center',
  }
});

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'aprovado':
      return {
        color: '#276749',
        backgroundColor: '#C6F6D5',
      };
    case 'rejeitado':
      return {
        color: '#9B2C2C',
        backgroundColor: '#FED7D7',
      };
    default:
      return {
        color: '#975A16',
        backgroundColor: '#FEFCBF',
      };
  }
};

const OrcamentoPDFRenderer: React.FC<OrcamentoPDFRendererProps> = ({ orcamento, cliente, informacoesEmpresa }) => {
  const hasLogo = Boolean(informacoesEmpresa.logo_url);
  const statusStyle = getStatusStyle(orcamento.status);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        {/* Cabeçalho com Logo e Título */}
        <View style={styles.headerTop}>
          {hasLogo && (
            <Image 
              src={informacoesEmpresa.logo_url!} 
              style={styles.logo}
            />
          )}
          <View style={hasLogo ? styles.titleContainerWithLogo : styles.titleContainer}>
            <Text style={styles.title}>
              ORÇAMENTO #{orcamento.id.toString().padStart(4, '0')}
            </Text>
          </View>
        </View>
        
        {/* Data e Status */}
        <View style={styles.statusRow}>
          <View style={styles.statusColumn}>
            <Text style={styles.infoLabel}>Data</Text>
            <Text style={styles.infoValue}>
              {format(new Date(orcamento.data), 'dd/MM/yyyy', { locale: ptBR })}
            </Text>
          </View>
          <View style={styles.statusColumn}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {orcamento.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Informações da Empresa */}
        <View style={styles.empresaSection}>
          <Text style={styles.empresaTitle}>EMPRESA</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nome</Text>
                <Text style={styles.infoValue}>{informacoesEmpresa.nome_empresa}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>CPF/CNPJ</Text>
                <Text style={styles.infoValue}>{informacoesEmpresa.documento}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{informacoesEmpresa.email}</Text>
              </View>
            </View>
            
            <View style={styles.infoColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Telefone</Text>
                <Text style={styles.infoValue}>{informacoesEmpresa.telefone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Endereço</Text>
                <Text style={styles.infoValue}>{informacoesEmpresa.endereco}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Seção do Cliente */}
      <View style={styles.clienteSection}>
        <Text style={styles.clienteTitle}>CLIENTE</Text>
        <View style={styles.clienteInfo}>
          <View style={styles.clienteColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nome</Text>
              <Text style={styles.infoValue}>{cliente.nome}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CPF/CNPJ</Text>
              <Text style={styles.infoValue}>{cliente.documento}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{cliente.email}</Text>
            </View>
          </View>
          
          <View style={styles.clienteColumn}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Telefone</Text>
              <Text style={styles.infoValue}>{cliente.telefone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Endereço</Text>
              <Text style={styles.infoValue}>{cliente.endereco}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabela de Itens */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.descricaoCell}>Descrição</Text>
          <Text style={styles.qtdCell}>Qtd.</Text>
          <Text style={styles.valorCell}>Valor Unit.</Text>
          <Text style={styles.subtotalCell}>Subtotal</Text>
        </View>
        
        {orcamento.itens?.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.descricaoCell}>{item.descricao}</Text>
            <Text style={styles.qtdCell}>{item.quantidade}</Text>
            <Text style={styles.valorCell}>{formatarMoeda(item.valor_unitario)}</Text>
            <Text style={styles.subtotalCell}>
              {formatarMoeda(item.quantidade * item.valor_unitario)}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer com Observações e Total */}
      <View style={styles.footerSection}>
        <View style={styles.observacoesContainer}>
          <Text style={styles.observacoesTitle}>OBSERVAÇÃO</Text>
          {orcamento.observacoes && (
            <Text style={styles.observacoesText}>{orcamento.observacoes}</Text>
          )}
          {informacoesEmpresa.observacoes_padrao && (
            <Text style={styles.observacoesText}>{informacoesEmpresa.observacoes_padrao}</Text>
          )}
        </View>

        <View style={styles.total}>
          <Text style={styles.totalText}>
            Total: {formatarMoeda(orcamento.valor_total)}
          </Text>
        </View>
      </View>

      {/* Seção de Assinatura */}
      <View style={styles.assinaturaSection}>
        <View style={styles.assinaturaContainer}>
          <View style={styles.assinaturaLinha} />
          <Text style={styles.assinaturaTexto}>
            {cliente.nome}
          </Text>
          <Text style={styles.assinaturaTexto}>
            {cliente.tipo_documento === 'cpf' ? 'CPF' : 'CNPJ'}: {cliente.documento}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default OrcamentoPDFRenderer; 