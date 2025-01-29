import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Textarea,
  SimpleGrid,
  Card,
  CardBody,
  Select,
  FormErrorMessage,
  Icon,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { InformacoesEmpresa } from '../types';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FiPlus } from 'react-icons/fi';

const schema = yup.object().shape({
  nome_empresa: yup.string().required('Nome é obrigatório'),
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
  endereco: yup.string().required('Endereço é obrigatório'),
  telefone: yup.string().required('Telefone é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  logo_url: yup.string().url('URL inválida').nullable(),
  assinatura_url: yup.string().url('URL inválida').nullable(),
  observacoes_padrao: yup.string(),
});

const Informacoes = () => {
  const { 
    register, 
    handleSubmit, 
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<InformacoesEmpresa>({
    resolver: yupResolver(schema)
  });
  const toast = useToast();
  const tipoDocumento = watch('tipo_documento');

  useEffect(() => {
    carregarInformacoes();
  }, []);

  const carregarInformacoes = async () => {
    try {
      const client = supabase();
      const { data, error } = await client
        .from('informacoes_empresa')
        .select('*')
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Não encontrado
          throw error;
        }
      }

      if (data) {
        reset(data);
      }
    } catch (error) {
      console.error('Erro ao carregar informações:', error);
      toast({
        title: 'Erro ao carregar informações',
        description: error instanceof Error ? error.message : 'Erro ao conectar com o banco de dados',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const onSubmit = async (data: InformacoesEmpresa) => {
    try {
      const client = supabase();
      
      // Remover caracteres não numéricos do documento
      const documento = data.documento.replace(/\D/g, '');
      
      const { error } = await client
        .from('informacoes_empresa')
        .upsert({
          ...data,
          documento,
        });

      if (error) throw error;

      toast({
        title: 'Informações salvas com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      carregarInformacoes();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar informações',
        description: error instanceof Error ? error.message : 'Verifique os dados e tente novamente',
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
    <Box p={{ base: 4, md: 6 }}>
      <Heading size="lg" mb={8}>Minhas Informações</Heading>
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isInvalid={!!errors.nome_empresa}>
                  <FormLabel>Nome da Empresa/Pessoa</FormLabel>
                  <Input {...register('nome_empresa')} />
                  <FormErrorMessage>{errors.nome_empresa?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.tipo_documento}>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select {...register('tipo_documento')}>
                    <option value="">Selecione</option>
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                  </Select>
                  <FormErrorMessage>{errors.tipo_documento?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.documento}>
                  <FormLabel>{tipoDocumento === 'cpf' ? 'CPF' : 'CNPJ'}</FormLabel>
                  <Input
                    {...register('documento')}
                    onChange={formatarDocumento}
                    maxLength={tipoDocumento === 'cpf' ? 14 : 18}
                    placeholder={tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                  />
                  <FormErrorMessage>{errors.documento?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.endereco}>
                  <FormLabel>Endereço</FormLabel>
                  <Input {...register('endereco')} />
                  <FormErrorMessage>{errors.endereco?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.telefone}>
                  <FormLabel>Telefone</FormLabel>
                  <Input {...register('telefone')} />
                  <FormErrorMessage>{errors.telefone?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>Email</FormLabel>
                  <Input {...register('email')} type="email" />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.logo_url}>
                  <FormLabel>URL da Logo</FormLabel>
                  <Input {...register('logo_url')} />
                  <FormErrorMessage>{errors.logo_url?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.assinatura_url}>
                  <FormLabel>URL da Assinatura Digital</FormLabel>
                  <Input {...register('assinatura_url')} />
                  <FormErrorMessage>{errors.assinatura_url?.message}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>

              <FormControl isInvalid={!!errors.observacoes_padrao}>
                <FormLabel>Observações Padrão para Orçamentos</FormLabel>
                <Textarea
                  {...register('observacoes_padrao')}
                  placeholder="Observações que aparecerão em todos os orçamentos"
                  rows={4}
                />
                <FormErrorMessage>{errors.observacoes_padrao?.message}</FormErrorMessage>
              </FormControl>

              <Box display="flex" justifyContent="center" w="full">
                <Button
                  colorScheme="blue"
                  size="lg"
                  type="submit"
                  isLoading={isSubmitting}
                  borderRadius="full"
                  px={8}
                  w={{ base: "100%", md: "auto" }}
                >
                  Salvar Informações
                </Button>
              </Box>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Informacoes; 