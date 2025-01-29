import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
  NumberInput,
  NumberInputField,
  Textarea,
  IconButton,
  Badge,
  SimpleGrid,
  Text,
  Flex,
  Card,
  CardBody,
  Icon,
  HStack,
} from '@chakra-ui/react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Cliente, Orcamento, ItemOrcamento, InformacoesEmpresa } from '../types';
import { FiTrash2, FiPrinter, FiPlus, FiX, FiEdit2, FiCheck, FiX as FiXCircle } from 'react-icons/fi';
import OrcamentoPDF from '../components/OrcamentoPDF';
import { format } from 'date-fns';

interface OrcamentoForm {
  cliente_id: string;
  data: string;
  status?: 'pendente' | 'aprovado' | 'rejeitado';
  observacoes?: string;
  itens: {
    descricao: string;
    quantidade: number;
    valor_unitario: number;
  }[];
}

const formatarMoeda = (valor: number | string): string => {
  if (typeof valor === 'string') {
    // Remove tudo exceto números
    valor = valor.replace(/\D/g, '');
    
    // Converte para centavos (divide por 100)
    const centavos = valor.length > 0 ? (Number(valor) / 100).toFixed(2) : '0.00';
    
    // Formata no padrão brasileiro
    return Number(centavos).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parseMoeda = (valor: string): number => {
  // Remove tudo exceto números
  const apenasNumeros = valor.replace(/\D/g, '');
  // Converte para centavos
  return Number(apenasNumeros) / 100;
};

const Orcamentos = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { register, handleSubmit, reset, control, watch, isSubmitting, setValue } = useForm<OrcamentoForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'itens',
  });
  const toast = useToast();
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orcamentoParaImprimir, setOrcamentoParaImprimir] = useState<Orcamento | null>(null);
  const [informacoesEmpresa, setInformacoesEmpresa] = useState<InformacoesEmpresa | null>(null);
  const impressaoDisclosure = useDisclosure();
  const [orcamentoParaEditar, setOrcamentoParaEditar] = useState<Orcamento | null>(null);

  useEffect(() => {
    carregarDados();
    carregarInformacoesEmpresa();
  }, []);

  const carregarDados = async () => {
    try {
      const client = supabase();
      
      // Carregar orçamentos com itens
      const { data: orcamentos, error: orcamentosError } = await client
        .from('orcamentos')
        .select(`
          *,
          itens:itens_orcamento(*)
        `)
        .order('created_at', { ascending: false });

      if (orcamentosError) {
        console.error('Erro ao carregar orçamentos:', orcamentosError);
        throw orcamentosError;
      }

      // Carregar clientes
      const { data: clientes, error: clientesError } = await client
        .from('clientes')
        .select('*')
        .order('nome');

      if (clientesError) {
        console.error('Erro ao carregar clientes:', clientesError);
        throw clientesError;
      }

      // Atualizar o estado com tipagem segura
      const orcamentosProcessados = orcamentos?.map(orcamento => ({
        ...orcamento,
        itens: Array.isArray(orcamento.itens) ? orcamento.itens : []
      })) || [];

      console.log('Orçamentos processados:', orcamentosProcessados);
      
      setOrcamentos(orcamentosProcessados as Orcamento[]);
      setClientes(clientes as Cliente[]);
    } catch (error) {
      console.error('Erro completo:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: error instanceof Error ? error.message : 'Erro ao conectar com o banco de dados',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const carregarInformacoesEmpresa = async () => {
    try {
      const client = supabase();
      const { data, error } = await client
        .from('informacoes_empresa')
        .select('id, nome_empresa, documento, tipo_documento, endereco, telefone, email, logo_url, assinatura_url, observacoes_padrao, created_at')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setInformacoesEmpresa(data as InformacoesEmpresa);
    } catch (error) {
      console.error('Erro ao carregar informações da empresa:', error);
      toast({
        title: 'Erro ao carregar informações da empresa',
        description: 'Configure as informações da empresa antes de imprimir orçamentos',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditarOrcamento = async (orcamento: Orcamento) => {
    try {
      const client = supabase();
      const { data: orcamentoCompleto, error } = await client
        .from('orcamentos')
        .select(`
          *,
          itens:itens_orcamento(*)
        `)
        .eq('id', orcamento.id)
        .single();

      if (error) throw error;

      if (!orcamentoCompleto) {
        throw new Error('Orçamento não encontrado');
      }

      // Formatar os valores dos itens antes de setar no formulário
      const itensFormatados = orcamentoCompleto.itens?.map(item => ({
        ...item,
        valor_unitario: formatarMoeda(item.valor_unitario)
      }));

      setOrcamentoParaEditar(orcamentoCompleto as Orcamento);
      reset({
        cliente_id: orcamentoCompleto.cliente_id,
        data: orcamentoCompleto.data,
        status: orcamentoCompleto.status,
        observacoes: orcamentoCompleto.observacoes,
        itens: itensFormatados || []
      });
      onOpen();
    } catch (error) {
      console.error('Erro ao carregar orçamento para edição:', error);
      toast({
        title: 'Erro ao carregar orçamento',
        description: 'Não foi possível carregar os dados do orçamento',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const onSubmit = async (data: OrcamentoForm) => {
    try {
      const client = supabase();
      
      // Processar os itens para garantir que os valores estejam corretos
      const itensProcessados = data.itens.map(item => ({
        ...item,
        quantidade: Number(item.quantidade),
        valor_unitario: parseMoeda(item.valor_unitario.toString())
      }));
      
      const orcamentoData = {
        cliente_id: data.cliente_id,
        data: data.data,
        status: data.status || 'pendente',
        observacoes: data.observacoes,
        valor_total: itensProcessados.reduce((total, item) => 
          total + (item.quantidade * item.valor_unitario), 0
        ),
      };

      let error, orcamentoCriado;

      if (orcamentoParaEditar) {
        // Atualizar orçamento existente
        ({ error, data: orcamentoCriado } = await client
          .from('orcamentos')
          .update(orcamentoData)
          .eq('id', orcamentoParaEditar.id)
          .select()
          .single());
      } else {
        // Criar novo orçamento
        ({ error, data: orcamentoCriado } = await client
          .from('orcamentos')
          .insert([orcamentoData])
          .select()
          .single());
      }

      if (error) throw error;

      // Atualizar ou criar itens
      if (orcamentoParaEditar) {
        // Excluir itens antigos
        await client
          .from('itens_orcamento')
          .delete()
          .eq('orcamento_id', orcamentoParaEditar.id);
      }

      // Inserir novos itens
      const itensData = itensProcessados.map(item => ({
        orcamento_id: orcamentoCriado.id,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
      }));

      const { error: itensError } = await client
        .from('itens_orcamento')
        .insert(itensData);

      if (itensError) throw itensError;

      toast({
        title: orcamentoParaEditar 
          ? 'Orçamento atualizado com sucesso'
          : 'Orçamento criado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      reset();
      setOrcamentoParaEditar(null);
      carregarDados();
    } catch (error) {
      console.error('Erro completo:', error);
      toast({
        title: orcamentoParaEditar 
          ? 'Erro ao atualizar orçamento'
          : 'Erro ao criar orçamento',
        description: error instanceof Error 
          ? error.message 
          : 'Verifique se todos os campos estão preenchidos corretamente',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const excluirOrcamento = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este orçamento?')) return;

    try {
      const client = supabase();

      // Primeiro exclui os itens do orçamento
      const { error: erroItens } = await client
        .from('itens_orcamento')
        .delete()
        .eq('orcamento_id', id);

      if (erroItens) throw erroItens;

      // Depois exclui o orçamento
      const { error } = await client
        .from('orcamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Orçamento excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: 'Erro ao excluir orçamento',
        description: error instanceof Error 
          ? error.message 
          : 'Não foi possível excluir o orçamento',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
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

  const handleImprimir = async (orcamento: Orcamento) => {
    if (!informacoesEmpresa) {
      toast({
        title: 'Configuração necessária',
        description: 'Configure as informações da empresa antes de imprimir orçamentos',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      // Carregar o orçamento com seus itens
      const client = supabase();
      const { data: orcamentoCompleto, error } = await client
        .from('orcamentos')
        .select(`
          *,
          itens:itens_orcamento(*)
        `)
        .eq('id', orcamento.id)
        .single();

      if (error) throw error;

      if (!orcamentoCompleto) {
        throw new Error('Orçamento não encontrado');
      }

      // Processar o orçamento para garantir que itens seja um array
      const orcamentoProcessado = {
        ...orcamentoCompleto,
        itens: Array.isArray(orcamentoCompleto.itens) ? orcamentoCompleto.itens : []
      };

      console.log('Orçamento para impressão:', orcamentoProcessado);
      
      setOrcamentoParaImprimir(orcamentoProcessado as Orcamento);
      impressaoDisclosure.onOpen();
    } catch (error) {
      console.error('Erro ao carregar orçamento para impressão:', error);
      toast({
        title: 'Erro ao preparar impressão',
        description: 'Não foi possível carregar os dados do orçamento',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const atualizarStatus = async (orcamento: Orcamento, novoStatus: 'aprovado' | 'rejeitado' | 'pendente') => {
    try {
      const client = supabase();
      const { error } = await client
        .from('orcamentos')
        .update({ status: novoStatus })
        .eq('id', orcamento.id);

      if (error) throw error;

      toast({
        title: `Orçamento ${novoStatus}`,
        status: novoStatus === 'aprovado' ? 'success' : novoStatus === 'rejeitado' ? 'error' : 'info',
        duration: 3000,
        isClosable: true,
      });

      carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro ao atualizar status',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

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
            <Heading size="lg" color="gray.700">Orçamentos</Heading>
            <Button
              colorScheme="brand"
              leftIcon={<Icon as={FiPlus} />}
              onClick={() => {
                setOrcamentoParaEditar(null);
                reset({} as OrcamentoForm);
                onOpen();
              }}
              w={{ base: "100%", sm: "auto" }}
            >
              Novo Orçamento
            </Button>
          </Flex>
        </Box>

        <Card variant="outline" boxShadow="none" flex={1} w="100%" borderRadius="0">
          <CardBody p={0}>
            <Box overflowX="auto" w="100%">
              <Table variant="simple" w="100%">
                <Thead bg="gray.50" display={{ base: "none", md: "table-header-group" }}>
                  <Tr>
                    <Th width="25%" pl={8}>CLIENTE</Th>
                    <Th width="15%">DATA</Th>
                    <Th width="20%">VALOR TOTAL</Th>
                    <Th width="15%">STATUS</Th>
                    <Th width="25%" pr={8}>AÇÕES</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {orcamentos.length === 0 ? (
                    <Tr>
                      <Td colSpan={5}>
                        <Flex justify="center" align="center" h="200px">
                          <Text color="gray.500">Nenhum orçamento cadastrado</Text>
                        </Flex>
                      </Td>
                    </Tr>
                  ) : (
                    orcamentos.map((orcamento) => {
                      const cliente = clientes.find(c => c.id === orcamento.cliente_id);
                      return (
                        <Tr 
                          key={orcamento.id}
                          display={{ base: "flex", md: "table-row" }}
                          flexDirection={{ base: "column", md: "inherit" }}
                          p={{ base: 4, md: 0 }}
                          mb={{ base: 4, md: 0 }}
                          bg="white"
                          boxShadow={{ base: "sm", md: "none" }}
                          borderRadius={{ base: "md", md: "none" }}
                        >
                          <Td 
                            display={{ base: "flex", md: "table-cell" }}
                            flexDirection="column"
                            border="none"
                            pb={{ base: 2, md: 4 }}
                            width={{ md: "25%" }}
                            pl={8}
                          >
                            <Text 
                              display={{ base: "block", md: "none" }} 
                              fontSize="xs" 
                              color="gray.500"
                              mb={1}
                            >
                              CLIENTE
                            </Text>
                            <Text color="gray.700" fontWeight="medium">
                              {cliente?.nome}
                            </Text>
                          </Td>
                          <Td 
                            display={{ base: "flex", md: "table-cell" }}
                            flexDirection="column"
                            border="none"
                            pb={{ base: 2, md: 4 }}
                            width={{ md: "15%" }}
                          >
                            <Text 
                              display={{ base: "block", md: "none" }} 
                              fontSize="xs" 
                              color="gray.500"
                              mb={1}
                            >
                              DATA
                            </Text>
                            <Text color="gray.600">
                              {format(new Date(orcamento.data), 'dd/MM/yyyy')}
                            </Text>
                          </Td>
                          <Td 
                            display={{ base: "flex", md: "table-cell" }}
                            flexDirection="column"
                            border="none"
                            pb={{ base: 2, md: 4 }}
                            width={{ md: "20%" }}
                          >
                            <Text 
                              display={{ base: "block", md: "none" }} 
                              fontSize="xs" 
                              color="gray.500"
                              mb={1}
                            >
                              VALOR TOTAL
                            </Text>
                            <Text color="gray.600">
                              {formatarMoeda(orcamento.valor_total)}
                            </Text>
                          </Td>
                          <Td 
                            display={{ base: "flex", md: "table-cell" }}
                            flexDirection="column"
                            border="none"
                            pb={{ base: 2, md: 4 }}
                            width={{ md: "15%" }}
                          >
                            <Text 
                              display={{ base: "block", md: "none" }} 
                              fontSize="xs" 
                              color="gray.500"
                              mb={1}
                            >
                              STATUS
                            </Text>
                            <Badge
                              colorScheme={getStatusColor(orcamento.status)}
                              textTransform="uppercase"
                            >
                              {orcamento.status}
                            </Badge>
                          </Td>
                          <Td 
                            display={{ base: "flex", md: "table-cell" }}
                            flexDirection="column"
                            border="none"
                            pb={{ base: 0, md: 4 }}
                            width={{ md: "25%" }}
                            pr={8}
                          >
                            <Text 
                              display={{ base: "block", md: "none" }} 
                              fontSize="xs" 
                              color="gray.500"
                              mb={1}
                            >
                              AÇÕES
                            </Text>
                            <HStack spacing={2} justify={{ base: "flex-start", md: "flex-end" }}>
                              {orcamento.status === 'pendente' && (
                                <>
                                  <IconButton
                                    aria-label="Aprovar orçamento"
                                    icon={<FiCheck size={16} />}
                                    colorScheme="green"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => atualizarStatus(orcamento, 'aprovado')}
                                  />
                                  <IconButton
                                    aria-label="Rejeitar orçamento"
                                    icon={<FiXCircle size={16} />}
                                    colorScheme="red"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => atualizarStatus(orcamento, 'rejeitado')}
                                  />
                                </>
                              )}
                              <IconButton
                                aria-label="Editar orçamento"
                                icon={<FiEdit2 size={16} />}
                                colorScheme="brand"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditarOrcamento(orcamento)}
                              />
                              <IconButton
                                aria-label="Imprimir orçamento"
                                icon={<FiPrinter size={16} />}
                                colorScheme="brand"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleImprimir(orcamento)}
                              />
                              <IconButton
                                aria-label="Excluir orçamento"
                                icon={<FiTrash2 size={16} />}
                                colorScheme="red"
                                variant="ghost"
                                size="sm"
                                onClick={() => excluirOrcamento(orcamento.id)}
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      );
                    })
                  )}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      </Flex>

      {/* Modal de Criação/Edição */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size={{ base: "full", md: "2xl" }}
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {orcamentoParaEditar ? 'Editar Orçamento' : 'Novo Orçamento'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={6} align="stretch">
                <Card variant="outline">
                  <CardBody>
                    <VStack spacing={4}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                        <FormControl isRequired>
                          <FormLabel fontWeight="medium">Cliente</FormLabel>
                          <Select {...register('cliente_id')} placeholder="Selecione um cliente">
                            {clientes.map((cliente) => (
                              <option key={cliente.id} value={cliente.id}>
                                {cliente.nome} - {cliente.tipo_documento === 'cpf' ? 'CPF' : 'CNPJ'}: {cliente.documento}
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel fontWeight="medium">Data</FormLabel>
                          <Input type="date" {...register('data')} />
                        </FormControl>
                      </SimpleGrid>

                      <FormControl>
                        <FormLabel fontWeight="medium">Status</FormLabel>
                        <Select {...register('status')} defaultValue="pendente">
                          <option value="pendente">Pendente</option>
                          <option value="aprovado">Aprovado</option>
                          <option value="rejeitado">Rejeitado</option>
                        </Select>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                <Card variant="outline">
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Flex 
                        justify="space-between" 
                        align="center"
                        direction={{ base: "column", sm: "row" }}
                        gap={4}
                      >
                        <Text fontSize="lg" fontWeight="medium">Itens do Orçamento</Text>
                        <Button
                          size="sm"
                          colorScheme="brand"
                          leftIcon={<Icon as={FiPlus} />}
                          onClick={() => append({ descricao: '', quantidade: 1, valor_unitario: 0 })}
                          w={{ base: "100%", sm: "auto" }}
                        >
                          Adicionar Item
                        </Button>
                      </Flex>

                      {fields.length === 0 ? (
                        <Flex justify="center" align="center" h="100px" bg="gray.50" borderRadius="md">
                          <Text color="gray.500">Nenhum item adicionado</Text>
                        </Flex>
                      ) : (
                        <VStack spacing={4} align="stretch">
                          {fields.map((field, index) => (
                            <Card key={field.id} variant="outline" bg="gray.50">
                              <CardBody>
                                <VStack spacing={4} align="stretch">
                                  <FormControl isRequired>
                                    <FormLabel fontWeight="medium">Descrição</FormLabel>
                                    <Input 
                                      {...register(`itens.${index}.descricao`)} 
                                      bg="white"
                                      placeholder="Ex: Serviço de manutenção"
                                    />
                                  </FormControl>

                                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                                    <FormControl isRequired>
                                      <FormLabel fontWeight="medium">Quantidade</FormLabel>
                                      <NumberInput min={1} bg="white">
                                        <NumberInputField
                                          {...register(`itens.${index}.quantidade`)}
                                          placeholder="Ex: 1"
                                        />
                                      </NumberInput>
                                    </FormControl>

                                    <FormControl isRequired>
                                      <FormLabel fontWeight="medium">Valor Unitário</FormLabel>
                                      <Input
                                        {...register(`itens.${index}.valor_unitario`)}
                                        bg="white"
                                        placeholder="0,00"
                                        onChange={(e) => {
                                          const formattedValue = formatarMoeda(e.target.value);
                                          setValue(`itens.${index}.valor_unitario`, formattedValue);
                                        }}
                                      />
                                    </FormControl>
                                  </SimpleGrid>

                                  <Box alignSelf="flex-end">
                                    <IconButton
                                      aria-label="Remover item"
                                      icon={<FiTrash2 />}
                                      colorScheme="red"
                                      variant="ghost"
                                      onClick={() => remove(index)}
                                    />
                                  </Box>
                                </VStack>
                              </CardBody>
                            </Card>
                          ))}
                        </VStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                <Card variant="outline">
                  <CardBody>
                    <FormControl>
                      <FormLabel fontWeight="medium">Observações</FormLabel>
                      <Textarea 
                        {...register('observacoes')} 
                        placeholder="Digite aqui observações adicionais sobre o orçamento..."
                        rows={4}
                      />
                    </FormControl>
                  </CardBody>
                </Card>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  isLoading={isSubmitting}
                  leftIcon={<Icon as={orcamentoParaEditar ? FiEdit2 : FiPlus} />}
                >
                  {orcamentoParaEditar ? 'Salvar Alterações' : 'Criar Orçamento'}
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de Impressão */}
      <Modal
        isOpen={impressaoDisclosure.isOpen}
        onClose={impressaoDisclosure.onClose}
        size={{ base: "full", lg: "6xl" }}
        scrollBehavior="inside"
        motionPreset="none"
      >
        <ModalOverlay />
        <ModalContent 
          h={{ base: "100vh", lg: "auto" }}
          m={0}
          rounded="none"
        >
          <ModalHeader 
            borderBottom="1px" 
            borderColor="gray.200"
            position="sticky"
            top={0}
            bg="white"
            zIndex={1}
          >
            Visualizar Orçamento
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody 
            p={0}
            display="flex"
            flexDirection="column"
            flex={1}
          >
            {orcamentoParaImprimir && informacoesEmpresa && (
              <Box flex={1} h="100%">
                <OrcamentoPDF
                  orcamento={orcamentoParaImprimir}
                  cliente={clientes.find(c => c.id === orcamentoParaImprimir.cliente_id)!}
                  informacoesEmpresa={informacoesEmpresa}
                />
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Orcamentos; 