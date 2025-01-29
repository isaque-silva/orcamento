import { Box, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Card, CardBody, Icon, Flex, Text } from '@chakra-ui/react';
import { FiUsers, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { Orcamento, Cliente } from '../types';

interface DashboardProps {
  orcamentos: Orcamento[];
  clientes: Cliente[];
}

const Dashboard = ({ orcamentos, clientes }: DashboardProps) => {
  console.log('Dashboard - Props recebidas:', { orcamentos, clientes });

  if (!Array.isArray(orcamentos) || !Array.isArray(clientes)) {
    console.error('Dashboard - Dados inválidos:', { orcamentos, clientes });
    return (
      <Box p={8}>
        <Text color="red.500">Erro ao carregar dados do dashboard</Text>
      </Box>
    );
  }

  // Calcula as estatísticas
  const totalClientes = clientes.length;
  const orcamentosPendentes = orcamentos.filter(orc => orc?.status === 'pendente').length;
  const orcamentosAprovados = orcamentos.filter(orc => orc?.status === 'aprovado').length;
  const orcamentosRejeitados = orcamentos.filter(orc => orc?.status === 'rejeitado').length;

  console.log('Dashboard - Estatísticas calculadas:', {
    totalClientes,
    orcamentosPendentes,
    orcamentosAprovados,
    orcamentosRejeitados
  });

  // Calcula o valor total dos orçamentos aprovados
  const valorTotalAprovados = orcamentos
    .filter(orc => orc?.status === 'aprovado')
    .reduce((total, orc) => total + (Number(orc?.valor_total) || 0), 0);

  console.log('Dashboard - Valor total aprovados:', valorTotalAprovados);

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const cards = [
    {
      label: 'Total de Clientes',
      value: totalClientes,
      icon: FiUsers,
      color: 'blue.500',
      helpText: 'Clientes cadastrados'
    },
    {
      label: 'Orçamentos Pendentes',
      value: orcamentosPendentes,
      icon: FiClock,
      color: 'yellow.500',
      helpText: 'Aguardando aprovação'
    },
    {
      label: 'Orçamentos Aprovados',
      value: orcamentosAprovados,
      icon: FiCheckCircle,
      color: 'green.500',
      helpText: formatarMoeda(valorTotalAprovados)
    },
    {
      label: 'Orçamentos Rejeitados',
      value: orcamentosRejeitados,
      icon: FiXCircle,
      color: 'red.500',
      helpText: 'Não aprovados'
    }
  ];

  console.log('Dashboard - Cards gerados:', cards);

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="100%">
      {cards.map((card, index) => (
        <Card 
          key={index} 
          variant="outline" 
          borderRadius="lg"
          boxShadow="sm"
          _hover={{ 
            transform: 'translateY(-2px)',
            boxShadow: 'md'
          }}
          transition="all 0.2s"
        >
          <CardBody>
            <Flex alignItems="center" mb={4}>
              <Box
                p={3}
                borderRadius="lg"
                bg={`${card.color}.50`}
                color={card.color}
                mr={4}
              >
                <Icon as={card.icon} boxSize={6} />
              </Box>
              <Text color="gray.600" fontSize="sm" fontWeight="medium">
                {card.label}
              </Text>
            </Flex>
            <Stat>
              <StatNumber fontSize="3xl" fontWeight="bold" color="gray.700">
                {card.value}
              </StatNumber>
              <StatHelpText color="gray.500" fontSize="sm" mt={2}>
                {card.helpText}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
};

export default Dashboard; 