import { Page, Text, View, Document, StyleSheet, PDFViewer, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Cliente, Orcamento, InformacoesEmpresa } from '../types';
import { Box } from '@chakra-ui/react';

interface OrcamentoPDFRendererProps {
  orcamento: Orcamento;
  cliente: Cliente;
  informacoesEmpresa: InformacoesEmpresa;
  pdfHeight?: string;
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
    padding: 40,
    fontSize: 10,
    color: '#1A202C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 16,
  },
  logo: {
    width: 120,
    height: 'auto',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 500,
    color: '#2B6CB0',
  },
  subtitle: {
    fontSize: 20,
    color: '#718096',
    fontWeight: 500,
  },
  infoSection: {
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoColumn: {
    flex: 1,
    paddingRight: 16,
  },
  infoRow: {
    marginBottom: 3,
  },
  infoLabel: {
    color: '#718096',
    marginBottom: 1,
  },
  infoValue: {
    color: '#2D3748',
  },
  table: {
    marginTop: 16,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    padding: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    padding: 6,
  },
  tableCell: {
    flex: 1,
  },
  tableCellNumeric: {
    flex: 1,
    textAlign: 'right',
  },
  tableCellDescription: {
    flex: 3,
  },
  totalAndObservationsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  observations: {
    padding: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 4,
    width: '65%',
  },
  totalContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 4,
    width: '30%',
  },
  totalText: {
    fontSize: 12,
    fontWeight: 500,
  },
  contentWrapper: {
    flex: 1,
    flexGrow: 1,
  },
  bottomSection: {
    marginTop: 'auto',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  observationsTitle: {
    fontSize: 11,
    fontWeight: 500,
    marginBottom: 6,
  },
  signature: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  signatureImage: {
    width: 120,
    height: 'auto',
    marginBottom: 6,
  },
  signatureLine: {
    width: '50%',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginVertical: 6,
  },
  footer: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
  },
  statusBadge: {
    padding: 3,
    borderRadius: 4,
    fontSize: 9,
  },
  statusText: {
    textTransform: 'uppercase',
  },
});

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

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
};

const OrcamentoPDFRenderer = ({ orcamento, cliente, informacoesEmpresa, pdfHeight = "80vh" }: OrcamentoPDFRendererProps) => {
  const statusStyle = getStatusStyle(orcamento.status);

  return (
    <Box w="100%" h="100%" minH={pdfHeight}>
      <PDFViewer 
        style={{ 
          width: '100%', 
          height: pdfHeight,
          minHeight: '300px',
          border: 0
        }}
      >
        <Document>
          <Page size="A4" style={styles.page}>
            {/* Cabeçalho */}
            <View style={styles.header}>
              {informacoesEmpresa.logo_url && (
                <Image src={informacoesEmpresa.logo_url} style={styles.logo} />
              )}
              <View style={styles.headerRight}>
                <View style={styles.headerTitle}>
                  <Text style={styles.title}>ORÇAMENTO</Text>
                  <Text style={styles.subtitle}>#{orcamento.id.toString().padStart(4, '0')}</Text>
                </View>
              </View>
            </View>

            <View style={styles.contentWrapper}>
              {/* Informações da Empresa */}
              <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>{informacoesEmpresa.nome_empresa}</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoColumn}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>
                        {informacoesEmpresa.tipo_documento === 'cpf' ? 'CPF' : 'CNPJ'}
                      </Text>
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

              {/* Informações do Cliente e Orçamento */}
              <View style={styles.infoGrid}>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoLabel}>CLIENTE</Text>
                  <View style={[styles.infoSection, { marginTop: 8 }]}>
                    <Text style={styles.infoValue}>{cliente.nome}</Text>
                    <Text style={[styles.infoValue, { marginTop: 4 }]}>{cliente.documento}</Text>
                    <Text style={[styles.infoValue, { marginTop: 4 }]}>{cliente.email}</Text>
                    <Text style={[styles.infoValue, { marginTop: 4 }]}>{cliente.telefone}</Text>
                    <Text style={[styles.infoValue, { marginTop: 4 }]}>{cliente.endereco}</Text>
                  </View>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoLabel}>DETALHES</Text>
                  <View style={[styles.infoSection, { marginTop: 8 }]}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Data</Text>
                      <Text style={styles.infoValue}>
                        {format(new Date(orcamento.data), 'dd/MM/yyyy', { locale: ptBR })}
                      </Text>
                    </View>
                    <View style={[styles.infoRow, { marginTop: 8 }]}>
                      <Text style={styles.infoLabel}>Status</Text>
                      <View style={[styles.statusBadge, statusStyle]}>
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                          {orcamento.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Tabela de Itens */}
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableCellDescription}>Descrição</Text>
                  <Text style={styles.tableCellNumeric}>Qtd.</Text>
                  <Text style={styles.tableCellNumeric}>Valor Unit.</Text>
                  <Text style={styles.tableCellNumeric}>Subtotal</Text>
                </View>
                {orcamento.itens?.map((item, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCellDescription}>{item.descricao}</Text>
                    <Text style={styles.tableCellNumeric}>{item.quantidade}</Text>
                    <Text style={styles.tableCellNumeric}>
                      {formatarMoeda(item.valor_unitario)}
                    </Text>
                    <Text style={styles.tableCellNumeric}>
                      {formatarMoeda(item.quantidade * item.valor_unitario)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Observações e Total lado a lado */}
              <View style={styles.totalAndObservationsContainer}>
                {/* Observações */}
                {(orcamento.observacoes || informacoesEmpresa.observacoes_padrao) && (
                  <View style={styles.observations}>
                    <Text style={styles.observationsTitle}>OBSERVAÇÕES</Text>
                    {orcamento.observacoes && (
                      <Text style={{ marginBottom: orcamento.observacoes && informacoesEmpresa.observacoes_padrao ? 8 : 0 }}>
                        {orcamento.observacoes}
                      </Text>
                    )}
                    {informacoesEmpresa.observacoes_padrao && (
                      <Text style={{ fontSize: 8, color: '#718096' }}>
                        {informacoesEmpresa.observacoes_padrao}
                      </Text>
                    )}
                  </View>
                )}

                {/* Total */}
                <View style={styles.totalContainer}>
                  <Text style={styles.totalText}>
                    Total: {formatarMoeda(orcamento.valor_total)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Seção inferior apenas com assinatura */}
            <View style={styles.bottomSection}>
              {/* Assinatura */}
              {informacoesEmpresa.assinatura_url && (
                <View style={styles.signature}>
                  <Image src={informacoesEmpresa.assinatura_url} style={styles.signatureImage} />
                  <View style={styles.signatureLine} />
                  <Text>{informacoesEmpresa.nome_empresa}</Text>
                </View>
              )}
            </View>
          </Page>
        </Document>
      </PDFViewer>
    </Box>
  );
};

export default OrcamentoPDFRenderer; 