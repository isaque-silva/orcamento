import { 
  Box, 
  SimpleGrid,
  Card, 
  CardBody,
  Icon, 
  Flex, 
  Text,
  Select,
  Input,
  FormControl,
  FormLabel,
  Button,
  useToast,
  Collapse,
  Stack
} from '@chakra-ui/react';
import { FiFilter } from 'react-icons/fi';
import { Orcamento, Cliente } from '../types';
import { useState, useEffect } from 'react';

interface DashboardProps {
  orcamentos: Orcamento[];
  clientes: Cliente[];
}

const Dashboard = ({ orcamentos, clientes }: DashboardProps) => {
  const toast = useToast();
  
  // Estados dos filtros
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState<string>('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [dadosFiltrados, setDadosFiltrados] = useState(orcamentos);

  // Inicializar filtros com o mês atual
  useEffect(() => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    setDataInicio(primeiroDia.toISOString().split('T')[0]);
    setDataFim(ultimoDia.toISOString().split('T')[0]);
  }, []);

  // Aplicar filtros
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

  return (
    <Box>
      {/* Botão de Filtro */}
      <Box 
        position="relative" 
        zIndex="1"
        mb={4}
        bg="white"
        borderRadius="md"
      >
        <Flex justify="space-between" align="center" p={2}>
          <Text fontSize="2xl" fontWeight="bold">Dashboard</Text>
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
      </Box>

      {/* Painel de Filtros */}
      <Box px={2}>
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
      </Box>
    </Box>
  );
};

export default Dashboard; 