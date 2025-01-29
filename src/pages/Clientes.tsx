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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  VStack,
  useToast,
  IconButton,
  FormErrorMessage,
  Flex,
  Icon,
  Card,
  CardBody,
  Select,
  Text,
  SimpleGrid,
  HStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FiTrash2, FiPlus, FiEdit2 } from 'react-icons/fi';
import { Cliente } from '../types';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório'),
  tipo_documento: yup.string().oneOf(['cpf', 'cnpj'], 'Selecione o tipo de documento').required('Tipo de documento é obrigatório'),
  documento: yup.string().required('Documento é obrigatório')
    .test('documento', 'Documento inválido', function (value) {
      const tipo = this.parent.tipo_documento;
      if (!value) return false;
      
      // Remove caracteres não numéricos
      const numbers = value.replace(/\D/g, '');
      
      if (tipo === 'cpf') {
        return numbers.length === 11;
      } else if (tipo === 'cnpj') {
        return numbers.length === 14;
      }
      return false;
    }),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  telefone: yup.string().required('Telefone é obrigatório'),
  endereco: yup.string().required('Endereço é obrigatório'),
});

const Clientes = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    register, 
    handleSubmit, 
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<Cliente>({
    resolver: yupResolver(schema)
  });
  const toast = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clienteParaEditar, setClienteParaEditar] = useState<Cliente | null>(null);
  const tipoDocumento = watch('tipo_documento');

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const client = supabase();
      const { data, error } = await client
        .from('clientes')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Erro ao carregar clientes:', error);
        throw error;
      }
      setClientes(data || []);
    } catch (error) {
      console.error('Erro completo:', error);
      toast({
        title: 'Erro ao carregar clientes',
        description: error instanceof Error ? error.message : 'Erro ao conectar com o banco de dados',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditarCliente = (cliente: Cliente) => {
    setClienteParaEditar(cliente);
    // Preenche o formulário com os dados do cliente
    reset(cliente);
    onOpen();
  };

  const onSubmit = async (data: Cliente) => {
    try {
      const client = supabase();
      
      // Remover caracteres não numéricos do documento
      const documento = data.documento.replace(/\D/g, '');
      
      // Remover campos undefined ou vazios
      const clienteData = {
        nome: data.nome.trim(),
        tipo_documento: data.tipo_documento,
        documento: documento,
        email: data.email.trim(),
        telefone: data.telefone.trim(),
        endereco: data.endereco.trim(),
      };

      let error, responseData;

      if (clienteParaEditar) {
        // Atualizar cliente existente
        ({ error, data: responseData } = await client
          .from('clientes')
          .update(clienteData)
          .eq('id', clienteParaEditar.id)
          .select()
          .single());
      } else {
        // Inserir novo cliente
        ({ error, data: responseData } = await client
          .from('clientes')
          .insert([clienteData])
          .select()
          .single());
      }

      if (error) throw error;

      toast({
        title: clienteParaEditar 
          ? 'Cliente atualizado com sucesso'
          : 'Cliente cadastrado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      reset();
      setClienteParaEditar(null);
      carregarClientes();
    } catch (error) {
      console.error('Erro completo:', error);
      toast({
        title: clienteParaEditar 
          ? 'Erro ao atualizar cliente'
          : 'Erro ao cadastrar cliente',
        description: error instanceof Error 
          ? error.message 
          : 'Verifique se todos os campos estão preenchidos corretamente',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const excluirCliente = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      const client = supabase();
      const { error } = await client
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Cliente excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      carregarClientes();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: 'Erro ao excluir cliente',
        description: error instanceof Error 
          ? error.message 
          : 'Não foi possível excluir o cliente',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatarDocumento = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (tipoDocumento === 'cpf') {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (tipoDocumento === 'cnpj') {
      value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    setValue('documento', value);
  };

  return (
    <Box minH="100vh" h="100%" p={{ base: 4, md: 8 }} bg="gray.50">
      <Flex direction="column" h="calc(100vh - 64px)">
        <Flex 
          justify="space-between" 
          align="center" 
          mb={8}
          direction={{ base: "column", sm: "row" }}
          gap={4}
        >
          <Heading size="lg" color="gray.700">Clientes</Heading>
          <Button
            colorScheme="brand"
            leftIcon={<Icon as={FiPlus} />}
            onClick={onOpen}
            w={{ base: "100%", sm: "auto" }}
          >
            Novo Cliente
          </Button>
        </Flex>

        <Card variant="outline" boxShadow="sm" flex={1}>
          <CardBody display="flex" flexDirection="column" p={{ base: 2, md: 4 }}>
            <Box overflowX="auto" flex={1}>
              <Table>
                <Thead display={{ base: "none", md: "table-header-group" }}>
                  <Tr>
                    <Th>NOME</Th>
                    <Th>DOCUMENTO</Th>
                    <Th>EMAIL</Th>
                    <Th>TELEFONE</Th>
                    <Th>ENDEREÇO</Th>
                    <Th>AÇÕES</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {clientes.length === 0 ? (
                    <Tr>
                      <Td colSpan={6}>
                        <Flex justify="center" align="center" h="200px">
                          <Text color="gray.500">Nenhum cliente cadastrado</Text>
                        </Flex>
                      </Td>
                    </Tr>
                  ) : (
                    clientes.map((cliente) => (
                      <Tr 
                        key={cliente.id}
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
                        >
                          <Text 
                            display={{ base: "block", md: "none" }} 
                            fontSize="xs" 
                            color="gray.500"
                            mb={1}
                          >
                            NOME
                          </Text>
                          <Text color="gray.700" fontWeight="medium">
                            {cliente.nome}
                          </Text>
                        </Td>
                        <Td 
                          display={{ base: "flex", md: "table-cell" }}
                          flexDirection="column"
                          border="none"
                          pb={{ base: 2, md: 4 }}
                        >
                          <Text 
                            display={{ base: "block", md: "none" }} 
                            fontSize="xs" 
                            color="gray.500"
                            mb={1}
                          >
                            DOCUMENTO
                          </Text>
                          <Text color="gray.600">
                            {cliente.tipo_documento === 'cpf' ? 'CPF' : 'CNPJ'}: {cliente.documento}
                          </Text>
                        </Td>
                        <Td 
                          display={{ base: "flex", md: "table-cell" }}
                          flexDirection="column"
                          border="none"
                          pb={{ base: 2, md: 4 }}
                        >
                          <Text 
                            display={{ base: "block", md: "none" }} 
                            fontSize="xs" 
                            color="gray.500"
                            mb={1}
                          >
                            EMAIL
                          </Text>
                          <Text color="gray.600">
                            {cliente.email}
                          </Text>
                        </Td>
                        <Td 
                          display={{ base: "flex", md: "table-cell" }}
                          flexDirection="column"
                          border="none"
                          pb={{ base: 2, md: 4 }}
                        >
                          <Text 
                            display={{ base: "block", md: "none" }} 
                            fontSize="xs" 
                            color="gray.500"
                            mb={1}
                          >
                            TELEFONE
                          </Text>
                          <Text color="gray.600">
                            {cliente.telefone}
                          </Text>
                        </Td>
                        <Td 
                          display={{ base: "flex", md: "table-cell" }}
                          flexDirection="column"
                          border="none"
                          pb={{ base: 2, md: 4 }}
                        >
                          <Text 
                            display={{ base: "block", md: "none" }} 
                            fontSize="xs" 
                            color="gray.500"
                            mb={1}
                          >
                            ENDEREÇO
                          </Text>
                          <Text color="gray.600" noOfLines={1}>
                            {cliente.endereco}
                          </Text>
                        </Td>
                        <Td 
                          display={{ base: "flex", md: "table-cell" }}
                          flexDirection="column"
                          border="none"
                          pb={{ base: 0, md: 4 }}
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
                            <IconButton
                              aria-label="Editar cliente"
                              icon={<FiEdit2 size={16} />}
                              colorScheme="brand"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditarCliente(cliente)}
                            />
                            <IconButton
                              aria-label="Excluir cliente"
                              icon={<FiTrash2 size={16} />}
                              colorScheme="red"
                              variant="ghost"
                              size="sm"
                              onClick={() => excluirCliente(cliente.id)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {clienteParaEditar ? 'Editar Cliente' : 'Novo Cliente'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={!!errors.nome}>
                  <FormLabel>Nome</FormLabel>
                  <Input {...register('nome')} />
                  <FormErrorMessage>{errors.nome?.message}</FormErrorMessage>
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired isInvalid={!!errors.tipo_documento}>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <Select {...register('tipo_documento')}>
                      <option value="">Selecione</option>
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                    </Select>
                    <FormErrorMessage>{errors.tipo_documento?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.documento}>
                    <FormLabel>Documento</FormLabel>
                    <Input {...register('documento')} />
                    <FormErrorMessage>{errors.documento?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired isInvalid={!!errors.email}>
                    <FormLabel>Email</FormLabel>
                    <Input type="email" {...register('email')} />
                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.telefone}>
                    <FormLabel>Telefone</FormLabel>
                    <Input {...register('telefone')} />
                    <FormErrorMessage>{errors.telefone?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>

                <FormControl isRequired isInvalid={!!errors.endereco}>
                  <FormLabel>Endereço</FormLabel>
                  <Input {...register('endereco')} />
                  <FormErrorMessage>{errors.endereco?.message}</FormErrorMessage>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  isLoading={isSubmitting}
                  w="100%"
                >
                  {clienteParaEditar ? 'Salvar Alterações' : 'Criar Cliente'}
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Clientes; 