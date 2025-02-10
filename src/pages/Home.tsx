import { Box, Heading, Spinner, Center, Text, SimpleGrid, Card, CardBody, VStack, Flex, Icon, Badge, HStack, CardHeader, Button, Collapse, Stack, FormControl, FormLabel, Input, Select, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Cliente, Orcamento } from '../types';
import { FiFileText, FiUsers, FiDollarSign, FiFilter } from 'react-icons/fi';
import { format } from 'date-fns';

const Home = () => {
  const toast = useToast();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [dadosFiltrados, setDadosFiltrados] = useState<Orcamento[]>([]);

  useEffect(() => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    setDataInicio(primeiroDia.toISOString().split('T')[0]);
    setDataFim(ultimoDia.toISOString().split('T')[0]);
  }, []);

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

  useEffect(() => {
    let resultado = [...orcamentos];

    if (filtroCliente !== 'todos') {
      resultado = resultado.filter(orc => orc.cliente_id.toString() === filtroCliente);
    }

    if (dataInicio && dataFim) {
      resultado = resultado.filter(orc => {
        const data = new Date(orc.data);
        return data >= new Date(dataInicio) && data <= new Date(dataFim);
      });
    }

    setDadosFiltrados(resultado);
  }, [orcamentos, filtroCliente, dataInicio, dataFim]);

  const valorTotal = dadosFiltrados.reduce((total, orcamento) => total + orcamento.valor_total, 0);
  const valorTotalAprovados = dadosFiltrados
    .filter(o => o.status === 'aprovado')
    .reduce((total, orcamento) => total + orcamento.valor_total, 0);
  const valorTotalPendentes = dadosFiltrados
    .filter(o => o.status === 'pendente')
    .reduce((total, orcamento) => total + orcamento.valor_total, 0);

  const ultimosOrcamentos = dadosFiltrados.slice(0, 5);
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
    <Box minH="100vh" h="100%" p={0} bg="gray.50" w="100%">
      <Flex direction="column" h="calc(100vh - 64px)" w="100%">
        <Box px={8} py={4}>
          <Flex
            justify="space-between"
            align="center"
            mb={8}
            direction={{ base: "column", sm: "row" }}
            gap={4}
            w="100%"
          >
            <Heading size="lg" color="gray.700">
              Dashboard
            </Heading>
            <Button
              colorScheme="blue"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              borderRadius="full"
              p={2}
              aria-label={mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            >
              <Icon as={FiFilter} boxSize={5} />
            </Button>
          </Flex>

          {/* Painel de Filtros */}
          <Collapse in={mostrarFiltros} animateOpacity>
            <Card mb={4}>
              <CardBody>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Cliente</FormLabel>
                    <Select
                      value={filtroCliente}
                      onChange={(e) => setFiltroCliente(e.target.value)}
                    >
                      <option value="todos">Todos os clientes</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id.toString()}>
                          {cliente.nome}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Data Início</FormLabel>
                      <Input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Data Fim</FormLabel>
                      <Input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <Flex justify="flex-end" gap={2}>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const hoje = new Date();
                        const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                        const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
                        
                        setDataInicio(primeiroDia.toISOString().split('T')[0]);
                        setDataFim(ultimoDia.toISOString().split('T')[0]);
                        setFiltroCliente('todos');
                        
                        toast({
                          title: 'Filtros resetados',
                          status: 'info',
                          duration: 2000,
                        });
                      }}
                    >
                      Resetar
                    </Button>
                    <Button
                      colorScheme="blue"
                      onClick={() => {
                        setMostrarFiltros(false);
                        toast({
                          title: 'Filtros aplicados',
                          status: 'success',
                          duration: 2000,
                        });
                      }}
                    >
                      Aplicar
                    </Button>
                  </Flex>
                </Stack>
              </CardBody>
            </Card>
          </Collapse>

          {/* Cards de Estatísticas */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 6 }} mt={8}>
            <Card>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Flex justify="space-between" align="center">
                    <Text fontSize="lg" fontWeight="medium">Total de Orçamentos</Text>
                    <Icon as={FiFileText} fontSize="xl" color="brand.500" />
                  </Flex>
                  <Text fontSize="3xl" fontWeight="bold">
                    {dadosFiltrados.length}
                  </Text>
                  <SimpleGrid columns={3} gap={2}>
                    <Box p={2} bg="yellow.50" borderRadius="md">
                      <Text fontSize="xs" color="yellow.600">Pendentes</Text>
                      <Text fontSize="lg" fontWeight="bold" color="yellow.600">
                        {dadosFiltrados.filter(o => o.status === 'pendente').length}
                      </Text>
                    </Box>
                    <Box p={2} bg="green.50" borderRadius="md">
                      <Text fontSize="xs" color="green.600">Aprovados</Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.600">
                        {dadosFiltrados.filter(o => o.status === 'aprovado').length}
                      </Text>
                    </Box>
                    <Box p={2} bg="red.50" borderRadius="md">
                      <Text fontSize="xs" color="red.600">Rejeitados</Text>
                      <Text fontSize="lg" fontWeight="bold" color="red.600">
                        {dadosFiltrados.filter(o => o.status === 'rejeitado').length}
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
                        ? (dadosFiltrados.length / clientes.length).toFixed(1) 
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
      </Flex>
    </Box>
  );
};

export default Home;