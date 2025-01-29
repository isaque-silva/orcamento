import { Box, Heading, Spinner, Center, Text, SimpleGrid, Card, CardBody, VStack, Flex, Icon, Badge, HStack, CardHeader } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Cliente, Orcamento } from '../types';
import { FiFileText, FiUsers, FiDollarSign } from 'react-icons/fi';
import { format } from 'date-fns';

const Home = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const client = supabase();
      const { data: orcamentosData, error: orcamentosError } = await client
        .from('orcamentos')
        .select('*')
        .order('created_at', { ascending: false });

      if (orcamentosError) throw orcamentosError;

      const { data: clientesData, error: clientesError } = await client
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientesError) throw clientesError;

      setOrcamentos(orcamentosData as Orcamento[]);
      setClientes(clientesData as Cliente[]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'green';
      case 'rejeitado':
        return 'red';
      default:
        return 'yellow';
    }
  };

  const valorTotal = orcamentos.reduce((total, orcamento) => total + orcamento.valor_total, 0);
  const valorTotalAprovados = orcamentos
    .filter(o => o.status === 'aprovado')
    .reduce((total, orcamento) => total + orcamento.valor_total, 0);
  const valorTotalPendentes = orcamentos
    .filter(o => o.status === 'pendente')
    .reduce((total, orcamento) => total + orcamento.valor_total, 0);

  const ultimosOrcamentos = orcamentos.slice(0, 5);
  const ultimosClientes = clientes.slice(0, 5);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh" flexDirection="column">
        <Text color="red.500" mb={4}>{error}</Text>
        <Box 
          as="button" 
          color="brand.500"
          onClick={() => carregarDados()}
          _hover={{ textDecoration: 'underline' }}
        >
          Tentar novamente
        </Box>
      </Center>
    );
  }

  return (
    <Box minH="100vh" p={{ base: 4, md: 8 }}>
      <Box maxW="1400px" mx="auto">
        <Heading size="lg" mb={8} color="gray.700">Dashboard</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center">
                  <Text fontSize="lg" fontWeight="medium">Total de Orçamentos</Text>
                  <Icon as={FiFileText} fontSize="xl" color="brand.500" />
                </Flex>
                <Text fontSize="3xl" fontWeight="bold">
                  {orcamentos.length}
                </Text>
                <SimpleGrid columns={3} gap={2}>
                  <Box p={2} bg="yellow.50" borderRadius="md">
                    <Text fontSize="xs" color="yellow.600">Pendentes</Text>
                    <Text fontSize="lg" fontWeight="bold" color="yellow.600">
                      {orcamentos.filter(o => o.status === 'pendente').length}
                    </Text>
                  </Box>
                  <Box p={2} bg="green.50" borderRadius="md">
                    <Text fontSize="xs" color="green.600">Aprovados</Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                      {orcamentos.filter(o => o.status === 'aprovado').length}
                    </Text>
                  </Box>
                  <Box p={2} bg="red.50" borderRadius="md">
                    <Text fontSize="xs" color="red.600">Rejeitados</Text>
                    <Text fontSize="lg" fontWeight="bold" color="red.600">
                      {orcamentos.filter(o => o.status === 'rejeitado').length}
                    </Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center">
                  <Text fontSize="lg" fontWeight="medium">Total de Clientes</Text>
                  <Icon as={FiUsers} fontSize="xl" color="brand.500" />
                </Flex>
                <Text fontSize="3xl" fontWeight="bold">
                  {clientes.length}
                </Text>
                <Box p={2} bg="brand.50" borderRadius="md">
                  <Text fontSize="xs" color="brand.600">Orçamentos por Cliente</Text>
                  <Text fontSize="lg" fontWeight="bold" color="brand.600">
                    {clientes.length > 0 
                      ? (orcamentos.length / clientes.length).toFixed(1) 
                      : '0.0'}
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center">
                  <Text fontSize="lg" fontWeight="medium">Valor Total</Text>
                  <Icon as={FiDollarSign} fontSize="xl" color="brand.500" />
                </Flex>
                <Text fontSize="3xl" fontWeight="bold">
                  {formatarMoeda(valorTotal)}
                </Text>
                <SimpleGrid columns={2} gap={2}>
                  <Box p={2} bg="green.50" borderRadius="md">
                    <Text fontSize="xs" color="green.600">Aprovados</Text>
                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                      {formatarMoeda(valorTotalAprovados)}
                    </Text>
                  </Box>
                  <Box p={2} bg="yellow.50" borderRadius="md">
                    <Text fontSize="xs" color="yellow.600">Pendentes</Text>
                    <Text fontSize="lg" fontWeight="bold" color="yellow.600">
                      {formatarMoeda(valorTotalPendentes)}
                    </Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mt={8}>
          <Card>
            <CardHeader>
              <Heading size="md">Últimos Orçamentos</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {ultimosOrcamentos.length === 0 ? (
                  <Text color="gray.500" textAlign="center">Nenhum orçamento cadastrado</Text>
                ) : (
                  ultimosOrcamentos.map(orcamento => {
                    const cliente = clientes.find(c => c.id === orcamento.cliente_id);
                    return (
                      <Box 
                        key={orcamento.id} 
                        p={4} 
                        bg="gray.50" 
                        borderRadius="md"
                        display="flex"
                        flexDirection={{ base: "column", sm: "row" }}
                        gap={{ base: 2, sm: 0 }}
                        justifyContent="space-between"
                        alignItems={{ base: "flex-start", sm: "center" }}
                      >
                        <VStack align="flex-start" spacing={1}>
                          <Text fontWeight="medium">{cliente?.nome}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {format(new Date(orcamento.data), 'dd/MM/yyyy')}
                          </Text>
                        </VStack>
                        <HStack spacing={4}>
                          <Text fontWeight="medium">
                            {formatarMoeda(orcamento.valor_total)}
                          </Text>
                          <Badge colorScheme={getStatusColor(orcamento.status)}>
                            {orcamento.status}
                          </Badge>
                        </HStack>
                      </Box>
                    );
                  })
                )}
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Heading size="md">Últimos Clientes</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {ultimosClientes.length === 0 ? (
                  <Text color="gray.500" textAlign="center">Nenhum cliente cadastrado</Text>
                ) : (
                  ultimosClientes.map(cliente => (
                    <Box 
                      key={cliente.id} 
                      p={4} 
                      bg="gray.50" 
                      borderRadius="md"
                      display="flex"
                      flexDirection={{ base: "column", sm: "row" }}
                      gap={{ base: 2, sm: 0 }}
                      justifyContent="space-between"
                      alignItems={{ base: "flex-start", sm: "center" }}
                    >
                      <VStack align="flex-start" spacing={1}>
                        <Text fontWeight="medium">{cliente.nome}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {cliente.tipo_documento === 'cpf' ? 'CPF' : 'CNPJ'}: {cliente.documento}
                        </Text>
                      </VStack>
                      <VStack align={{ base: "flex-start", sm: "flex-end" }} spacing={1}>
                        <Text fontSize="sm">{cliente.email}</Text>
                        <Text fontSize="sm" color="gray.600">{cliente.telefone}</Text>
                      </VStack>
                    </Box>
                  ))
                )}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default Home;